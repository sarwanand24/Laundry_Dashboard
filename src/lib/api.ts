import axios from 'axios';

const API_BASE_URL = 'https://laundry-dashboard-server.onrender.com'; // Change if using a different backend base URL

export const db = {
  getNotifications: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/notifications`);
    return res.data;
  },

  markNotificationRead: async (id: string) => {
    await axios.put(`${API_BASE_URL}/api/notifications/${id}/read`);
  },

  getBills: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/bills`);
    return res.data;
  },

   addBill: async (bill: {
    customer: any;
    items: any[];
    subtotal: number;
    discount: number;
    total: number;
  }) => {
    const res = await axios.post(`${API_BASE_URL}/api/bills`, bill);
    return res.data;
  },

getClothes: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/clothes`);
    return res.data;
  },

  addCloth: async (cloth: {
    name: string;
    price: number;
    category: string;
  }) => {
    const res = await axios.post(`${API_BASE_URL}/api/clothes`, cloth);
    return res.data;
  },

  updateCloth: async (id: string, updates: {
    name?: string;
    price?: number;
    category?: string;
  }) => {
    const res = await axios.put(`${API_BASE_URL}/api/clothes/${id}`, updates);
    return res.data;
  },

  deleteCloth: async (id: string) => {
    const res = await axios.delete(`${API_BASE_URL}/api/clothes/${id}`);
    return res.data;
  },

getEmployees: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/employees`);
    return res.data;
  },

  addEmployee: async (employee: {
    name: string;
    joiningDate: Date;
    workingDaysPerWeek: number;
    dailyHours: number;
    hourlyRate: number;
  }) => {
    const res = await axios.post(`${API_BASE_URL}/api/employees`, employee);
    return res.data;
  },

  updateEmployee: async (id: string, updates: {
    name?: string;
    joiningDate?: Date;
    workingDaysPerWeek?: number;
    dailyHours?: number;
    hourlyRate?: number;
  }) => {
    const res = await axios.put(`${API_BASE_URL}/api/employees/${id}`, updates);
    return res.data;
  },

  deleteEmployee: async (id: string) => {
    const res = await axios.delete(`${API_BASE_URL}/api/employees/${id}`);
    return res.data;
  },

  // Payment operations
  getPayments: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/payments`);
    return res.data;
  },

   updatePayment: async (employeeId: string, month: string, updates: {
    paid: boolean;
    amountPaid: number;
  }) => {
    const res = await axios.post(`${API_BASE_URL}/api/payments`, {
      employeeId,
      month,
      ...updates
    });
    return res.data;
  },
};
