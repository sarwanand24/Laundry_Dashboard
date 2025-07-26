export interface Customer {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  createdAt?: Date;
}

export interface ClothItem {
  _id?: string;
  name: string;
  price: number;
  category?: string;
  createdAt?: Date;
}

export interface BillItem {
  clothId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Bill {
  _id?: string;
  billNumber: string;
  customer: Customer;
  items: BillItem[];
  subtotal: number;
  discount: number;
  total: number;
  createdAt: Date;
}

export interface Employee {
  _id?: string;
  name: string;
  joiningDate: Date;
  workingDaysPerWeek: number;
  dailyHours: number;
  hourlyRate: number;
  createdAt?: Date;
}

export interface Payment {
  _id?: string;
  employeeId: string;
  month: string; // Format: "2025-01"
  year: number;
  dueAmount: number;
  paidAmount: number;
  status: 'paid' | 'due' | 'partial';
  paidDate?: Date;
  createdAt?: Date;
}

export interface Notification {
  _id?: string;
  type: 'payment_due' | 'new_bill' | 'inventory_low';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}