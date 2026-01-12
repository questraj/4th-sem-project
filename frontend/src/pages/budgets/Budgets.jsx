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
  
  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budget/getAllBudgets.php");
      if (res.data.success) {
        setBudgets(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load budgets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      await api.post("/budget/deleteBudget.php", { id });
      fetchBudgets(); // Refresh list
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setIsEditOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Budgets</h1>
                <p className="text-muted-foreground">Manage your spending limits.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add New Budget
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-gray-500" />
                    Budget History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : budgets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No budgets set yet.</div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Frequency Type</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount (NPR)</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Created Date</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {budgets.map((budget) => (
                                    <tr key={budget.id} className="border-b transition-colors hover:bg-gray-50">
                                        <td className="p-4 align-middle font-medium">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                budget.type === 'Weekly' ? 'bg-purple-100 text-purple-700' :
                                                budget.type === 'Yearly' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {budget.type}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle font-bold text-gray-900">
                                            {parseFloat(budget.amount).toLocaleString()}
                                        </td>
                                        <td className="p-4 align-middle text-gray-500">
                                            {new Date(budget.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
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

        {/* Modals */}
        <AddBudgetModal 
            isOpen={isAddOpen} 
            onClose={() => setIsAddOpen(false)} 
            onSuccess={fetchBudgets} 
        />
        
        <EditBudgetRowModal 
            isOpen={isEditOpen} 
            onClose={() => setIsEditOpen(false)} 
            onSuccess={fetchBudgets}
            budget={selectedBudget}
        />
      </div>
    </DashboardLayout>
  );
}