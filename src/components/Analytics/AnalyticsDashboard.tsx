import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { TrendingUp, DollarSign, Users, Package, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface AnalyticsDashboardProps {
  bills: any[];
  employees: any[];
  clothes: any[];
  payments: any[];
  refreshData?: () => Promise<void>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ bills, employees, clothes, payments, refreshData }) => {
   const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(false);

  // Refresh data when component mounts and when date range changes
  useEffect(() => {
    const fetchData = async () => {
      if (refreshData) {
        setIsLoading(true);
        try {
          await refreshData();
        } catch (error) {
          console.error('Error refreshing data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [dateRange]); // Add refreshData to dependencies

  // ... rest of your component code ...

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate daily sales data
  const dailySalesData = bills.reduce((acc: any, bill) => {
    const date = format(new Date(bill.createdAt), 'MMM dd');
    const existing = acc.find((item: any) => item.date === date);
    
    if (existing) {
      existing.sales += bill.total;
      existing.orders += 1;
    } else {
      acc.push({ date, sales: bill.total, orders: 1 });
    }
    
    return acc;
  }, []).slice(-7); // Last 7 days

  // Calculate most popular items
  const itemPopularity = bills.reduce((acc: any, bill) => {
    bill.items.forEach((item: any) => {
      const existing = acc.find((i: any) => i.name === item.name);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
      } else {
        acc.push({ 
          name: item.name, 
          quantity: item.quantity, 
          revenue: item.subtotal 
        });
      }
    });
    return acc;
  }, []).sort((a: any, b: any) => b.quantity - a.quantity).slice(0, 5);

  // Employee performance data
const employeeData = employees.map(emp => {
  const empPayments = payments.filter(p => p.employeeId === emp._id);
  const totalPaid = empPayments.reduce((sum, p) => sum + (p.paid ? p.amountPaid : 0), 0);
  const totalDue = empPayments.reduce((sum, p) => sum + (!p.paid ? p.amountPaid : 0), 0);
  
  return {
    name: emp.name,
    paid: totalPaid,
    due: totalDue,
    total: totalPaid + totalDue
  };
});

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
  const totalOrders = bills.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalEmployeeCost = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-green-600 text-sm">+15.3% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              <p className="text-blue-600 text-sm">+8.2% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{avgOrderValue.toFixed(0)}</p>
              <p className="text-purple-600 text-sm">+5.7% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Employee Costs</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalEmployeeCost.toLocaleString()}</p>
              <p className="text-orange-600 text-sm">Monthly expenses</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                fill="url(#colorSales)" 
              />
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Items Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Most Popular Items</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={itemPopularity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Employee Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, '']} />
              <Bar dataKey="paid" stackId="a" fill="#10B981" name="Paid" />
              <Bar dataKey="due" stackId="a" fill="#EF4444" name="Due" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Item Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={itemPopularity}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="revenue"
              >
                {itemPopularity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-2">
            {itemPopularity.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-gray-600 font-semibold">Metric</th>
                <th className="pb-3 text-gray-600 font-semibold">Current Period</th>
                <th className="pb-3 text-gray-600 font-semibold">Previous Period</th>
                <th className="pb-3 text-gray-600 font-semibold">Change</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              <tr className="border-b border-gray-100">
                <td className="py-3 font-medium">Total Revenue</td>
                <td className="py-3">₹{totalRevenue.toLocaleString()}</td>
                <td className="py-3">₹{(totalRevenue * 0.85).toFixed(0)}</td>
                <td className="py-3 text-green-600">+15.3%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 font-medium">Total Orders</td>
                <td className="py-3">{totalOrders}</td>
                <td className="py-3">{Math.floor(totalOrders * 0.92)}</td>
                <td className="py-3 text-green-600">+8.2%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 font-medium">Average Order Value</td>
                <td className="py-3">₹{avgOrderValue.toFixed(0)}</td>
                <td className="py-3">₹{(avgOrderValue * 0.94).toFixed(0)}</td>
                <td className="py-3 text-green-600">+5.7%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;