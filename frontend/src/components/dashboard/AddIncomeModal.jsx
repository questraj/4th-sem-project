import { useState, useEffect } from "react";
import { X, Loader2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function AddIncomeModal({ isOpen, onClose, onSuccess, editData }) {
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [source, setSource] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");

  // Calculation States
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [yearlyAmount, setYearlyAmount] = useState("");
  
  // Which amount to actually save to DB? ('Monthly' or 'Yearly')
  const [saveMode, setSaveMode] = useState("Monthly"); 

  useEffect(() => {
    if (editData) {
      // If editing, assume the stored amount is the "Monthly" figure for calculation purposes
      // or simply load it into monthly and calculate yearly.
      const amt = parseFloat(editData.amount);
      setSource(editData.source);
      setDate(editData.date);
      setDescription(editData.description || "");
      
      setMonthlyAmount(amt);
      setYearlyAmount((amt * 12).toFixed(2));
      setSaveMode("Monthly");
    } else {
      // Reset
      setSource("");
      setDate(new Date().toISOString().split('T')[0]);
      setDescription("");
      setMonthlyAmount("");
      setYearlyAmount("");
      setSaveMode("Monthly");
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  // --- Synchronization Logic ---

  const handleMonthlyChange = (e) => {
    const val = e.target.value;
    setMonthlyAmount(val);
    if (val && !isNaN(val)) {
        setYearlyAmount((parseFloat(val) * 12).toFixed(2));
    } else {
        setYearlyAmount("");
    }
    setSaveMode("Monthly"); // User touched monthly, so probably wants to save monthly
  };

  const handleYearlyChange = (e) => {
    const val = e.target.value;
    setYearlyAmount(val);
    if (val && !isNaN(val)) {
        setMonthlyAmount((parseFloat(val) / 12).toFixed(2));
    } else {
        setMonthlyAmount("");
    }
    setSaveMode("Yearly"); // User touched yearly, might want to save yearly (e.g. bonus)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Decide which amount to send to backend
    const finalAmount = saveMode === "Monthly" ? monthlyAmount : yearlyAmount;

    try {
      const url = editData ? "/income/updateIncome.php" : "/income/addIncome.php";
      const payload = {
        id: editData?.id,
        source,
        amount: finalAmount,
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 z-50 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{editData ? "Edit Income" : "Add Income"}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <Label>Source</Label>
            <Input 
                required 
                placeholder="e.g. Salary, Business" 
                value={source} 
                onChange={e => setSource(e.target.value)} 
            />
          </div>

          {/* --- CALCULATOR SECTION --- */}
          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 space-y-4">
              <Label className="text-blue-800 font-semibold flex items-center gap-2">
                 <ArrowRightLeft size={14} /> Income Calculator
              </Label>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 uppercase">Monthly (NPR)</Label>
                    <Input 
                        type="number" 
                        step="0.01"
                        value={monthlyAmount} 
                        onChange={handleMonthlyChange}
                        className={`bg-white ${saveMode === 'Monthly' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 uppercase">Yearly (NPR)</Label>
                    <Input 
                        type="number" 
                        step="0.01"
                        value={yearlyAmount} 
                        onChange={handleYearlyChange}
                        className={`bg-white ${saveMode === 'Yearly' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                    />
                  </div>
              </div>

              {/* Selection Toggle */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                  <span className="text-xs font-bold">Save as:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="saveMode" 
                        checked={saveMode === "Monthly"} 
                        onChange={() => setSaveMode("Monthly")}
                      /> Monthly
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="saveMode" 
                        checked={saveMode === "Yearly"} 
                        onChange={() => setSaveMode("Yearly")}
                      /> Yearly
                  </label>
              </div>
              <p className="text-xs text-gray-500 italic">
                  * Only the selected amount will be saved to your history.
              </p>
          </div>

          <div className="space-y-2">
            <Label>Date Received</Label>
            <Input 
                type="date" 
                required 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                onClick={(e) => e.target.showPicker()} 
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            {editData ? "Update Income" : "Add Income"}
          </Button>

        </form>
      </div>
    </div>
  );
}