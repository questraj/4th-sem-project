import { useState } from "react";
import { X, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function ScheduleExpenseModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    amount: "",
    category_id: "1",
    date: "",
    description: "",
    source: "Cash"
  });

  if (!isOpen) return null;

  const validate = () => {
    let newErrors = {};
    const amountRegex = /^\d+(\.\d{1,2})?$/; // Only numbers and up to 2 decimal places
    const today = new Date().toISOString().split('T')[0];

    if (!amountRegex.test(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid positive amount.";
    }
    if (!formData.date || formData.date <= today) {
      newErrors.date = "Date must be in the future.";
    }
    if (formData.description.length > 100) {
      newErrors.description = "Description too long (max 100 chars).";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // We use the same addExpense endpoint because the BE logic 
      // already handles dates > today by putting them in future_expenses
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      const res = await api.post("/expense/addExpense.php", data);
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-50 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <Calendar size={20}/> Schedule Future Expense
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400"/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Amount (NPR)</Label>
            <Input 
              placeholder="0.00" 
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <Label>Future Date</Label>
            <Input 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})}
              className={errors.date ? "border-red-500" : ""}
              onClick={(e) => e.target.showPicker()}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          <div>
            <Label>Description</Label>
            <Input 
              placeholder="What is this for?" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            Schedule Transaction
          </Button>
        </form>
      </div>
    </div>
  );
}