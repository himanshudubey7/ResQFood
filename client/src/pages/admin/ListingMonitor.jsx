import { useState, useEffect } from 'react';
import { listingsAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { getStatusColor, getStatusLabel, getCategoryIcon, getCategoryLabel, formatTimeAgo, getTimeUntilExpiry } from '../../utils/helpers';
import { onEvent, offEvent } from '../../services/socket';

const statusFilters = ['all', 'available', 'claimed', 'picked_up', 'delivered', 'expired'];

const ListingMonitor = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sort: '-createdAt' };
      if (filter !== 'all') params.status = filter;
      const res = await listingsAPI.getAll(params);
      setListings(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [page, filter]);

  useEffect(() => {
    const handleNew = () => fetchListings();
    const handleUpdated = () => fetchListings();
    onEvent('listing:new', handleNew);
    onEvent('listing:updated', handleUpdated);
    return () => { offEvent('listing:new', handleNew); offEvent('listing:updated', handleUpdated); };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-surface-900">Listing Monitor</h1>
        <p className="text-surface-500 mt-2">{pagination.total || 0} total listings</p>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
              filter === s ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            {s === 'all' ? 'All' : getStatusLabel(s)}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">Listing</th>
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">Donor</th>
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">Qty</th>
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">Status</th>
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">Expiry</th>
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const exp = getTimeUntilExpiry(l.expiryAt);
                  return (
                    <tr key={l._id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                      <td className="px-5 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getCategoryIcon(l.category)}</span>
                          <div>
                            <p className="font-medium text-surface-800 text-sm truncate max-w-50">{l.title}</p>
                            <p className="text-xs text-surface-400">{getCategoryLabel(l.category)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 lg:px-6 py-4 text-sm text-surface-600">{l.donorId?.name || '—'}</td>
                      <td className="px-5 lg:px-6 py-4 text-sm font-medium text-surface-700">{l.quantity} {l.unit}</td>
                      <td className="px-5 lg:px-6 py-4">
                        <Badge className={getStatusColor(l.status)} size="xs">{getStatusLabel(l.status)}</Badge>
                      </td>
                      <td className={`px-5 lg:px-6 py-4 text-sm ${exp.isUrgent ? 'text-red-500 font-medium' : 'text-surface-500'}`}>
                        {exp.text}
                      </td>
                      <td className="px-5 lg:px-6 py-4 text-sm text-surface-500">{formatTimeAgo(l.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {listings.length === 0 && <div className="py-12 text-center text-surface-400 text-sm">No listings found</div>}
        </Card>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="px-4 py-2 text-sm text-surface-500">Page {page} of {pagination.pages}</span>
          <Button variant="secondary" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default ListingMonitor;
