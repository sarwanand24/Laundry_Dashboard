import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { db } from '../../lib/mongodb';

interface ClothItem {
  _id?: string;
  name: string;
  price: number;
  category: string;
}

const InventoryManager: React.FC = () => {
  const [clothes, setClothes] = useState<ClothItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<ClothItem>({ name: '', price: 0, category: 'casual' });

  useEffect(() => {
    loadClothes();
  }, []);

  const loadClothes = async () => {
    const clothesData = await db.getClothes();
    setClothes(clothesData);
  };

  const handleAdd = async () => {
    if (!newItem.name || newItem.price <= 0) {
      alert('Please fill all fields correctly');
      return;
    }

    await db.addCloth(newItem);
    setNewItem({ name: '', price: 0, category: 'casual' });
    setShowAddForm(false);
    loadClothes();
  };

  const handleEdit = async (id: string, updates: Partial<ClothItem>) => {
    await db.updateCloth(id, updates);
    setEditingId(null);
    loadClothes();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await db.deleteCloth(id);
      loadClothes();
    }
  };

  const categories = ['casual', 'formal', 'traditional', 'sports', 'other'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter price"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Add Item</span>
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

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clothes.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            {editingId === item._id ? (
              <EditForm
                item={item}
                categories={categories}
                onSave={(updates) => handleEdit(item._id!, updates)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingId(item._id!)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">₹{item.price}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {clothes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No inventory items found</p>
          <p className="text-gray-400 text-sm mt-2">Add your first item to get started</p>
        </div>
      )}
    </div>
  );
};

interface EditFormProps {
  item: ClothItem;
  categories: string[];
  onSave: (updates: Partial<ClothItem>) => void;
  onCancel: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ item, categories, onSave, onCancel }) => {
  const [editedItem, setEditedItem] = useState(item);

  const handleSave = () => {
    if (!editedItem.name || editedItem.price <= 0) {
      alert('Please fill all fields correctly');
      return;
    }
    onSave(editedItem);
  };

  return (
    <div className="space-y-3">
      <input
        value={editedItem.name}
        onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Item name"
      />
      <input
        type="number"
        value={editedItem.price}
        onChange={(e) => setEditedItem({ ...editedItem, price: Number(e.target.value) })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Price"
        min="0"
      />
      <select
        value={editedItem.category}
        onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {categories.map(category => (
          <option key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </option>
        ))}
      </select>
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
        >
          <X size={16} />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};

export default InventoryManager;