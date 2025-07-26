import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../../lib/api'; // Import your API functions

interface BillHistoryProps {
  bills: any[];
}

const BillHistory: React.FC<BillHistoryProps> = ({ bills }) => {
   const [isLoading, setIsLoading] = useState(false);
  const [localBills, setLocalBills] = useState(bills); // Local state for bills
    const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedBill, setSelectedBill] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const billsData = await db.getBills(); // Direct API call
        setLocalBills(billsData);
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs only on mount

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filter and sort bills
  const filteredBills = localBills
    .filter(bill => {
      const matchesSearch = 
        bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customer.phone.includes(searchTerm);

      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'high_value') return matchesSearch && bill.total > 1000;
      if (filterBy === 'recent') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return matchesSearch && new Date(bill.createdAt) > oneWeekAgo;
      }
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount_desc':
          return b.total - a.total;
        case 'amount_asc':
          return a.total - b.total;
        case 'customer':
          return a.customer.name.localeCompare(b.customer.name);
        default:
          return 0;
      }
    });

  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total, 0);

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Bill History</h2>
          <p className="text-gray-600 mt-1">
            {filteredBills.length} bills • Total Revenue: ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by customer, phone, or bill number..."
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Bills</option>
            <option value="recent">Recent (7 days)</option>
            <option value="high_value">High Value (₹1000)</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
            <option value="customer">Customer Name</option>
          </select>

          {/* Export */}
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2">
            <Download size={20} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bill Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{bill.billNumber}</p>
                      {bill.discount > 0 && (
                        <p className="text-sm text-green-600">
                          {bill.discount}% discount applied
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{bill.customer.name}</p>
                      <p className="text-sm text-gray-600">{bill.customer.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{bill.items.length} items</p>
                      <p className="text-sm text-gray-600">
                        {bill.items.slice(0, 2).map((item: any) => item.name).join(', ')}
                        {bill.items.length > 2 && '...'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900">₹{bill.total.toLocaleString()}</p>
                      {bill.discount > 0 && (
                        <p className="text-sm text-gray-500 line-through">
                          ₹{bill.subtotal.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Calendar size={16} />
                      <span className="text-sm">
                        {format(new Date(bill.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {format(new Date(bill.createdAt), 'hh:mm a')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No bills found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
};

interface BillDetailModalProps {
  bill: any;
  onClose: () => void;
}

const BillDetailModal: React.FC<BillDetailModalProps> = ({ bill, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Bill Details</h3>
              <p className="text-blue-100">{bill.billNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Customer Info */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p><span className="font-semibold">Name:</span> {bill.customer.name}</p>
              <p><span className="font-semibold">Phone:</span> {bill.customer.phone}</p>
              <p><span className="font-semibold">Address:</span> {bill.customer.address}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">Items</h4>
            <div className="space-y-3">
              {bill.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                  </div>
                  <p className="font-bold">₹{item.subtotal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{bill.subtotal}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({bill.discount}%):</span>
                  <span className="font-semibold">-₹{(bill.subtotal - bill.total).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span className="text-blue-600">₹{bill.total}</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="mt-6 text-center text-gray-600">
            <p>Bill generated on {format(new Date(bill.createdAt), 'MMMM dd, yyyy')} at {format(new Date(bill.createdAt), 'hh:mm a')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillHistory;