import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function EditExpenseModal({ isOpen, onClose, onSuccess, expense }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeSubCategories, setActiveSubCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    amount: "",
    category_id: "",
    sub_category_id: "",
    date: "",
    description: ""
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/category/getCategories.php");
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (e) { console.error(e); }
    };
    if (isOpen) fetchCats();
  }, [isOpen]);

  useEffect(() => {
    if (expense && categories.length > 0) {
      setFormData({
        amount: expense.amount,
        category_id: expense.category_id,
        sub_category_id: expense.sub_category_id || "",
        date: expense.date,
        description: expense.description || ""
      });
      
      const selectedCat = categories.find(c => c.id == expense.category_id);
      setActiveSubCategories(selectedCat?.sub_categories || []);
    }
  }, [expense, categories, isOpen]);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const selectedCat = categories.find(c => c.id == catId);
    setFormData({ ...formData, category_id: catId, sub_category_id: "" });
    setActiveSubCategories(selectedCat?.sub_categories || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/expense/updateExpense.php", {
        id: expense.id,
        ...formData
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-50 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit Expense</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={formData.category_id} onChange={handleCategoryChange}>
               {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Sub Category</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={formData.sub_category_id} onChange={e => setFormData({...formData, sub_category_id: e.target.value})}>
               <option value="">-- None --</option>
               {activeSubCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              onClick={(e) => e.target.showPicker()} 
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Update Expense"}
          </Button>
        </form>
      </div>
    </div>
  );
}