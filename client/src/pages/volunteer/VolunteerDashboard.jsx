import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiTruck, HiCheckCircle, HiClock, HiLocationMarker } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import { pickupsAPI } from '../../services/api';
import { onEvent, offEvent } from '../../services/socket';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { getStatusColor, getStatusLabel, getCategoryIcon, formatTimeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const VolunteerDashboard = () => {
  const { user } = useAuthStore();
  const [pickups, setPickups] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        pickupsAPI.getMy({ limit: 20 }),
        pickupsAPI.getMy({ status: 'delivered', limit: 1 }),
      ]);

      const allPickups = activeRes.data || [];
      setPickups(allPickups);
      setStats({
        total: activeRes.pagination?.total || 0,
        active: allPickups.filter((p) => p.status !== 'delivered' && p.status !== 'cancelled').length,
        completed: completedRes.pagination?.total || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleNewPickup = (data) => {
      toast('📦 New pickup assigned to you!', { icon: '🚗' });
      fetchData();
    };

    onEvent('pickup:assigned', handleNewPickup);
    return () => offEvent('pickup:assigned', handleNewPickup);
  }, []);

  const handleStatusUpdate = async (pickupId, newStatus) => {
    try {
      await pickupsAPI.updateStatus(pickupId, { status: newStatus });
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const getNextStatus = (current) => {
    const flow = {
      assigned: 'en_route_to_donor',
      en_route_to_donor: 'picked_up',
      picked_up: 'en_route_to_ngo',
      en_route_to_ngo: 'delivered',
    };
    return flow[current] || null;
  };

  const getNextLabel = (current) => {
    const labels = {
      assigned: '🚗 Start Route to Donor',
      en_route_to_donor: '📦 Confirm Pickup',
      picked_up: '🚗 Head to NGO',
      en_route_to_ngo: '✅ Mark Delivered',
    };
    return labels[current] || null;
  };

  if (loading) return <PageLoader />;

  const activePickups = pickups.filter((p) => p.status !== 'delivered' && p.status !== 'cancelled');
  const recentCompleted = pickups.filter((p) => p.status === 'delivered').slice(0, 3);

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-surface-900">
          Hey, <span className="gradient-text">{user.name?.split(' ')[0]}</span> 🚗
        </h1>
        <p className="text-surface-500 mt-2 text-base">Your pickup assignments and delivery status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
        <StatCard icon={<HiTruck />} label="Active Pickups" value={stats.active} />
        <StatCard icon={<HiCheckCircle />} label="Completed" value={stats.completed} />
        <StatCard icon={<HiClock />} label="Total Assigned" value={stats.total} />
      </div>

      {/* Active Pickups */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-surface-900 mb-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Active Pickups
        </h2>

        {activePickups.length > 0 ? (
          <div className="space-y-5 stagger-children">
            {activePickups.map((pickup) => {
              const listing = pickup.listingId;
              const next = getNextStatus(pickup.status);
              const nextLabel = getNextLabel(pickup.status);

              return (
                <Card key={pickup._id} padding="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-100 to-primary-100 flex items-center justify-center text-2xl shrink-0">
                      {listing ? getCategoryIcon(listing.category) : '📦'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-surface-800">{listing?.title || 'Food Pickup'}</h3>
                      <p className="text-sm text-surface-500">
                        {listing?.quantity} {listing?.unit} · From: {pickup.donorId?.name || listing?.donorId?.name || 'Donor'}
                      </p>
                      <p className="text-sm text-surface-500">
                        To: {pickup.ngoId?.name || 'NGO'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(pickup.status)}>
                        {getStatusLabel(pickup.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="mt-5 flex items-center gap-1">
                    {['assigned', 'en_route_to_donor', 'picked_up', 'en_route_to_ngo', 'delivered'].map((s, i) => {
                      const stepIndex = ['assigned', 'en_route_to_donor', 'picked_up', 'en_route_to_ngo', 'delivered'].indexOf(pickup.status);
                      const isActive = i <= stepIndex;
                      return (
                        <div key={s} className="flex items-center flex-1">
                          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary-500' : 'bg-surface-200'}`} />
                          {i < 4 && <div className={`flex-1 h-0.5 ${i < stepIndex ? 'bg-primary-500' : 'bg-surface-200'}`} />}
                        </div>
                      );
                    })}
                  </div>

                  {next && (
                    <div className="mt-5">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(pickup._id, next)}
                      >
                        {nextLabel}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-8 text-surface-400">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-medium">No active pickups</p>
            <p className="text-sm">You'll be notified when a new pickup is assigned</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
