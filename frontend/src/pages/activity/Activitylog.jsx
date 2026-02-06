import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Button
import { CalendarClock, Activity, Plus } from "lucide-react"; // Import Plus icon
import api from "@/api/axios";
import AddExpenseModal from "@/components/dashboard/AddExpenseModal"; // Import the Modal

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the Add Modal
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Defined as useCallback so we can reuse it for refreshing data
  const fetchData = useCallback(async () => {
    try {
      const [logRes, pendingRes] = await Promise.all([
          api.get("/user/getLogs.php"),
          api.get("/expense/getPendingExpenses.php")
      ]);

      if (logRes.data.success) setLogs(logRes.data.data);
      if (pendingRes.data.success) setPending(pendingRes.data.data);
    } catch (error) {
      console.error("Failed to fetch activity data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-gray-900">Activity & Schedules</h1>
           <p className="text-muted-foreground">View upcoming bills and system transaction history.</p>
        </div>

        {/* 1. UPCOMING EXPENSES SECTION */}
        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <CalendarClock className="h-5 w-5" /> Upcoming Scheduled Expenses
                </CardTitle>
                
                {/* NEW: Button to open Add Modal */}
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                    onClick={() => setIsAddOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-1" /> Schedule New
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? <p className="text-sm text-gray-400">Loading...</p> : 
                 pending.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                        No future expenses scheduled.
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {pending.map((item) => (
                            <div key={item.id} className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">{item.date}</span>
                                        <span className="font-bold text-gray-800">NPR {parseFloat(item.amount).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">{item.category_name}</p>
                                    <p className="text-xs text-gray-500 italic truncate">{item.description || "No description"}</p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-yellow-100 text-xs text-yellow-700 flex items-center gap-1">
                                    Status: <span className="font-bold">Pending Confirmation</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* 2. TRANSACTION LOGS SECTION */}
        <Card>
            <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Activity className="h-5 w-5" /> System Transaction Log
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    {loading ? <div className="p-8 text-center">Loading logs...</div> : 
                     logs.length === 0 ? <div className="p-8 text-center text-gray-400">No activity recorded.</div> : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Action</th>
                                    <th className="px-6 py-3 font-medium">Details</th>
                                    <th className="px-6 py-3 font-medium text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${log.action.includes('ADDED') ? 'bg-green-100 text-green-800' : 
                                                  log.action.includes('SCHEDULED') ? 'bg-yellow-100 text-yellow-800' :
                                                  log.action.includes('CONFIRMED') ? 'bg-blue-100 text-blue-800' :
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {log.action.toLowerCase().replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{log.details}</td>
                                        <td className="px-6 py-4 text-right text-gray-400 text-xs font-mono">
                                            {log.created_at}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Reuse the Add Expense Modal */}
        <AddExpenseModal 
            isOpen={isAddOpen} 
            onClose={() => setIsAddOpen(false)} 
            onSuccess={fetchData} // Refresh list on success
        />

      </div>
    </DashboardLayout>
  );
}