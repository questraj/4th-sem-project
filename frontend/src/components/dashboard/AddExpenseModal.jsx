import { useState, useEffect } from "react";
import { X, Loader2, Check } from "lucide-react";
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

  const [formData, setFormData] = useState({
    amount: "",
    category_id: "", 
    sub_category_id: "", 
    date: new Date().toISOString().split('T')[0],
    description: ""
  });

  // 1. Load Data
  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category/getCategories.php");
      if (res.data.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
        
        // Auto-select first category if none selected
        if (!formData.category_id && res.data.data.length > 0) {
            const firstCat = res.data.data[0];
            setFormData(prev => ({ ...prev, category_id: firstCat.id }));
            setActiveSubCategories(firstCat.sub_categories || []);
        } else if (formData.category_id) {
            // Restore sub-cats if re-opening
            const currentCat = res.data.data.find(c => c.id == formData.category_id);
            setActiveSubCategories(currentCat?.sub_categories || []);
        }
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  // 2. Handle Category Change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    
    if (value === "ADD_NEW_CAT") {
        setIsAddingCategory(true);
    } else {
        const catId = parseInt(value);
        const selectedCat = categories.find(c => c.id === catId);
        
        setFormData({ 
            ...formData, 
            category_id: value,
            sub_category_id: "" // Reset sub-cat
        });
        setActiveSubCategories(selectedCat?.sub_categories || []);
        setIsAddingSubCategory(false);
    }
  };

  // 3. Handle Add New Main Category
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/category/addCategory.php", { name: newCategoryName });
      if (res.data.success) {
        const newCat = { 
            id: res.data.data.id, 
            category_name: res.data.data.name, 
            sub_categories: [] 
        };
        setCategories(prev => [...prev, newCat]);
        setFormData(prev => ({...prev, category_id: newCat.id, sub_category_id: ""}));
        setActiveSubCategories([]);
        setIsAddingCategory(false);
        setNewCategoryName("");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // 4. Handle Sub Category Change
  const handleSubCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "ADD_NEW_SUB") {
        setIsAddingSubCategory(true);
    } else {
        setFormData({ ...formData, sub_category_id: value });
    }
  };

  // 5. Handle Add New Sub Category
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
        
        // Update Active List (UI)
        setActiveSubCategories(prev => [...prev, newSub]);
        
        // Update Main List (Cache)
        setCategories(prevCats => prevCats.map(cat => {
            if (cat.id == formData.category_id) {
                return { ...cat, sub_categories: [...(cat.sub_categories || []), newSub] };
            }
            return cat;
        }));

        setFormData(prev => ({...prev, sub_category_id: newSub.id}));
        setIsAddingSubCategory(false);
        setNewSubCategoryName("");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/expense/addExpense.php", formData);
      onSuccess();
      onClose();
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 z-50 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add New Expense</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
          </div>

          {/* MAIN CATEGORY */}
          <div className="space-y-2">
            <Label>Category</Label>
            {!isAddingCategory ? (
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.category_id}
                    onChange={handleCategoryChange}
                >
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
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
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.sub_category_id}
                    onChange={handleSubCategoryChange}
                >
                    <option value="">-- Select Sub Category --</option>
                    {activeSubCategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                    <option disabled>──────────────────</option>
                    <option value="ADD_NEW_SUB" className="font-bold text-purple-600">+ Add Sub Category</option>
                </select>
            ) : (
                <div className="flex gap-2">
                    <Input placeholder="New Sub Category..." value={newSubCategoryName} onChange={(e) => setNewSubCategoryName(e.target.value)} autoFocus className="border-purple-500 ring-2 ring-purple-100" />
                    <Button type="button" size="icon" onClick={handleAddNewSubCategory} disabled={loading} className="bg-purple-600 hover:bg-purple-700"><Check size={16} /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddingSubCategory(false)}><X size={16} /></Button>
                </div>
            )}
          </div>

          {/* Date & Description */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-blue-600" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}