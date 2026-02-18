import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function AddIncomeModal({ isOpen, onClose, onSuccess, editData }) {
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");

  // When the modal opens, check if we are editing or adding new
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setSource(editData.source);
        setAmount(editData.amount);
        setDate(editData.date);
        setDescription(editData.description || "");
      } else {
        setSource("");
        setAmount("");
        setDate(new Date().toISOString().split('T')[0]);
        setDescription("");
      }
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use different endpoints or IDs based on edit mode
      const url = editData ? "/income/updateIncome.php" : "/income/addIncome.php";
      const payload = {
        id: editData?.id, // ID is needed for updates
        source,
        amount,
        date,
        description
      };

      const res = await api.post(url, payload);
      if (res.data.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Submit error", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? "Edit Income Record" : "Add New Income"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Source</Label>
            <Input 
                required 
                placeholder="e.g. Salary, Freelance" 
                value={source} 
                onChange={e => setSource(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Amount (NPR)</Label>
            <Input 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
                type="date" 
                required 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                onClick={(e) => e.target.showPicker()}
            />
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                {editData ? "Update Income" : "Save Income"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}