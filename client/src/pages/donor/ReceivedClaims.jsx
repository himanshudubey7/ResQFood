import { useEffect, useState } from 'react';
import { claimsAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatDateTime, getStatusColor, getStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const getOtpMetaLabel = (claim) => {
  if (!claim?.deliveryOtpSentAt) return 'Send OTP';
  return 'Resend OTP';
};

const ReceivedClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingOtpFor, setSendingOtpFor] = useState('');
  const [verifyingOtpFor, setVerifyingOtpFor] = useState('');
  const [otpModalClaim, setOtpModalClaim] = useState(null);
  const [otpValue, setOtpValue] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await claimsAPI.getReceived({ limit: 100 });
      setClaims(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load received claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleSendOtp = async (claimId) => {
    try {
      setSendingOtpFor(claimId);
      await claimsAPI.sendDeliveryOtp(claimId);
      toast.success('OTP sent to NGO email');
      await fetchClaims();
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setSendingOtpFor('');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpModalClaim) return;
    try {
      setVerifyingOtpFor(otpModalClaim._id);
      await claimsAPI.verifyDeliveryOtp(otpModalClaim._id, { otp: otpValue.trim() });
      toast.success('Order marked as delivered');
      setOtpModalClaim(null);
      setOtpValue('');
      await fetchClaims();
    } catch (err) {
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setVerifyingOtpFor('');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Claimed Orders</h1>
        <p className="text-surface-500 mt-1">All NGOs/organizations that claimed your listings with full details.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-50 text-surface-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Listing</th>
                <th className="px-4 py-3 font-semibold">Claimed By</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Claimed At</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {claims.map((claim) => (
                <tr key={claim._id} className="bg-white hover:bg-surface-50/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-surface-800">{claim.listingId?.title || 'Deleted listing'}</p>
                    <p className="text-xs text-surface-500">{claim.listingId?.address || 'No address'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-surface-800">{claim.ngoId?.name || 'Unknown NGO'}</p>
                    <p className="text-xs text-surface-500">Org: {claim.ngoId?.organizationId?.name || 'No organization'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-surface-700">{claim.ngoId?.email || 'No email'}</p>
                    <p className="text-xs text-surface-500">{claim.ngoId?.phone || claim.ngoId?.organizationId?.contactPhone || 'No phone'}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-surface-800">
                    {claim.claimedQuantity} {claim.listingId?.unit || ''}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusColor(claim.status)} size="sm">
                      {getStatusLabel(claim.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-surface-600">{formatDateTime(claim.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {claim.status === 'approved' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={sendingOtpFor === claim._id}
                            onClick={() => handleSendOtp(claim._id)}
                          >
                            {getOtpMetaLabel(claim)}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setOtpModalClaim(claim);
                              setOtpValue('');
                            }}
                          >
                            Verify OTP
                          </Button>
                        </>
                      )}
                      {claim.status === 'delivered' && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                          Completed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {claims.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-surface-500">No one has claimed your listings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={Boolean(otpModalClaim)}
        onClose={() => {
          if (!verifyingOtpFor) {
            setOtpModalClaim(null);
            setOtpValue('');
          }
        }}
        title="Verify Delivery OTP"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-600">
            Ask NGO for the 6-digit OTP sent to their email, then enter it below to mark this order delivered.
          </p>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            OTP expires in 10 minutes. If it expires, click Resend OTP in the table.
          </p>
          <Input
            label="Delivery OTP"
            placeholder="Enter 6-digit OTP"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={Boolean(verifyingOtpFor)}
              onClick={() => {
                setOtpModalClaim(null);
                setOtpValue('');
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={Boolean(verifyingOtpFor)}
              disabled={otpValue.length !== 6}
              onClick={handleVerifyOtp}
            >
              Confirm Delivery
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReceivedClaims;
