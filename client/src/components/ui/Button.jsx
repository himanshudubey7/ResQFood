import { forwardRef } from 'react';

const variants = {
  primary: 'bg-primary-500 hover:bg-primary-400 text-surface-900 font-bold shadow-[0_8px_20px_-6px_rgba(0,230,118,0.5)] hover:shadow-[0_12px_24px_-6px_rgba(0,230,118,0.7)] hover:-translate-y-0.5',
  secondary: 'bg-surface-200 hover:bg-surface-300 text-surface-800 font-semibold hover:-translate-y-0.5',
  danger: 'bg-danger-500 hover:bg-red-400 text-white font-bold shadow-[0_8px_20px_-6px_rgba(255,51,102,0.4)] hover:-translate-y-0.5',
  ghost: 'bg-transparent hover:bg-surface-100 text-surface-700 font-semibold',
  outline: 'border-2 border-surface-200 text-surface-700 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 font-semibold',
  accent: 'bg-accent-500 hover:bg-accent-400 text-white font-bold shadow-[0_8px_20px_-6px_rgba(0,180,216,0.4)] hover:-translate-y-0.5',
};

const sizes = {
  sm: 'px-5 py-2.5 text-xs rounded-xl tracking-wide',
  md: 'px-7 py-3.5 text-sm rounded-2xl tracking-wide',
  lg: 'px-9 py-4 text-base rounded-[1.25rem] tracking-wide',
  xl: 'px-12 py-5 text-lg rounded-[1.5rem] tracking-wide',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  icon,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center gap-2 
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        active:scale-[0.96] heading-font
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="text-xl -ml-1">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
