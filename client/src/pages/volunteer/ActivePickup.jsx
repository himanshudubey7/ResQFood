import { useState, useEffect } from 'react';
import { pickupsAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { getStatusColor, getStatusLabel, getCategoryIcon } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ActivePickup = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPickups = async () => {
    try {
      const res = await pickupsAPI.getMy({ limit: 20 });
      setPickups((res.data || []).filter((p) => p.status !== 'delivered' && p.status !== 'cancelled'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPickups(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await pickupsAPI.updateStatus(id, { status });
      toast.success('Status updated!');
      fetchPickups();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-surface-900">Active Pickups</h1>

      {pickups.length > 0 ? (
        <div className="space-y-5 stagger-children">
          {pickups.map((p) => {
            const listing = p.listingId;
            return (
              <Card key={p._id} padding="p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-xl">
                    {listing ? getCategoryIcon(listing.category) : '📦'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-surface-800">{listing?.title || 'Pickup'}</h3>
                    <Badge className={getStatusColor(p.status)} size="xs">{getStatusLabel(p.status)}</Badge>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-surface-500">
                      <p>📍 From: {p.donorId?.name} {p.donorId?.location?.address && `(${p.donorId.location.address})`}</p>
                      <p>📍 To: {p.ngoId?.name} {p.ngoId?.location?.address && `(${p.ngoId.location.address})`}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.status === 'assigned' && <Button size="sm" onClick={() => handleStatus(p._id, 'en_route_to_donor')}>🚗 Start Route</Button>}
                      {p.status === 'en_route_to_donor' && <Button size="sm" onClick={() => handleStatus(p._id, 'picked_up')}>📦 Picked Up</Button>}
                      {p.status === 'picked_up' && <Button size="sm" onClick={() => handleStatus(p._id, 'en_route_to_ngo')}>🚗 Heading to NGO</Button>}
                      {p.status === 'en_route_to_ngo' && <Button size="sm" onClick={() => handleStatus(p._id, 'delivered')}>✅ Delivered</Button>}
                      <Button size="sm" variant="danger" onClick={() => handleStatus(p._id, 'cancelled')}>Cancel</Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="🚗" title="No active pickups" description="Assigned pickups will appear here." />
      )}
    </div>
  );
};

export default ActivePickup;
