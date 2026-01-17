import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import api from "@/api/axios";

export default function FinancialReport() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    weekly: { budget: 0, spent: 0 },
    monthly: { budget: 0, spent: 0 },
    yearly: { budget: 0, spent: 0 },
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch everything in parallel using existing endpoints
        const [
          wBudget, wExp,
          mBudget, mExp,
          yBudget, yExp
        ] = await Promise.all([
          api.get('/budget/getBudget.php?type=Weekly'),
          api.get('/analytics/getExpenseSummary.php?period=Weekly'),
          api.get('/budget/getBudget.php?type=Monthly'),
          api.get('/analytics/getExpenseSummary.php?period=Monthly'),
          api.get('/budget/getBudget.php?type=Yearly'),
          api.get('/analytics/getExpenseSummary.php?period=Yearly'),
        ]);

        setData({
          weekly: { 
            budget: parseFloat(wBudget.data.data?.amount || 0), 
            spent: parseFloat(wExp.data.totalExpense || 0) 
          },
          monthly: { 
            budget: parseFloat(mBudget.data.data?.amount || 0), 
            spent: parseFloat(mExp.data.totalExpense || 0) 
          },
          yearly: { 
            budget: parseFloat(yBudget.data.data?.amount || 0), 
            spent: parseFloat(yExp.data.totalExpense || 0) 
          },
        });
      } catch (error) {
        console.error("Failed to generate report", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center text-gray-400">
          <div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Generating Analysis...</div>
        </CardContent>
      </Card>
    );
  }

  // --- REPORT GENERATION LOGIC ---

  const generateParagraph = (period, name) => {
    const { budget, spent } = period;
    const diff = budget - spent;
    const percent = budget > 0 ? ((spent / budget) * 100).toFixed(1) : 0;

    if (budget === 0) return `For your ${name} expenses, you have spent NPR ${spent.toLocaleString()} so far. No budget limit has been set for this period.`;
    
    if (spent > budget) {
      return `For your ${name} budget, you are currently <span class="font-bold text-red-600">over budget</span>. You have spent NPR ${spent.toLocaleString()} against a limit of NPR ${budget.toLocaleString()}, exceeding it by NPR ${Math.abs(diff).toLocaleString()}. This is a utilization of ${percent}%.`;
    } else {
      return `For your ${name} budget, you are <span class="font-bold text-green-600">on track</span>. You have spent NPR ${spent.toLocaleString()} out of NPR ${budget.toLocaleString()}, leaving you with NPR ${diff.toLocaleString()} (${(100 - percent).toFixed(1)}%) remaining.`;
    }
  };

  const getOverallHealth = () => {
    const wHealth = data.weekly.spent <= data.weekly.budget || data.weekly.budget === 0;
    const mHealth = data.monthly.spent <= data.monthly.budget || data.monthly.budget === 0;
    
    if (wHealth && mHealth) return { status: "Excellent", color: "text-green-600", icon: CheckCircle };
    if (!wHealth && !mHealth) return { status: "Critical", color: "text-red-600", icon: AlertTriangle };
    return { status: "Needs Attention", color: "text-orange-500", icon: AlertTriangle };
  };

  const health = getOverallHealth();
  const Icon = health.icon;

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <FileText className="h-5 w-5 text-blue-600" /> Financial Health Report
        </CardTitle>
        <div className={`flex items-center gap-1 text-sm font-bold ${health.color} bg-white px-3 py-1 rounded-full shadow-sm`}>
            <Icon size={14} /> {health.status}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 text-gray-700 leading-relaxed text-sm md:text-base">
        <p dangerouslySetInnerHTML={{ __html: generateParagraph(data.weekly, "weekly") }} />
        <p dangerouslySetInnerHTML={{ __html: generateParagraph(data.monthly, "monthly") }} />
        <p dangerouslySetInnerHTML={{ __html: generateParagraph(data.yearly, "yearly") }} />
        
        <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
            <strong>Summary:</strong> Total expenditure this year stands at 
            <span className="font-bold"> NPR {data.yearly.spent.toLocaleString()}</span>. 
            {data.monthly.spent > data.monthly.budget && data.monthly.budget > 0 
                ? " Ideally, you should reduce spending in non-essential categories to get back on track for the month." 
                : " Maintain this spending habit to maximize your yearly savings."}
        </div>
      </CardContent>
    </Card>
  );
}