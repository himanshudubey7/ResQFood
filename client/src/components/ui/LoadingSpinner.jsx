const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} rounded-full border-4 border-surface-200`} />
        <div
          className={`${sizes[size]} rounded-full border-4 border-transparent border-t-primary-500 animate-spin absolute top-0 left-0`}
        />
      </div>
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <LoadingSpinner size="lg" />
    <p className="text-surface-500 text-sm animate-pulse">Loading...</p>
  </div>
);

export default LoadingSpinner;
