import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AddExpenseModal from '@/components/dashboard/AddExpenseModal';
import AddBudgetModal from '@/components/dashboard/AddBudgetModal';
import SetCategoryBudgetModal from '@/components/dashboard/SetCategoryBudgetModal';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
// Added 'Pencil' icon for the Edit button
import { DollarSign, TrendingUp, TrendingDown, Plus, Wallet, Target, Pencil } from 'lucide-react';
import api from '@/api/axios';

const Dashboard = () => {
  // --- STATE MANAGEMENT ---
  const [stats, setStats] = useState({ totalExpense: 0, budget: 0, budgetType: 'Monthly', remaining: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState({}); 

  // --- MODAL STATES ---
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCatBudgetModalOpen, setIsCatBudgetModalOpen] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      // 1. Get Global Budget
      const budgetRes = await api.get('/budget/getBudget.php');
      const budgetAmount = parseFloat(budgetRes.data.data?.amount || 0);
      const budgetType = budgetRes.data.data?.type || "Monthly"; 
      
      // 2. Get Expense Summary
      const analyticsRes = await api.get('/analytics/getMonthlySummary.php');
      let categories = [];
      let totalSpent = 0;
      
      if (analyticsRes.data.status) {
        totalSpent = parseFloat(analyticsRes.data.totalExpense || 0);
        categories = analyticsRes.data.byCategory.map(item => ({
          name: item.category,
          value: parseFloat(item.total)
        }));
      }

      // 3. Get Recent Transactions
      const txnRes = await api.get('/expense/getRecentExpenses.php');
      if (txnRes.data.status) {
        setRecentTxns(txnRes.data.data);
      }

      // 4. Get Category Specific Budgets
      try {
        const catBudgetRes = await api.get('/budget/getCategoryBudgets.php');
        if (catBudgetRes.data.success) {
          setCategoryBudgets(catBudgetRes.data.data);
        }
      } catch (e) {
        console.warn("Category budgets fetch failed", e);
      }

      // 5. Update State
      setStats({
        totalExpense: totalSpent,
        budget: budgetAmount,
        budgetType: budgetType,
        remaining: budgetAmount - totalSpent
      });
      setChartData(categories);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Logic: Check if budget is greater than 0
  const isBudgetSet = stats.budget > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your finances</p>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsCatBudgetModalOpen(true)} 
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100"
            >
              <Target className="mr-2 h-4 w-4" /> Limit Category
            </Button>

            {/* --- THIS IS THE DYNAMIC BUTTON --- */}
            <Button 
              variant="outline" 
              onClick={() => setIsBudgetModalOpen(true)} 
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white"
            >
              {isBudgetSet ? (
                // If budget exists: Show EDIT
                <><Pencil className="mr-2 h-4 w-4" /> Edit Total Budget</>
              ) : (
                // If no budget: Show SET
                <><Wallet className="mr-2 h-4 w-4" /> Set Total Budget</>
              )}
            </Button>
            
            <Button 
              onClick={() => setIsExpenseModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">NPR {stats.totalExpense.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                 {stats.budgetType || "Monthly"} Budget
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">NPR {stats.budget.toLocaleString()}</div>
            </CardContent>
          </Card> 

          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Remaining</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                NPR {stats.remaining.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Spending Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `NPR ${value.toLocaleString()}`} 
                          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }} 
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-lg">
                      <Wallet className="h-8 w-8 mb-2 opacity-20" />
                      <p>No expenses recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <CategoryBreakdown 
               categories={chartData} 
               categoryBudgets={categoryBudgets} 
            />
          </div>

          <div className="lg:col-span-1">
            <RecentTransactions transactions={recentTxns} />
          </div>
        </div>
      </div>

      {/* --- POPUP MODALS --- */}
      
      {/* 1. Add Budget Modal (With Edit Data Passed) */}
      <AddBudgetModal 
        isOpen={isBudgetModalOpen} 
        onClose={() => setIsBudgetModalOpen(false)} 
        onSuccess={fetchData}
        currentAmount={stats.budget}     // <--- Pass Amount
        currentType={stats.budgetType}   // <--- Pass Type
      />

      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        onSuccess={fetchData} 
      />
      
      <SetCategoryBudgetModal 
        isOpen={isCatBudgetModalOpen} 
        onClose={() => setIsCatBudgetModalOpen(false)} 
        onSuccess={fetchData} 
      />

    </DashboardLayout>
  );
};

export default Dashboard;