import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Banknote, Search, X, Filter, Loader2, AlertCircle } from "lucide-react";
import api from "@/api/axios";
import AddIncomeModal from "@/components/dashboard/AddIncomeModal";

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // New Error State
  
  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchIncomes = useCallback(async (start = "", end = "") => {
    setLoading(true);
    setError("");
    try {
      let url = "/income/getAllIncomes.php";
      if (start && end) url += `?start_date=${start}&end_date=${end}`;
      
      console.log("Fetching from:", url); // DEBUG LOG

      const res = await api.get(url);
      
      console.log("API Response:", res.data); // DEBUG LOG

      if (res.data.success) {
        setIncomes(res.data.data || []); // Ensure it's an array
      } else {
        setError("Failed to load data: " + res.data.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setError("Server Error: Check Console for details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleFilter = () => {
    if (startDate && endDate) {
        fetchIncomes(startDate, endDate);
    } else {
        alert("Please select both Start and End dates");
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchIncomes();
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this income record?")) return;
    try {
        await api.post("/income/deleteIncome.php", { id });
        fetchIncomes(startDate, endDate);
    } catch(e) { console.error(e); }
  };

  const openAdd = () => { setEditData(null); setIsModalOpen(true); };
  const openEdit = (item) => { setEditData(item); setIsModalOpen(true); };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Income</h1>
                <p className="text-muted-foreground">Track your earnings and revenue sources.</p>
            </div>
            <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700 shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Add Income
            </Button>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</span>
                    <Input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="bg-gray-50 border-gray-200"
                        onClick={(e) => e.target.showPicker()} 
                    />
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</span>
                    <Input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="bg-gray-50 border-gray-200"
                        onClick={(e) => e.target.showPicker()} 
                    />
                </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button onClick={handleFilter} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
                {(startDate || endDate) && (
                    <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 border-red-100">
                        <X className="mr-2 h-4 w-4" /> Reset
                    </Button>
                )}
            </div>
        </div>

        {/* Error Display */}
        {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle className="h-5 w-5" /> {error}
            </div>
        )}

        <Card>
            <CardHeader className="border-b bg-gray-50/50 py-4">
                <CardTitle className="flex gap-2 text-lg text-gray-800">
                    <Banknote className="h-5 w-5 text-green-600"/> Income History
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex justify-center items-center py-12 text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" /> Loading records...
                    </div>
                ) : incomes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No income records found.</p>
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b bg-gray-50">
                                <tr className="border-b">
                                    <th className="h-12 px-6 font-medium text-gray-500">Date</th>
                                    <th className="h-12 px-6 font-medium text-gray-500">Source</th>
                                    <th className="h-12 px-6 font-medium text-gray-500">Description</th>
                                    <th className="h-12 px-6 font-medium text-gray-500 text-right">Amount</th>
                                    <th className="h-12 px-6 font-medium text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {incomes.map((inc) => (
                                    <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-6 align-middle">{inc.date}</td>
                                        <td className="p-6 align-middle font-semibold text-gray-700">{inc.source}</td>
                                        <td className="p-6 align-middle text-gray-500 max-w-[200px] truncate">{inc.description || "-"}</td>
                                        <td className="p-6 align-middle text-right font-bold text-green-600">
                                            + NPR {parseFloat(inc.amount).toLocaleString()}
                                        </td>
                                        <td className="p-6 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEdit(inc)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(inc.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>

        <AddIncomeModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => fetchIncomes(startDate, endDate)} 
            editData={editData} 
        />
      </div>
    </DashboardLayout>
  );
}