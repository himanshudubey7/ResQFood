const Badge = ({ children, variant = 'default', className = '', size = 'sm', ...props }) => {
  const variants = {
    default: 'bg-surface-100 text-surface-600 border-surface-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider',
    sm: 'px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide',
    md: 'px-4 py-2 text-sm font-bold uppercase tracking-wide',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-xl border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
