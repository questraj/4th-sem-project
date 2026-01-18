import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Search, X, Filter, Loader2, ChevronLeft, ChevronRight, Calculator, Calendar, List, LayoutGrid } from "lucide-react";
import api from "@/api/axios";
import AddIncomeModal from "@/components/dashboard/AddIncomeModal";
import SetMonthlyIncomeModal from "@/components/dashboard/SetMonthlyIncomeModal";

const MONTH_NAMES = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function Income() {
  const [activeTab, setActiveTab] = useState("planner");
  
  // --- HISTORY STATES ---
  const [incomes, setIncomes] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // --- PLANNER STATES ---
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [planData, setPlanData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // --- FETCH HISTORY ---
  const fetchHistory = useCallback(async (start = "", end = "") => {
    setHistoryLoading(true);
    try {
      let url = "/income/getAllIncomes.php";
      if (start && end) url += `?start_date=${start}&end_date=${end}`;
      const res = await api.get(url);
      if (res.data.success) setIncomes(res.data.data || []);
    } catch (error) { console.error(error); } 
    finally { setHistoryLoading(false); }
  }, []);

  // --- FETCH PLANNER ---
  const fetchPlanner = useCallback(async () => {
    setPlannerLoading(true);
    try {
      const res = await api.get(`/income/getYearlyPlan.php?year=${year}`);
      if (res.data.success) setPlanData(res.data.data);
    } catch (error) { console.error(error); } 
    finally { setPlannerLoading(false); }
  }, [year]);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
    else fetchPlanner();
  }, [activeTab, fetchHistory, fetchPlanner]);

  const handleFilter = () => { if (startDate && endDate) fetchHistory(startDate, endDate); else alert("Select dates"); };
  const handleReset = () => { setStartDate(""); setEndDate(""); fetchHistory(); };
  const handleDelete = async (id) => { if(confirm("Delete?")) { await api.post("/income/deleteIncome.php", { id }); fetchHistory(startDate, endDate); }};
  const handleMonthClick = (item) => { setSelectedMonth(item); setIsPlanModalOpen(true); };

  const totalYearlyPlan = planData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Income Management</h1>
                <p className="text-muted-foreground">Plan your goals and track actual earnings.</p>
            </div>
            
            <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                <button 
                    onClick={() => setActiveTab("planner")}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'planner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <LayoutGrid size={16} /> Planner
                </button>
                <button 
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <List size={16} /> History
                </button>
            </div>
        </div>

        {/* --- PLANNER VIEW --- */}
        {activeTab === "planner" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center">
                    <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none shadow-lg w-full md:w-auto min-w-[300px]">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-green-100 font-medium mb-1">Total Yearly Goal</p>
                                <h2 className="text-3xl font-bold">NPR {totalYearlyPlan.toLocaleString()}</h2>
                            </div>
                            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Calculator className="h-5 w-5 text-white" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                        <Button variant="ghost" size="icon" onClick={() => setYear(year - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                        <span className="text-xl font-bold text-gray-800 w-16 text-center">{year}</span>
                        <Button variant="ghost" size="icon" onClick={() => setYear(year + 1)}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>

                {plannerLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-green-600" /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {planData.map((item) => {
                            const isSet = item.amount > 0;
                            return (
                                <div key={item.month} onClick={() => handleMonthClick(item)} 
                                    className={`relative group cursor-pointer transition-all duration-300 border rounded-xl p-4 flex flex-col gap-3 min-h-[100px] justify-between ${isSet ? 'bg-white border-green-200 shadow-sm hover:shadow-md hover:border-green-400' : 'bg-gray-50/50 border-dashed border-gray-300 hover:bg-white hover:border-gray-400'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-lg font-bold ${isSet ? 'text-gray-800' : 'text-gray-400'}`}>{MONTH_NAMES[item.month]}</span>
                                        <Calendar className={`h-4 w-4 ${isSet ? 'text-green-500' : 'text-gray-300'}`} />
                                    </div>
                                    <div className="text-center">
                                        {isSet ? (
                                            <div className="text-2xl font-bold text-gray-900"><span className="text-sm text-gray-500 font-normal mr-1">NPR</span>{item.amount.toLocaleString()}</div>
                                        ) : <div className="text-sm text-gray-400 font-medium">Set Goal</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}

        {/* --- HISTORY VIEW --- */}
        {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-end">
                    <Button onClick={() => { setEditData(null); setIsAddModalOpen(true); }} className="bg-green-600 hover:bg-green-700 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Transaction
                    </Button>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                    <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                        <div className="space-y-1"><span className="text-xs font-semibold text-gray-500 uppercase">From</span><Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} /></div>
                        <div className="space-y-1"><span className="text-xs font-semibold text-gray-500 uppercase">To</span><Input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} /></div>
                    </div>
                    <div className="flex gap-2"><Button onClick={handleFilter} className="bg-blue-600"><Filter className="mr-2 h-4 w-4"/> Filter</Button>{(startDate || endDate) && <Button variant="outline" onClick={handleReset} className="text-red-600"><X className="mr-2 h-4 w-4"/> Reset</Button>}</div>
                </div>

                <Card>
                    <CardHeader className="border-b bg-gray-50/50 py-4"><CardTitle className="text-lg text-gray-800">Recent Transactions</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {historyLoading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-green-600"/></div> : incomes.length === 0 ? <div className="p-12 text-center text-gray-400">No records found.</div> : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b bg-gray-50"><tr className="border-b"><th className="h-12 px-6 font-medium text-gray-500">Date</th><th className="h-12 px-6 font-medium text-gray-500">Source</th><th className="h-12 px-6 font-medium text-gray-500">Description</th><th className="h-12 px-6 font-medium text-gray-500 text-right">Amount</th><th className="h-12 px-6 font-medium text-gray-500 text-right">Actions</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">{incomes.map((inc) => (<tr key={inc.id} className="hover:bg-gray-50"><td className="p-6">{inc.date}</td><td className="p-6 font-semibold">{inc.source}</td><td className="p-6 text-gray-500 truncate">{inc.description||"-"}</td><td className="p-6 text-right font-bold text-green-600">+ NPR {parseFloat(inc.amount).toLocaleString()}</td><td className="p-6 text-right flex justify-end gap-2"><Button variant="ghost" size="icon" onClick={()=>{setEditData(inc);setIsAddModalOpen(true);}}><Pencil className="h-4 w-4 text-blue-600"/></Button><Button variant="ghost" size="icon" onClick={()=>handleDelete(inc.id)}><Trash2 className="h-4 w-4 text-red-600"/></Button></td></tr>))}</tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}

        <AddIncomeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => fetchHistory(startDate, endDate)} editData={editData} />
        <SetMonthlyIncomeModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} onSuccess={fetchPlanner} monthData={selectedMonth} year={year} />

      </div>
    </DashboardLayout>
  );
}