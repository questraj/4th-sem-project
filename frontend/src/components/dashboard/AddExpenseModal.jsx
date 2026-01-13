import { useState, useEffect } from "react";
import { X, Loader2, Check, Upload, Image as ImageIcon, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function AddExpenseModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeSubCategories, setActiveSubCategories] = useState([]);
  
  // UI States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");

  // Files State
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Form Data - Added 'source' with default 'Cash'
  const [formData, setFormData] = useState({
    amount: "",
    category_id: "", 
    sub_category_id: "", 
    date: new Date().toISOString().split('T')[0],
    source: "Cash", // NEW FIELD
    description: ""
  });

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category/getCategories.php");
      if (res.data.success) {
        setCategories(res.data.data);
        if (!formData.category_id && res.data.data.length > 0) {
            handleMainCategorySelect(res.data.data[0].id, res.data.data);
        }
      }
    } catch (error) { console.error(error); }
  };

  const handleMainCategorySelect = (catId, allCategories = categories) => {
    const selectedCat = allCategories.find(c => c.id == catId);
    setFormData(prev => ({ ...prev, category_id: catId, sub_category_id: "" }));
    setActiveSubCategories(selectedCat?.sub_categories || []);
    setIsAddingSubCategory(false);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "ADD_NEW_CAT") setIsAddingCategory(true);
    else handleMainCategorySelect(value);
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/category/addCategory.php", { name: newCategoryName });
      if (res.data.success) {
        const newCat = { id: res.data.data.id, category_name: res.data.data.name, sub_categories: [] };
        const updatedList = [...categories, newCat];
        setCategories(updatedList);
        handleMainCategorySelect(newCat.id, updatedList);
        setIsAddingCategory(false);
        setNewCategoryName("");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "ADD_NEW_SUB") setIsAddingSubCategory(true);
    else setFormData({ ...formData, sub_category_id: value });
  };

  const handleAddNewSubCategory = async () => {
    if (!newSubCategoryName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/category/addSubCategory.php", { 
        category_id: formData.category_id,
        name: newSubCategoryName 
      });
      if (res.data.success) {
        const newSub = { id: res.data.data.id, name: res.data.data.name };
        setActiveSubCategories(prev => [...prev, newSub]);
        setFormData(prev => ({...prev, sub_category_id: newSub.id}));
        setCategories(prevCats => prevCats.map(cat => {
            if (cat.id == formData.category_id) {
                return { ...cat, sub_categories: [...(cat.sub_categories || []), newSub] };
            }
            return cat;
        }));
        setIsAddingSubCategory(false);
        setNewSubCategoryName("");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleFileChange = (e) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('amount', formData.amount);
      submitData.append('category_id', formData.category_id);
      submitData.append('sub_category_id', formData.sub_category_id);
      submitData.append('date', formData.date);
      submitData.append('source', formData.source); // NEW: Append Source
      submitData.append('description', formData.description);

      selectedFiles.forEach((file) => submitData.append('bills[]', file));

      await api.post("/expense/addExpense.php", submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      onSuccess();
      onClose();
      setFormData({ amount: "", category_id: "", sub_category_id: "", date: new Date().toISOString().split('T')[0], source: "Cash", description: "" });
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to add expense", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 z-50 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add New Expense</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount & Source Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
            </div>
            
            {/* NEW: Source Dropdown */}
            <div className="space-y-2">
              <Label>Payment Source</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.source} 
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online / Digital</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* MAIN CATEGORY */}
          <div className="space-y-2">
            <Label>Category</Label>
            {!isAddingCategory ? (
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={formData.category_id} onChange={handleCategoryChange}>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.category_name}</option>)}
                    <option disabled>──────────────────</option>
                    <option value="ADD_NEW_CAT" className="font-bold text-blue-600">+ Add New Category</option>
                </select>
            ) : (
                <div className="flex gap-2">
                    <Input placeholder="New Category Name..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                    <Button type="button" size="icon" onClick={handleAddNewCategory} disabled={loading} className="bg-green-600"><Check size={16} /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddingCategory(false)}><X size={16} /></Button>
                </div>
            )}
          </div>

          {/* SUB CATEGORY */}
          <div className="space-y-2">
            <Label>Sub Category</Label>
            {!isAddingSubCategory ? (
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={formData.sub_category_id} onChange={handleSubCategoryChange}>
                    <option value="">-- Select Sub Category --</option>
                    {activeSubCategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                    <option disabled>──────────────────</option>
                    <option value="ADD_NEW_SUB" className="font-bold text-purple-600">+ Add Sub Category</option>
                </select>
            ) : (
                 <div className="flex gap-2 animate-in fade-in">
                    <Input placeholder="New Sub Category..." value={newSubCategoryName} onChange={(e) => setNewSubCategoryName(e.target.value)} autoFocus className="border-purple-500 ring-2" />
                    <Button type="button" size="icon" onClick={handleAddNewSubCategory} disabled={loading} className="bg-purple-600"><Check size={16} /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddingSubCategory(false)}><X size={16} /></Button>
                </div>
            )}
          </div>

          {/* DATE PICKER */}
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="relative">
                <Input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="block w-full pl-3" />
            </div>
          </div>

          {/* BILL UPLOAD */}
          <div className="space-y-2">
            <Label>Bill Images (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <Input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm">Click or Drag to upload images</span>
                </div>
            </div>
            {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                            <ImageIcon size={12} />
                            <span className="max-w-[150px] truncate">{file.name}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-blue-600" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Expense</Button>
          </div>
        </form>
      </div>
    </div>
  );
}