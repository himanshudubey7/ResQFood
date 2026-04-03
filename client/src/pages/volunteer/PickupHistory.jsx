import { useState, useEffect } from 'react';
import { pickupsAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatDateTime, getCategoryIcon } from '../../utils/helpers';

const PickupHistory = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await pickupsAPI.getMy({ status: 'delivered', limit: 50 });
        setPickups(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-surface-900">Pickup History</h1>
        <p className="text-surface-500 mt-2">{pickups.length} completed deliveries</p>
      </div>

      {pickups.length > 0 ? (
        <div className="space-y-4 stagger-children">
          {pickups.map((p) => (
            <Card key={p._id} className="flex items-center gap-4" padding="p-4 md:p-5">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-lg">
                {getCategoryIcon(p.listingId?.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-800 truncate">{p.listingId?.title || 'Delivery'}</p>
                <p className="text-xs text-surface-500">Completed: {formatDateTime(p.completedAt)}</p>
              </div>
              <Badge variant="success">✅ Delivered</Badge>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="📜" title="No delivery history" description="Completed deliveries will appear here." />
      )}
    </div>
  );
};

export default PickupHistory;
