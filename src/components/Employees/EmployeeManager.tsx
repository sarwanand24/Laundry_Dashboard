import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, User, Calendar, Clock, DollarSign } from 'lucide-react';
import { format, startOfMonth, addMonths, differenceInMonths, getDaysInMonth } from 'date-fns';
import { db } from '../../lib/api';

interface Employee {
  _id?: string;
  name: string;
  joiningDate: Date;
  workingDaysPerWeek: number;
  dailyHours: number;
  hourlyRate: number;
}

interface Payment {
  _id?: string;
  employeeId: string;
  month: string;
  paid: boolean;
  amountPaid: number;
  createdAt?: Date;
  // Frontend-only calculated field
  dueAmount?: number;
}

const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Employee>({
    name: '',
    joiningDate: new Date(),
    workingDaysPerWeek: 6,
    dailyHours: 8,
    hourlyRate: 50
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const employeesData = await db.getEmployees();
    const paymentsData = await db.getPayments();
    setEmployees(employeesData);
    setPayments(paymentsData);
  };

  const calculateMonthlyPayment = (employee: Employee) => {
    const workingDaysPerMonth = Math.floor((employee.workingDaysPerWeek * 30) / 7);
    return workingDaysPerMonth * employee.dailyHours * employee.hourlyRate;
  };

  const getEmployeePayments = (employeeId: string) => {
    return payments.filter(p => p.employeeId === employeeId);
  };

 const generateMonthlyPayments = (employee: Employee) => {
    const currentDate = new Date();
    const joiningDate = new Date(employee.joiningDate);
    const monthsDiff = differenceInMonths(currentDate, joiningDate);
    
    const generatedPayments: Payment[] = [];
    
    for (let i = 0; i <= monthsDiff; i++) {
      const monthDate = addMonths(joiningDate, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      
      const existingPayment = payments.find(p => 
        p.employeeId === employee._id && p.month === monthKey
      );
      
      if (!existingPayment) {
        generatedPayments.push({
          employeeId: employee._id!,
          month: monthKey,
          paid: false,
          amountPaid: 0,
          dueAmount: calculateMonthlyPayment(employee)
        });
      }
    }
    
    return generatedPayments;
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || newEmployee.hourlyRate <= 0) {
      alert('Please fill all fields correctly');
      return;
    }

    const added = await db.addEmployee(newEmployee);
    setNewEmployee({
      name: '',
      joiningDate: new Date(),
      workingDaysPerWeek: 6,
      dailyHours: 8,
      hourlyRate: 50
    });
    setShowAddForm(false);
    loadData();
  };

const startEditing = (employee: Employee) => {
  setEditingId(employee._id!);
  setEditEmployee({ ...employee });
};

const handleEditEmployee = async () => {
  if (!editEmployee || !editEmployee._id || !editEmployee.name || editEmployee.hourlyRate <= 0) {
    alert('Please fill all fields correctly');
    return;
  }

  await db.updateEmployee(editEmployee._id, editEmployee);
  setEditingId(null);
  setEditEmployee(null);
  loadData();
};

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      await db.deleteEmployee(id);
      loadData();
    }
  };

 const updatePaymentStatus = async (employeeId: string, month: string, paid: boolean) => {
    try {
      // Find the existing payment to get the amount
      const existingPayment = payments.find(p => 
        p.employeeId === employeeId && p.month === month
      );
      
      const amount = existingPayment?.amountPaid || calculateMonthlyPayment(
        employees.find(e => e._id === employeeId)!
      );

      const updatedPayment = await db.updatePayment(employeeId, month, {
        paid,
        amountPaid: amount
      });
      
      // Update local state immediately
      setPayments(prevPayments => {
        const existingIndex = prevPayments.findIndex(
          p => p.employeeId === employeeId && p.month === month
        );
        
        if (existingIndex >= 0) {
          const updated = [...prevPayments];
          updated[existingIndex] = { 
            ...updated[existingIndex], 
            paid,
            amountPaid: amount
          };
          return updated;
        } else {
          return [...prevPayments, {
            employeeId,
            month,
            paid,
            amountPaid: amount,
            dueAmount: calculateMonthlyPayment(
              employees.find(e => e._id === employeeId)!
            )
          }];
        }
      });
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Add New Employee Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Employee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter employee name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                type="date"
                value={format(new Date(newEmployee.joiningDate), 'yyyy-MM-dd')}
                onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Days/Week</label>
              <input
                type="number"
                value={newEmployee.workingDaysPerWeek}
                onChange={(e) => setNewEmployee({ ...newEmployee, workingDaysPerWeek: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="7"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Hours</label>
              <input
                type="number"
                value={newEmployee.dailyHours}
                onChange={(e) => setNewEmployee({ ...newEmployee, dailyHours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
              <input
                type="number"
                value={newEmployee.hourlyRate}
                onChange={(e) => setNewEmployee({ ...newEmployee, hourlyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleAddEmployee}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Add Employee</span>
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

 {editingId && editEmployee && (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Employee</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          value={editEmployee.name}
          onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter employee name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
        <input
          type="date"
          value={format(new Date(editEmployee.joiningDate), 'yyyy-MM-dd')}
          onChange={(e) => setEditEmployee({ 
            ...editEmployee, 
            joiningDate: new Date(e.target.value) 
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Working Days/Week</label>
        <input
          type="number"
          value={editEmployee.workingDaysPerWeek}
          onChange={(e) => setEditEmployee({ 
            ...editEmployee, 
            workingDaysPerWeek: Number(e.target.value) 
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="1"
          max="7"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Hours</label>
        <input
          type="number"
          value={editEmployee.dailyHours}
          onChange={(e) => setEditEmployee({ 
            ...editEmployee, 
            dailyHours: Number(e.target.value) 
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="1"
          max="24"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
        <input
          type="number"
          value={editEmployee.hourlyRate}
          onChange={(e) => setEditEmployee({ 
            ...editEmployee, 
            hourlyRate: Number(e.target.value) 
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="0"
        />
      </div>
    </div>
    <div className="flex space-x-3 mt-4">
      <button
        onClick={handleEditEmployee}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
      >
        <Save size={16} />
        <span>Save Changes</span>
      </button>
      <button
        onClick={() => {
          setEditingId(null);
          setEditEmployee(null);
        }}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
      >
        <X size={16} />
        <span>Cancel</span>
      </button>
    </div>
  </div>
)}

      {/* Employees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {employees.map((employee) => {
          const monthlyPayment = calculateMonthlyPayment(employee);
          const employeePayments = getEmployeePayments(employee._id!);
          const paidPayments = employeePayments.filter(p => p.paid);
          const duePayments = employeePayments.filter(p => !p.paid);
          
          return (
            <div key={employee._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">
                      Joined {format(new Date(employee.joiningDate), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(employee)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee._id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{employee.workingDaysPerWeek} days/week</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>{employee.dailyHours} hours/day</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign size={16} />
                  <span>₹{employee.hourlyRate}/hour</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
                <p className="text-2xl font-bold text-green-600">₹{monthlyPayment.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Paid Months</p>
                  <p className="text-lg font-bold text-green-600">{paidPayments.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Due Months</p>
                  <p className="text-lg font-bold text-red-600">{duePayments.length}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployee(employee)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
              >
                View Payment Details
              </button>
            </div>
          );
        })}
      </div>

      {/* Employee Payment Details Modal */}
      {selectedEmployee && (
        <EmployeePaymentModal
          employee={selectedEmployee}
          payments={getEmployeePayments(selectedEmployee._id!)}
          generatedPayments={generateMonthlyPayments(selectedEmployee)}
          onClose={() => setSelectedEmployee(null)}
          onUpdatePayment={updatePaymentStatus}
        />
      )}
    </div>
  );
};

interface EmployeePaymentModalProps {
  employee: Employee;
  payments: Payment[];
  generatedPayments: Payment[];
  onClose: () => void;
  onUpdatePayment: (employeeId: string, month: string, paid: boolean) => void;
}

const EmployeePaymentModal: React.FC<EmployeePaymentModalProps> = ({
  employee,
  payments,
  generatedPayments,
  onClose,
  onUpdatePayment
}) => {
  const [activeTab, setActiveTab] = useState<'due' | 'paid'>('due');

  // Combine existing payments with generated ones
  const allPayments = [...payments];
  generatedPayments.forEach(gp => {
    if (!allPayments.find(p => p.month === gp.month)) {
      allPayments.push(gp);
    }
  });

  const duePayments = allPayments.filter(p => !p.paid);
  const paidPayments = allPayments.filter(p => p.paid);

  const markAsPaid = async (payment: Payment) => {
    await onUpdatePayment(employee._id!, payment.month, true);
  };

  const markAsDue = async (payment: Payment) => {
    await onUpdatePayment(employee._id!, payment.month, false);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">{employee.name}</h3>
              <p className="text-blue-100">Payment History & Management</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('due')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'due'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Due Payments ({duePayments.length})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paid Payments ({paidPayments.length})
            </button>
          </div>

          {/* Payment Lists */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'due' && (
              <div className="space-y-3">
                {duePayments.map((payment) => (
                  <div key={payment.month} className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {format(new Date(payment.month + '-01'), 'MMMM yyyy')}
                      </h4>
                      <p className="text-red-600 font-bold">₹{(payment.dueAmount || payment.amountPaid || 0).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => markAsPaid(payment)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Paid
                    </button>
                  </div>
                ))}
                {duePayments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No due payments</p>
                )}
              </div>
            )}

           {activeTab === 'paid' && (
              <div className="space-y-3">
                {paidPayments.map((payment) => (
                  <div key={payment.month} className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {format(new Date(payment.month + '-01'), 'MMMM yyyy')}
                      </h4>
                      <p className="text-green-600 font-bold">
                        ₹{payment.amountPaid.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => markAsDue(payment)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Mark as Due
                    </button>
                  </div>
                ))}
                {paidPayments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No paid payments</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManager;