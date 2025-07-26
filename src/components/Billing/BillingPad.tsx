import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Download, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import jsPDF from 'jspdf';
import { db } from '../../lib/mongodb';

interface Customer {
  name: string;
  phone: string;
  address: string;
}

interface BillItem {
  clothId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

const BillingPad: React.FC = () => {
  const [clothes, setClothes] = useState<any[]>([]);
  const [filteredClothes, setFilteredClothes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Customer>();

  useEffect(() => {
    loadClothes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clothes.filter(cloth =>
        cloth.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClothes(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, clothes]);

  const loadClothes = async () => {
    const clothesData = await db.getClothes();
    setClothes(clothesData);
  };

  const addItemToBill = (cloth: any) => {
    const existingItem = billItems.find(item => item.clothId === cloth._id);
    
    if (existingItem) {
      setBillItems(billItems.map(item =>
        item.clothId === cloth._id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setBillItems([...billItems, {
        clothId: cloth._id,
        name: cloth.name,
        quantity: 1,
        price: cloth.price,
        subtotal: cloth.price
      }]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const updateQuantity = (clothId: string, change: number) => {
    setBillItems(billItems.map(item => {
      if (item.clothId === clothId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity, subtotal: newQuantity * item.price };
      }
      return item;
    }));
  };

  const removeItem = (clothId: string) => {
    setBillItems(billItems.filter(item => item.clothId !== clothId));
  };

  const subtotal = billItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const generatePDF = (customer: Customer) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 100, 200);
    pdf.text('LaundryWalaa', 20, 20);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Invoice', 20, 35);
    
    // Bill Number and Date
    const billNumber = `LW${Date.now()}`;
    pdf.setFontSize(10);
    pdf.text(`Bill No: ${billNumber}`, 20, 45);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Customer Details
    pdf.setFontSize(12);
    pdf.text('Bill To:', 20, 65);
    pdf.setFontSize(10);
    pdf.text(`Name: ${customer.name}`, 20, 75);
    pdf.text(`Phone: ${customer.phone}`, 20, 80);
    pdf.text(`Address: ${customer.address}`, 20, 85);
    
    // Items Table Header
    pdf.setFontSize(10);
    pdf.text('Item', 20, 105);
    pdf.text('Qty', 90, 105);
    pdf.text('Rate', 120, 105);
    pdf.text('Amount', 160, 105);
    
    // Items
    let yPosition = 115;
    billItems.forEach((item) => {
      pdf.text(item.name, 20, yPosition);
      pdf.text(item.quantity.toString(), 90, yPosition);
      pdf.text(`₹${item.price}`, 120, yPosition);
      pdf.text(`₹${item.subtotal}`, 160, yPosition);
      yPosition += 10;
    });
    
    // Totals
    yPosition += 10;
    pdf.text(`Subtotal: ₹${subtotal}`, 120, yPosition);
    pdf.text(`Discount (${discount}%): -₹${discountAmount.toFixed(2)}`, 120, yPosition + 10);
    pdf.setFontSize(12);
    pdf.text(`Total: ₹${total.toFixed(2)}`, 120, yPosition + 25);
    
    pdf.save(`bill-${billNumber}.pdf`);
  };

  const onSubmit = async (customer: Customer) => {
    if (billItems.length === 0) {
      alert('Please add items to the bill');
      return;
    }

    const bill = {
      customer,
      items: billItems,
      subtotal,
      discount,
      total,
    };

    await db.addBill(bill);
    generatePDF(customer);
    
    // Reset form
    setBillItems([]);
    setDiscount(0);
    reset();
    alert('Bill created and PDF downloaded successfully!');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Billing Pad</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Customer & Items */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  {...register('name', { required: 'Customer name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  {...register('phone', { required: 'Phone number is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  {...register('address', { required: 'Address is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer address"
                  rows={3}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>
            </form>
          </div>

          {/* Add Items */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Items</h3>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search for clothes..."
                />
              </div>
              
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredClothes.map((cloth) => (
                    <button
                      key={cloth._id}
                      onClick={() => addItemToBill(cloth)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 flex justify-between items-center"
                    >
                      <span>{cloth.name}</span>
                      <span className="text-blue-600 font-semibold">₹{cloth.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Bill Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Bill Summary</h3>
          
          {/* Bill Items */}
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {billItems.map((item) => (
              <div key={item.clothId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">₹{item.price} each</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.clothId, -1)}
                    className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.clothId, 1)}
                    className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => removeItem(item.clothId)}
                    className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="text-right ml-4">
                  <p className="font-bold text-gray-900">₹{item.subtotal}</p>
                </div>
              </div>
            ))}
            
            {billItems.length === 0 && (
              <p className="text-gray-500 text-center py-8">No items added yet</p>
            )}
          </div>

          {/* Discount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter discount percentage"
              min="0"
              max="100"
            />
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount ({discount}%):</span>
              <span className="font-semibold text-red-600">-₹{discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Generate Bill Button */}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={billItems.length === 0}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Download size={20} />
            <span>Generate Bill & Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingPad;