import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useListings } from '../../hooks/useListings';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatTimeAgo, getStatusColor, getStatusLabel, getCategoryIcon, getCategoryLabel, getTimeUntilExpiry } from '../../utils/helpers';

const statusFilters = ['all', 'available', 'claimed', 'picked_up', 'delivered', 'expired'];

const MyListings = () => {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const params = { donorId: user._id, page, limit: 12 };
  if (statusFilter !== 'all') params.status = statusFilter;

  const { data, isLoading } = useListings(params);
  const listings = data?.data || [];
  const pagination = data?.pagination || {};

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900">My Listings</h1>
          <p className="text-surface-500 mt-2">{pagination.total || 0} total listings</p>
        </div>
        <Link to="/donor/create">
          <Button>+ New Listing</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === s
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            {s === 'all' ? 'All' : getStatusLabel(s)}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {listings.map((listing) => {
            const expiry = getTimeUntilExpiry(listing.expiryAt);
            return (
              <Link key={listing._id} to={`/donor/listings/${listing._id}`}>
                <Card hover className="h-full" padding="p-4 md:p-5">
                  {/* Photo */}
                  {listing.photos?.[0] ? (
                    <img src={listing.photos[0].url} alt={listing.title} className="w-full h-40 object-cover rounded-xl mb-4" />
                  ) : (
                    <div className="w-full h-40 bg-linear-to-br from-primary-100 to-accent-100 rounded-xl mb-4 flex items-center justify-center text-5xl">
                      {getCategoryIcon(listing.category)}
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-surface-800 line-clamp-1">{listing.title}</h3>
                    <Badge className={getStatusColor(listing.status)} size="xs">
                      {getStatusLabel(listing.status)}
                    </Badge>
                  </div>

                  <p className="text-sm text-surface-500 mb-3">
                    {listing.quantity} {listing.unit} · {getCategoryLabel(listing.category)}
                  </p>

                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span>{formatTimeAgo(listing.createdAt)}</span>
                    <span className={expiry.isUrgent ? 'text-red-500 font-medium' : ''}>
                      {expiry.text}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="📋"
          title="No listings found"
          description={statusFilter !== 'all' ? 'Try a different filter' : 'Create your first listing to start donating food'}
          action="Create Listing"
          onAction={() => window.location.href = '/donor/create'}
        />
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-surface-500">
            Page {page} of {pagination.pages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyListings;
