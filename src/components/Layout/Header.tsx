import React from 'react';
import { Bell, X } from 'lucide-react';

interface HeaderProps {
  notifications: any[];
  onDismissNotification: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ notifications, onDismissNotification }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="lg:ml-0 ml-12">
          <h2 className="text-2xl font-bold text-gray-900">Good Morning!</h2>
          <p className="text-gray-600">Welcome back to your dashboard</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mt-4 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="font-semibold text-orange-800">{notification.title}</h4>
                <p className="text-orange-600 text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => onDismissNotification(notification._id)}
                className="text-orange-400 hover:text-orange-600 transition-colors"
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