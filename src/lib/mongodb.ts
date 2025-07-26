// MongoDB connection and mock data service
// In a real application, this would connect to actual MongoDB

class MockDatabase {
  private clothes: any[] = [
    { _id: '1', name: 'Shirt', price: 25, category: 'casual' },
    { _id: '2', name: 'Pants', price: 35, category: 'formal' },
    { _id: '3', name: 'T-Shirt', price: 20, category: 'casual' },
    { _id: '4', name: 'Jeans', price: 40, category: 'casual' },
    { _id: '5', name: 'Suit', price: 100, category: 'formal' },
    { _id: '6', name: 'Dress', price: 60, category: 'formal' },
    { _id: '7', name: 'Saree', price: 80, category: 'traditional' },
    { _id: '8', name: 'Kurta', price: 45, category: 'traditional' },
  ];

  private employees: any[] = [
    {
      _id: '1',
      name: 'Jammie Lannister',
      joiningDate: new Date('2024-01-15'),
      workingDaysPerWeek: 6,
      dailyHours: 8,
      hourlyRate: 50,
    },
    {
      _id: '2',
      name: 'Arya Stark',
      joiningDate: new Date('2024-03-01'),
      workingDaysPerWeek: 5,
      dailyHours: 8,
      hourlyRate: 45,
    },
    {
      _id: '3',
      name: 'Jon Snow',
      joiningDate: new Date('2024-06-10'),
      workingDaysPerWeek: 6,
      dailyHours: 9,
      hourlyRate: 55,
    },
  ];

  private bills: any[] = [];
  private payments: any[] = [];
  private notifications: any[] = [
    {
      _id: '1',
      type: 'payment_due',
      title: 'Payment Due Reminder',
      message: 'Payment due for Rajesh Kumar - January 2025',
      isRead: false,
      createdAt: new Date(),
    },
  ];

  // Clothes methods
  async getClothes() {
    return this.clothes;
  }

  async addCloth(cloth: any) {
    const newCloth = { ...cloth, _id: Date.now().toString() };
    this.clothes.push(newCloth);
    return newCloth;
  }

  async updateCloth(id: string, updates: any) {
    const index = this.clothes.findIndex(c => c._id === id);
    if (index !== -1) {
      this.clothes[index] = { ...this.clothes[index], ...updates };
      return this.clothes[index];
    }
    return null;
  }

  async deleteCloth(id: string) {
    this.clothes = this.clothes.filter(c => c._id !== id);
    return true;
  }

  // Employee methods
  async getEmployees() {
    return this.employees;
  }

  async addEmployee(employee: any) {
    const newEmployee = { ...employee, _id: Date.now().toString() };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: string, updates: any) {
    const index = this.employees.findIndex(e => e._id === id);
    if (index !== -1) {
      this.employees[index] = { ...this.employees[index], ...updates };
      return this.employees[index];
    }
    return null;
  }

  async deleteEmployee(id: string) {
    this.employees = this.employees.filter(e => e._id !== id);
    return true;
  }

  // Bill methods
  async getBills() {
    return this.bills;
  }

  async addBill(bill: any) {
    const newBill = { 
      ...bill, 
      _id: Date.now().toString(),
      billNumber: `LW${Date.now()}`,
      createdAt: new Date()
    };
    this.bills.push(newBill);
    return newBill;
  }

  // Payment methods
  async getPayments() {
    return this.payments;
  }

  async updatePayment(employeeId: string, month: string, updates: any) {
    const index = this.payments.findIndex(p => p.employeeId === employeeId && p.month === month);
    if (index !== -1) {
      this.payments[index] = { ...this.payments[index], ...updates };
    } else {
      this.payments.push({
        _id: Date.now().toString(),
        employeeId,
        month,
        ...updates,
        createdAt: new Date()
      });
    }
    return this.payments.find(p => p.employeeId === employeeId && p.month === month);
  }

  // Notification methods
  async getNotifications() {
    return this.notifications.filter(n => !n.isRead);
  }

  async markNotificationRead(id: string) {
    const notification = this.notifications.find(n => n._id === id);
    if (notification) {
      notification.isRead = true;
    }
    return notification;
  }
}

export const db = new MockDatabase();