const Card = ({ children, className = '', hover = false, glass = false, padding = 'p-6 md:p-8 lg:p-10', ...props }) => {
  return (
    <div
      className={`
        rounded-[2rem] md:rounded-[2.5rem] border 
        ${glass
          ? 'glass-panel'
          : 'bg-white border-surface-200 premium-shadow'
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
