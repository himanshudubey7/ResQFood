import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI, pickupsAPI, usersAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatDateTime, getStatusColor, getStatusLabel, getCategoryLabel, getCategoryIcon, getConditionLabel, getTimeUntilExpiry } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await listingsAPI.getById(id);
        setListing(res.data);
      } catch (err) {
        toast.error('Failed to load listing');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, navigate]);

  const handleAssign = async () => {
    if (!selectedVolunteer) return;
    setAssigning(true);
    try {
      await pickupsAPI.assign({ listingId: id, volunteerId: selectedVolunteer });
      toast.success('Volunteer assigned!');
      // Refresh listing
      const res = await listingsAPI.getById(id);
      setListing(res.data);
      setShowAssignModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to assign');
    } finally {
      setAssigning(false);
    }
  };

  const openAssignModal = async () => {
    try {
      const res = await usersAPI.getAll({ role: 'volunteer', limit: 50 });
      setVolunteers(res.data || []);
      setShowAssignModal(true);
    } catch (err) {
      toast.error('Failed to load volunteers');
    }
  };

  if (loading) return <PageLoader />;
  if (!listing) return null;

  const expiry = getTimeUntilExpiry(listing.expiryAt);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="text-sm text-surface-500 hover:text-surface-700 cursor-pointer">
        ← Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {/* Photo */}
            {listing.photos?.[0] ? (
              <img src={listing.photos[0].url} alt={listing.title} className="w-full h-64 object-cover rounded-xl mb-6" />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl mb-6 flex items-center justify-center text-7xl">
                {getCategoryIcon(listing.category)}
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-surface-900">{listing.title}</h1>
              <Badge className={getStatusColor(listing.status)} size="md">
                {getStatusLabel(listing.status)}
              </Badge>
            </div>

            {listing.description && (
              <p className="text-surface-600 mb-6">{listing.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface-50 rounded-xl">
                <p className="text-xs text-surface-500">Quantity</p>
                <p className="font-bold text-surface-800">{listing.quantity} {listing.unit}</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-xl">
                <p className="text-xs text-surface-500">Category</p>
                <p className="font-bold text-surface-800">{getCategoryLabel(listing.category)}</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-xl">
                <p className="text-xs text-surface-500">Condition</p>
                <p className="font-bold text-surface-800">{getConditionLabel(listing.condition)}</p>
              </div>
              <div className={`p-3 rounded-xl ${expiry.isUrgent ? 'bg-red-50' : 'bg-surface-50'}`}>
                <p className="text-xs text-surface-500">Expires</p>
                <p className={`font-bold ${expiry.isUrgent ? 'text-red-600' : 'text-surface-800'}`}>{expiry.text}</p>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <h2 className="font-bold text-surface-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <TimelineItem label="Created" date={listing.createdAt} active />
              <TimelineItem label="Claimed" date={listing.claimedAt} active={!!listing.claimedAt} />
              <TimelineItem label="Picked Up" date={listing.pickedUpAt} active={!!listing.pickedUpAt} />
              <TimelineItem label="Delivered" date={listing.deliveredAt} active={!!listing.deliveredAt} />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Address */}
          <Card>
            <h3 className="font-bold text-surface-900 mb-2">📍 Pickup Location</h3>
            <p className="text-sm text-surface-600">{listing.address || 'No address provided'}</p>
          </Card>

          {/* Claimed By */}
          {listing.claimedBy && (
            <Card>
              <h3 className="font-bold text-surface-900 mb-2">🤝 Claimed By</h3>
              <p className="text-sm font-medium text-surface-700">{listing.claimedBy.name}</p>
              <p className="text-xs text-surface-500">{listing.claimedBy.email}</p>
            </Card>
          )}

          {/* Volunteer */}
          {listing.assignedVolunteer ? (
            <Card>
              <h3 className="font-bold text-surface-900 mb-2">🚗 Assigned Volunteer</h3>
              <p className="text-sm font-medium text-surface-700">{listing.assignedVolunteer.name}</p>
              <p className="text-xs text-surface-500">{listing.assignedVolunteer.email}</p>
            </Card>
          ) : listing.status === 'claimed' && (user.role === 'donor' || user.role === 'admin') ? (
            <Card>
              <h3 className="font-bold text-surface-900 mb-2">🚗 Volunteer</h3>
              <p className="text-sm text-surface-500 mb-3">No volunteer assigned yet</p>
              <Button onClick={openAssignModal} className="w-full" size="sm">
                Assign Volunteer
              </Button>
            </Card>
          ) : null}

          {/* Dates */}
          <Card>
            <h3 className="font-bold text-surface-900 mb-3">📅 Dates</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Ready At</span>
                <span className="text-surface-700">{formatDateTime(listing.readyAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Expires At</span>
                <span className={`font-medium ${expiry.isUrgent ? 'text-red-600' : 'text-surface-700'}`}>
                  {formatDateTime(listing.expiryAt)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Volunteer">
        <div className="space-y-4">
          <p className="text-sm text-surface-600">Select a volunteer for this pickup:</p>
          <select
            value={selectedVolunteer}
            onChange={(e) => setSelectedVolunteer(e.target.value)}
            className="w-full rounded-xl border border-surface-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">Select volunteer...</option>
            {volunteers.map((v) => (
              <option key={v._id} value={v._id}>{v.name} — {v.email}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowAssignModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAssign} className="flex-1" isLoading={assigning} disabled={!selectedVolunteer}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const TimelineItem = ({ label, date, active }) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${active ? 'bg-primary-500' : 'bg-surface-200'}`} />
    <div className="flex-1 flex justify-between">
      <span className={`text-sm ${active ? 'text-surface-800 font-medium' : 'text-surface-400'}`}>{label}</span>
      <span className="text-xs text-surface-400">{date ? formatDateTime(date) : '—'}</span>
    </div>
  </div>
);

export default ListingDetail;
