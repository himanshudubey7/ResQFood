import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-surface-800 heading-font ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-300 text-xl">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full rounded-2xl border-2 border-surface-200 bg-surface-50/50 backdrop-blur-md
            py-4 text-base text-surface-900 placeholder-surface-400 font-medium
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
            hover:border-surface-300 hover:bg-surface-50
            disabled:bg-surface-100 disabled:cursor-not-allowed disabled:text-surface-400
            ${!icon ? 'px-5' : 'pr-5'}
            ${error ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : ''}
          `}
          style={{ paddingLeft: icon ? '3.2rem' : undefined }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-semibold text-danger-500 mt-1 ml-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
