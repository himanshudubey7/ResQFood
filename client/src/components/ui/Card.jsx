const Card = ({ children, className = '', hover = false, glass = false, padding = 'p-5 md:p-6', ...props }) => {
  return (
    <div
      className={`
        rounded-2xl md:rounded-3xl border 
        ${glass
          ? 'glass-panel'
          : 'bg-white border-surface-100 premium-shadow'
        }
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
