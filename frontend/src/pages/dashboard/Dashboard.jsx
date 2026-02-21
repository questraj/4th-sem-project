import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AddExpenseModal from '@/components/dashboard/AddExpenseModal';
import AddBudgetModal from '@/components/dashboard/AddBudgetModal';
import SetCategoryBudgetModal from '@/components/dashboard/SetCategoryBudgetModal';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import DueExpenseModal from '@/components/dashboard/DueExpenseModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Plus, Wallet, Pencil, Filter, ChevronDown, CalendarClock } from 'lucide-react';
import api from '@/api/axios';

const Dashboard = () => {
  // --- STATE MANAGEMENT ---
  const [stats, setStats] = useState({ totalExpense: 0, budget: 0, budgetType: 'Monthly', remaining: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState({}); 
  const [dueExpenses, setDueExpenses] = useState([]);
  const [currentDueIndex, setCurrentDueIndex] = useState(0);

  // --- FILTER STATE ---
  const [period, setPeriod] = useState("Monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- MODAL STATES ---
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCatBudgetModalOpen, setIsCatBudgetModalOpen] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const MONTHS = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  // Generate Year Options
  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  const fetchData = useCallback(async () => {
    try {
      const budgetRes = await api.get(`/budget/getBudget.php?type=${period}`);
      const budgetAmount = parseFloat(budgetRes.data.data?.amount || 0);
      
      const analyticsRes = await api.get(`/analytics/getExpenseSummary.php?period=${period}&month=${selectedMonth}&year=${selectedYear}`);
      
      let categories = [];
      let totalSpent = 0;
      
      if (analyticsRes.data.status) {
        totalSpent = parseFloat(analyticsRes.data.totalExpense || 0);
        categories = analyticsRes.data.byCategory.map(item => ({
          name: item.category,
          value: parseFloat(item.total)
        }));
      }

      const txnRes = await api.get('/expense/getRecentExpenses.php');
      if (txnRes.data.status) { setRecentTxns(txnRes.data.data); }

      try {
        const catBudgetRes = await api.get('/budget/getCategoryBudgets.php');
        if (catBudgetRes.data.success) { setCategoryBudgets(catBudgetRes.data.data); }
      } catch (e) { console.warn("Category budgets fetch failed", e); }

      try {
        const dueRes = await api.get('/expense/getDueExpenses.php');
        if (dueRes.data.success) { setDueExpenses(dueRes.data.data); }
      } catch (e) { console.warn("Due expenses fetch failed", e); }

      setStats({
        totalExpense: totalSpent,
        budget: budgetAmount,
        budgetType: period,
        remaining: budgetAmount - totalSpent
      });
      setChartData(categories);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  }, [period, selectedMonth, selectedYear]);

  useEffect(() => {
    // Wrap in an async function to satisfy linter and explicit intent
    const load = async () => { await fetchData(); };
    load();
  }, [fetchData]);

  const handleDueSuccess = () => {
    setDueExpenses(prev => prev.filter((_, idx) => idx !== currentDueIndex));
    fetchData(); 
  };

  const handleDueSkip = () => {
    setCurrentDueIndex(prev => prev + 1);
  };

  const isBudgetSet = stats.budget > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your finances</p>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsBudgetModalOpen(true)} 
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm"
                    >
                        {isBudgetSet ? (
                            <><Pencil className="mr-2 h-4 w-4" /> Edit {period} Budget</>
                        ) : (
                            <><Wallet className="mr-2 h-4 w-4" /> Set {period} Budget</>
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

            {/* --- PRETTIER FILTERS BAR --- */}
            <div className="flex flex-wrap items-center gap-3 p-1">
                
                {/* 1. View Type Selector */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-blue-600" />
                    </div>
                    <select 
                        className="appearance-none pl-9 pr-10 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 block w-full shadow-sm font-medium cursor-pointer transition-all hover:border-blue-300"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="Weekly">Weekly View</option>
                        <option value="Monthly">Monthly View</option>
                        <option value="Yearly">Yearly View</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>

                {/* 2. Dynamic Selectors */}
                {period === "Monthly" && (
                    <div className="flex items-center gap-3 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                         {/* Month */}
                        <div className="relative group">
                            <select 
                                className="appearance-none pl-4 pr-9 py-1.5 bg-transparent text-gray-700 text-sm font-medium focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            >
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500" />
                            </div>
                        </div>
                        
                        <div className="w-px h-5 bg-gray-200"></div>

                        {/* Year */}
                        <div className="relative group">
                            <select 
                                className="appearance-none pl-3 pr-8 py-1.5 bg-transparent text-gray-700 text-sm font-medium focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {YEARS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500" />
                            </div>
                        </div>
                    </div>
                )}

                {period === "Yearly" && (
                     <div className="relative group bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <CalendarClock className="h-4 w-4 text-gray-400" />
                        </div>
                        <select 
                            className="appearance-none pl-9 pr-10 py-2.5 bg-transparent text-gray-700 text-sm font-medium focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {YEARS.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">NPR {stats.totalExpense.toLocaleString()}</div>
              {/* Fixed CSS conflict: removed 'text-muted-foreground' */}
              <p className="text-xs mt-1 font-medium text-blue-600/80">
                  {period === 'Monthly' && `${MONTHS[selectedMonth-1].label} ${selectedYear}`}
                  {period === 'Yearly' && `Year ${selectedYear}`}
                  {period === 'Weekly' && `Current Week`}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                 {period} Budget Limit
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">NPR {stats.budget.toLocaleString()}</div>
            </CardContent>
          </Card> 

          <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
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

        {/* Charts & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center justify-between">
                    <span>Spending Distribution</span>
                    <span className="text-xs font-normal px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                        {period === 'Monthly' ? `${MONTHS[selectedMonth-1].label} ${selectedYear}` : period}
                    </span>
                </CardTitle>
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
                      <p>No expenses for this period</p>
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

      {/* --- MODALS --- */}
      <AddBudgetModal 
        isOpen={isBudgetModalOpen} 
        onClose={() => setIsBudgetModalOpen(false)} 
        onSuccess={fetchData}
        currentAmount={stats.budget}
        currentType={period}
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

      {dueExpenses.length > 0 && currentDueIndex < dueExpenses.length && (
         <DueExpenseModal 
            isOpen={true}
            expense={dueExpenses[currentDueIndex]}
            onClose={handleDueSkip}
            onSuccess={handleDueSuccess}
         />
      )}

    </DashboardLayout>
  );
};

export default Dashboard;