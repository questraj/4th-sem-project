import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Activity, Plus } from "lucide-react";
import api from "@/api/axios";
import AddExpenseModal from "@/components/dashboard/AddExpenseModal";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

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

  const getStatusColor = (action) => {
    const act = action.toUpperCase();
    if (act.includes('ADDED') || act.includes('INCOME')) return 'bg-green-100 text-green-800';
    if (act.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (act.includes('UPDATE') || act.includes('SET') || act.includes('CHANGE')) return 'bg-blue-100 text-blue-800';
    if (act.includes('SCHEDULE') || act.includes('FUTURE')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-gray-900">Activity & Schedules</h1>
           <p className="text-muted-foreground">Detailed history of all your changes.</p>
        </div>

        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <CalendarClock className="h-5 w-5" /> Upcoming Scheduled Expenses
                </CardTitle>
                <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-200" onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Schedule New
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? <p className="text-sm">Loading...</p> : pending.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">No future expenses.</div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {pending.map((item) => (
                            <div key={item.id} className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">{item.date}</span>
                                    <span className="font-bold">NPR {parseFloat(item.amount).toLocaleString()}</span>
                                </div>
                                <p className="text-sm font-medium">{item.category_name}</p>
                                <p className="text-xs text-gray-500 truncate">{item.description || "No description"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" /> Transaction History Log
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    {!loading && logs.length > 0 ? (
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
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(log.action)}`}>
                                                {log.action.toLowerCase().replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{log.details}</td>
                                        <td className="px-6 py-4 text-right text-gray-400 text-xs">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-400">No activity recorded.</div>
                    )}
                </div>
            </CardContent>
        </Card>

        <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchData} />
      </div>
    </DashboardLayout>
  );
}