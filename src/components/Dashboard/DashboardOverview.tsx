import React from 'react';
import { TrendingUp, Users, Package, Receipt } from 'lucide-react';

interface DashboardOverviewProps {
  bills: any[];
  employees: any[];
  clothes: any[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ bills, employees, clothes }) => {
  const todaysSales = bills
    .filter(bill => {
      const today = new Date().toDateString();
      return new Date(bill.createdAt).toDateString() === today;
    })
    .reduce((sum, bill) => sum + bill.total, 0);

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);

  const stats = [
    {
      title: "Today's Sales",
      value: `₹${todaysSales.toLocaleString()}`,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      change: "+12.5%"
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: Receipt,
      color: "from-blue-500 to-cyan-600",
      change: "+8.2%"
    },
    {
      title: "Active Employees",
      value: employees.length.toString(),
      icon: Users,
      color: "from-purple-500 to-pink-600",
      change: "+2"
    },
    {
      title: "Inventory Items",
      value: clothes.length.toString(),
      icon: Package,
      color: "from-orange-500 to-red-600",
      change: "+5"
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-green-600 text-sm font-medium mt-2">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Bills */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Bills</h3>
          <div className="space-y-3">
            {bills.slice(-5).reverse().map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{bill.customer.name}</p>
                  <p className="text-sm text-gray-600">{bill.billNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{bill.total}</p>
                  <p className="text-sm text-gray-600">{new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-200">
              Create New Bill
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200">
              Add New Item
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;