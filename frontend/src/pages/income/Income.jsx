import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  X, 
  Filter, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Calculator, 
  Calendar, 
  List, 
  LayoutGrid 
} from "lucide-react";
import api from "@/api/axios";
import AddIncomeModal from "@/components/dashboard/AddIncomeModal";
import SetMonthlyIncomeModal from "@/components/dashboard/SetMonthlyIncomeModal";

const MONTH_NAMES = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function Income() {
  // Set default tab to "history" so you see the buttons immediately
  const [activeTab, setActiveTab] = useState("history");
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Planner states
  const [year, setYear] = useState(new Date().getFullYear());
  const [planData, setPlanData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // 1. Fetch the actual income list (History)
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/income/getAllIncomes.php");
      if (res.data.success) {
        setIncomes(res.data.data || []);
      }
    } catch (error) {
      console.error("Fetch history error", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch the Yearly Plan
  const fetchPlanner = useCallback(async () => {
    try {
      const res = await api.get(`/income/getYearlyPlan.php?year=${year}`);
      if (res.data.success) setPlanData(res.data.data);
    } catch (error) {
      console.error("Planner fetch error", error);
    }
  }, [year]);

  useEffect(() => {
    fetchHistory();
    fetchPlanner();
  }, [fetchHistory, fetchPlanner]);

  // Delete Action
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income?")) return;
    try {
      const res = await api.post("/income/deleteIncome.php", { id });
      if (res.data.success) {
        fetchHistory(); // Refresh the list
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  // Edit Action
  const handleEdit = (income) => {
    setEditData(income); // Put the data into the state
    setIsAddModalOpen(true); // Open the modal
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Income</h1>
                <p className="text-muted-foreground">Track your earnings and goals.</p>
            </div>
            
            <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                <button 
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                    <List size={16} /> History (Edit/Delete)
                </button>
                <button 
                    onClick={() => setActiveTab("planner")}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'planner' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                    <LayoutGrid size={16} /> Goals
                </button>
            </div>
        </div>

        {activeTab === "history" ? (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-end">
                    <Button onClick={() => { setEditData(null); setIsAddModalOpen(true); }} className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Income
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-green-600"/></div>
                        ) : incomes.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">No income records found. Add one above!</div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr className="text-gray-500">
                                        <th className="p-4 font-semibold">Date</th>
                                        <th className="p-4 font-semibold">Source</th>
                                        <th className="p-4 font-semibold">Description</th>
                                        <th className="p-4 font-semibold text-right">Amount</th>
                                        <th className="p-4 font-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incomes.map((inc) => (
                                        <tr key={inc.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">{inc.date}</td>
                                            <td className="p-4 font-bold text-gray-800">{inc.source}</td>
                                            <td className="p-4 text-gray-500">{inc.description || "-"}</td>
                                            <td className="p-4 text-right font-bold text-green-600">NPR {parseFloat(inc.amount).toLocaleString()}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-3">
                                                    <button 
                                                        onClick={() => handleEdit(inc)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(inc.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {planData.map((item) => (
                    <div key={item.month} onClick={() => { setSelectedMonth(item); setIsPlanModalOpen(true); }} 
                        className={`cursor-pointer border rounded-xl p-6 flex flex-col items-center gap-4 transition-all ${item.amount > 0 ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50/50 border-dashed'}`}
                    >
                        <span className="text-lg font-bold">{MONTH_NAMES[item.month]}</span>
                        <div className="text-2xl font-bold text-green-700">
                            {item.amount > 0 ? `NPR ${item.amount.toLocaleString()}` : "Set Goal"}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* MODALS */}
        <AddIncomeModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={fetchHistory} 
            editData={editData} 
        />
        
        <SetMonthlyIncomeModal 
            isOpen={isPlanModalOpen} 
            onClose={() => setIsPlanModalOpen(false)} 
            onSuccess={fetchPlanner} 
            monthData={selectedMonth} 
            year={year} 
        />
      </div>
    </DashboardLayout>
  );
}