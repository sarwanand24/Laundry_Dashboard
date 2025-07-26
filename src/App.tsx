import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import BillingPad from './components/Billing/BillingPad';
import InventoryManager from './components/Inventory/InventoryManager';
import EmployeeManager from './components/Employees/EmployeeManager';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import BillHistory from './components/History/BillHistory';
import { db } from './lib/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [clothes, setClothes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notificationsData, billsData, employeesData, clothesData, paymentsData] = await Promise.all([
        db.getNotifications(),
        db.getBills(),
        db.getEmployees(),
        db.getClothes(),
        db.getPayments()
      ]);

      setNotifications(notificationsData);
      setBills(billsData);
      setEmployees(employeesData);
      setClothes(clothesData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDismissNotification = async (id: string) => {
    await db.markNotificationRead(id);
    setNotifications(notifications.filter(n => n._id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview bills={bills} employees={employees} clothes={clothes}
         setActiveTab={setActiveTab} refreshData={loadData} />;
      case 'billing':
        return <BillingPad />;
      case 'inventory':
        return <InventoryManager />;
      case 'employees':
        return <EmployeeManager />;
      case 'analytics':
        return <AnalyticsDashboard bills={bills} employees={employees} clothes={clothes}
         payments={payments} refreshData={loadData} />;
      case 'history':
        return <BillHistory bills={bills} />;
      default:
        return <DashboardOverview bills={bills} employees={employees} clothes={clothes} 
        setActiveTab={setActiveTab} refreshData={loadData} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          notifications={notifications}
          onDismissNotification={handleDismissNotification}
        />
        
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;