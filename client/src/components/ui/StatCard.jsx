const StatCard = ({ icon, label, title, value, trend, trendUp, className = '' }) => {
  const heading = label || title || '';

  return (
    <div className={`bg-white rounded-3xl border border-surface-200 p-5 md:p-6 card-hover min-h-33 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-surface-500 mb-2">{heading}</p>
          <p className="text-2xl md:text-3xl font-bold text-surface-900 leading-none">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="p-3.5 rounded-2xl bg-primary-50 text-primary-600 text-xl shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
