import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';

const Dashboard = () => {
  // Using mock data for scaffolding until backend is fully connected
  const [stats, setStats] = useState({
    totalExpense: 1250,
    budget: 2000,
    remaining: 750
  });

  const chartData = [
    { name: 'Food', amount: 400 },
    { name: 'Travel', amount: 300 },
    { name: 'Bills', amount: 450 },
    { name: 'Other', amount: 100 },
  ];

  /* 
  // TODO: Uncomment when backend is fixed
  useEffect(() => {
    const fetchData = async () => {
        const res = await api.get('/analytics/getMonthlySummary.php?userId=...');
        // setStats(...)
    };
    fetchData();
  }, []); 
  */

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalExpense}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.budget}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                ${stats.remaining}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;