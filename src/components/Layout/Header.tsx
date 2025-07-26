import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
}

interface HeaderProps {
  notifications: Notification[];
}

const Header: React.FC<HeaderProps> = ({ notifications: serverNotifications }) => {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Combine server notifications with dismissal state
  useEffect(() => {
    console.log('Notification---->', serverNotifications)
    setLocalNotifications(serverNotifications);
  }, [serverNotifications]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    if (hour < 21) return 'Good Evening!';
    return 'Good Night!';
  };

  const handleDismissNotification = (id: string) => {// Update local notifications immediately
    setLocalNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="lg:ml-0 ml-12">
          <h2 className="text-2xl font-bold text-gray-900">{getGreeting()}</h2>
          <p className="text-gray-600">Welcome back to your dashboard</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600" />
            {localNotifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {localNotifications.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {localNotifications.length > 0 && (
        <div className="mt-4 space-y-2">
          {localNotifications.map((notification) => (
            <div
              key={notification._id}
              className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="font-semibold text-orange-800">{notification.title}</h4>
                <p className="text-orange-600 text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => handleDismissNotification(notification._id)}
                className="text-orange-400 hover:text-orange-600 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;