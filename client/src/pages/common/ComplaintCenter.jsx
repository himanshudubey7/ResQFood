import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { claimsAPI, complaintsAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatDateTime } from '../../utils/helpers';

const TYPE_OPTIONS = [
  { value: 'spoiled_food', label: 'Spoiled Food' },
  { value: 'fake_ngo', label: 'Fake NGO / Identity Concern' },
  { value: 'no_show', label: 'No Show' },
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
  { value: 'other', label: 'Other' },
];

const STATUS_VARIANT = {
  pending: 'warning',
  investigating: 'info',
  resolved: 'success',
  rejected: 'default',
  escalated: 'danger',
};

const ComplaintCenter = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [relations, setRelations] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [againstMe, setAgainstMe] = useState([]);
  const [form, setForm] = useState({ relationKey: '', type: 'no_show', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const selectedRelation = useMemo(
    () => relations.find((item) => item.key === form.relationKey),
    [relations, form.relationKey]
  );

  const loadRelations = async () => {
    if (!user?.role) return;

    if (user.role === 'donor') {
      const res = await claimsAPI.getReceived({ limit: 200 });
      const claims = res?.data || [];
      const unique = new Map();

      claims.forEach((claim) => {
        const ngo = claim.ngoId;
        const listing = claim.listingId;
        if (!ngo?._id || !listing?._id) return;

        const key = `${ngo._id}-${listing._id}`;
        if (!unique.has(key)) {
          unique.set(key, {
            key,
            targetUserId: ngo._id,
            targetName: ngo.name || 'NGO',
            listingId: listing._id,
            listingTitle: listing.title || 'Listing',
          });
        }
      });

      setRelations(Array.from(unique.values()));
      return;
    }

    if (user.role === 'ngo') {
      const res = await claimsAPI.getMy({ limit: 200 });
      const claims = res?.data || [];
      const unique = new Map();

      claims.forEach((claim) => {
        const listing = claim.listingId;
        const donor = listing?.donorId;
        if (!donor?._id || !listing?._id) return;

        const key = `${donor._id}-${listing._id}`;
        if (!unique.has(key)) {
          unique.set(key, {
            key,
            targetUserId: donor._id,
            targetName: donor.name || 'Donor',
            listingId: listing._id,
            listingTitle: listing.title || 'Listing',
          });
        }
      });

      setRelations(Array.from(unique.values()));
      return;
    }

    setRelations([]);
  };

  const loadComplaintHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await complaintsAPI.getMine();
      setSubmitted(res?.data?.submitted || []);
      setAgainstMe(res?.data?.againstMe || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load complaint history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        await Promise.all([loadRelations(), loadComplaintHistory()]);
      } catch (error) {
        toast.error(error.message || 'Failed to load complaints page');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRelation) {
      toast.error('Please select who you want to report');
      return;
    }

    if (form.description.trim().length < 10) {
      toast.error('Please add at least 10 characters in description');
      return;
    }

    try {
      setSubmitting(true);
      await complaintsAPI.create({
        reportedUser: selectedRelation.targetUserId,
        listingId: selectedRelation.listingId,
        type: form.type,
        description: form.description.trim(),
      });

      toast.success('Complaint submitted to admin');
      setForm({ relationKey: '', type: 'no_show', description: '' });
      await loadComplaintHistory();
    } catch (error) {
      toast.error(error.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Complaints & Safety</h1>
        <p className="text-surface-500 mt-1">
          Report issues to admin. Your complaint will be reviewed and resolved by the platform team.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-surface-900 mb-4">Submit a Complaint</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Report Against</label>
            <select
              className="w-full rounded-xl border border-surface-300 px-4 py-3 bg-white"
              value={form.relationKey}
              onChange={(e) => setForm((prev) => ({ ...prev, relationKey: e.target.value }))}
            >
              <option value="">Select person and listing</option>
              {relations.map((relation) => (
                <option key={relation.key} value={relation.key}>
                  {relation.targetName} · {relation.listingTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Complaint Type</label>
            <select
              className="w-full rounded-xl border border-surface-300 px-4 py-3 bg-white"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Description</label>
            <textarea
              rows={4}
              placeholder="Describe what happened, with time and relevant details..."
              className="w-full rounded-xl border border-surface-300 px-4 py-3 bg-white resize-y"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={submitting}>
              Submit Complaint
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-surface-900 mb-4">My Submitted Complaints</h2>
        {historyLoading ? (
          <PageLoader />
        ) : submitted.length === 0 ? (
          <p className="text-surface-500 text-sm">No complaints submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {submitted.map((item) => (
              <div key={item._id} className="rounded-xl border border-surface-200 p-4 bg-white">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <p className="font-semibold text-surface-900">Against: {item.reportedUser?.name || 'Unknown User'}</p>
                  <Badge variant={STATUS_VARIANT[item.status] || 'default'}>{item.status}</Badge>
                </div>
                <p className="text-sm text-surface-500 mt-1">Listing: {item.listingId?.title || 'N/A'}</p>
                <p className="text-sm text-surface-700 mt-2">{item.description}</p>
                {item.resolutionNotes ? (
                  <p className="text-xs text-surface-500 mt-2">Admin Notes: {item.resolutionNotes}</p>
                ) : null}
                <p className="text-xs text-surface-400 mt-2">Reported: {formatDateTime(item.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-surface-900 mb-4">Complaints Against Me</h2>
        {historyLoading ? (
          <PageLoader />
        ) : againstMe.length === 0 ? (
          <p className="text-surface-500 text-sm">No complaints against you.</p>
        ) : (
          <div className="space-y-3">
            {againstMe.map((item) => (
              <div key={item._id} className="rounded-xl border border-surface-200 p-4 bg-white">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <p className="font-semibold text-surface-900">By: {item.reportedBy?.name || 'Unknown User'}</p>
                  <Badge variant={STATUS_VARIANT[item.status] || 'default'}>{item.status}</Badge>
                </div>
                <p className="text-sm text-surface-500 mt-1">Listing: {item.listingId?.title || 'N/A'}</p>
                <p className="text-sm text-surface-700 mt-2">{item.description}</p>
                {item.resolutionNotes ? (
                  <p className="text-xs text-surface-500 mt-2">Admin Notes: {item.resolutionNotes}</p>
                ) : null}
                <p className="text-xs text-surface-400 mt-2">Reported: {formatDateTime(item.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ComplaintCenter;
