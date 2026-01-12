import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Wallet } from "lucide-react";
import api from "@/api/axios";
import AddExpenseModal from "@/components/dashboard/AddExpenseModal";
import EditExpenseModal from "@/components/dashboard/EditExpenseModal";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expense/getAllExpenses.php");
      if (res.data.status) {
        setExpenses(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load expenses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.post("/expense/deleteExpense.php", { id });
      fetchExpenses();
    } catch (error) { console.error(error); }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsEditOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses</h1>
                <p className="text-muted-foreground">Manage all your transactions.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-gray-500" />
                    Transaction History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No expenses found.</div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b bg-gray-50/50">
                                <tr className="border-b transition-colors">
                                    <th className="h-12 px-4 font-medium text-gray-500">Date</th>
                                    <th className="h-12 px-4 font-medium text-gray-500">Category</th>
                                    <th className="h-12 px-4 font-medium text-gray-500">Sub-Category</th>
                                    <th className="h-12 px-4 font-medium text-gray-500">Description</th>
                                    <th className="h-12 px-4 font-medium text-gray-500 text-right">Amount</th>
                                    <th className="h-12 px-4 font-medium text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {expenses.map((txn) => (
                                    <tr key={txn.id} className="border-b transition-colors hover:bg-gray-50">
                                        <td className="p-4">{txn.date}</td>
                                        <td className="p-4 font-medium">{txn.category_name}</td>
                                        <td className="p-4 text-gray-500">{txn.sub_category_name || "-"}</td>
                                        <td className="p-4 text-gray-500">{txn.description}</td>
                                        <td className="p-4 text-right font-bold text-red-600">
                                            - NPR {parseFloat(txn.amount).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(txn)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(txn.id)}>
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
        <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchExpenses} />
        <EditExpenseModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={fetchExpenses} expense={selectedExpense} />
      </div>
    </DashboardLayout>
  );
}