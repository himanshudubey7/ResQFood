import { Link, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const STATUS_COPY = {
  success: {
    title: 'Pickup verification successful',
    description: 'Your claim has been verified. Donor can now proceed with delivery OTP flow.',
    badge: 'Success',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  'already-confirmed': {
    title: 'Already verified',
    description: 'This claim was already verified earlier. No further action is needed.',
    badge: 'Already Verified',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  expired: {
    title: 'Verification link expired',
    description: 'This verification link is no longer valid. Please claim again to receive a new verification email.',
    badge: 'Expired',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  invalid: {
    title: 'Invalid verification link',
    description: 'The link is invalid or has already been replaced. Please use the latest email link.',
    badge: 'Invalid Link',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  pending: {
    title: 'Claim is pending',
    description: 'This claim is still pending. Use the verification link from your email.',
    badge: 'Pending',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  approved: {
    title: 'Claim already approved',
    description: 'This claim is already approved.',
    badge: 'Approved',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  delivered: {
    title: 'Claim already delivered',
    description: 'This claim is already marked as delivered.',
    badge: 'Delivered',
    badgeClass: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  rejected: {
    title: 'Claim was rejected',
    description: 'This claim was rejected, so this verification link cannot be used.',
    badge: 'Rejected',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  cancelled: {
    title: 'Claim was cancelled',
    description: 'This claim was cancelled, so this verification link cannot be used.',
    badge: 'Cancelled',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const ClaimVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const status = (searchParams.get('status') || 'invalid').toLowerCase();
  const { isAuthenticated, user } = useAuthStore();

  const content = STATUS_COPY[status] || STATUS_COPY.invalid;
  const claimsPath = user?.role === 'ngo' ? '/ngo/claims' : '/login';

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white border border-surface-200 rounded-2xl shadow-lg p-8 text-center">
        <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border ${content.badgeClass}`}>
          {content.badge}
        </div>

        <h1 className="text-2xl font-bold text-surface-900 mt-5">{content.title}</h1>
        <p className="text-surface-600 mt-3 leading-relaxed">{content.description}</p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={claimsPath}
            className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
          >
            {isAuthenticated && user?.role === 'ngo' ? 'Go to My Claims' : 'Login'}
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg border border-surface-300 text-surface-700 hover:bg-surface-50 font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClaimVerificationPage;
