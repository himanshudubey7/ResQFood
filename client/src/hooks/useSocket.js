import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import { onEvent, offEvent, connectSocket } from '../services/socket';

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = connectSocket(token);

    const handleNewNotification = (notification) => {
      addNotification(notification);
    };

    onEvent('notification:new', handleNewNotification);

    return () => {
      offEvent('notification:new', handleNewNotification);
    };
  }, [isAuthenticated, token, addNotification]);
}

export default useSocket;
