import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Wallet } from "lucide-react";
import api from "@/api/axios";
import AddBudgetModal from "@/components/dashboard/AddBudgetModal";
import EditBudgetRowModal from "@/components/dashboard/EditBudgetRowModal";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budget/getAllBudgets.php");
      if (res.data.success) setBudgets(res.data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try { await api.post("/budget/deleteBudget.php", { id }); fetchBudgets(); } catch (e) {}
  };

  const handleEdit = (budget) => { setSelectedBudget(budget); setIsEditOpen(true); };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Budgets</h1>
            <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add New Budget
            </Button>
        </div>

        <Card>
            <CardHeader><CardTitle>Budget History</CardTitle></CardHeader>
            <CardContent>
                <div className="relative w-full overflow-auto">
                    {/* TABLE STRUCTURE */}
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b bg-gray-50">
                            <tr className="border-b">
                                {/* COLUMN 1 */}
                                <th className="h-12 px-4 align-middle font-medium text-gray-500">Frequency Type</th>
                                {/* COLUMN 2 */}
                                <th className="h-12 px-4 align-middle font-medium text-gray-500">Amount (NPR)</th>
                                {/* COLUMN 3 */}
                                <th className="h-12 px-4 align-middle font-medium text-gray-500">Created Date</th>
                                {/* COLUMN 4 */}
                                <th className="h-12 px-4 align-middle font-medium text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map((budget) => (
                                <tr key={budget.id} className="border-b transition-colors hover:bg-gray-50">
                                    <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{budget.type}</span></td>
                                    <td className="p-4 font-bold">{parseFloat(budget.amount).toLocaleString()}</td>
                                    <td className="p-4 text-gray-500">{new Date(budget.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}><Pencil className="h-4 w-4 text-blue-600" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>

        <AddBudgetModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchBudgets} />
        <EditBudgetRowModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={fetchBudgets} budget={selectedBudget} />
      </div>
    </DashboardLayout>
  );
}