import Button from './Button';

const EmptyState = ({ icon = '📭', title, description, action, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-lg font-bold text-surface-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={onAction}>{action}</Button>
      )}
    </div>
  );
};

export default EmptyState;
