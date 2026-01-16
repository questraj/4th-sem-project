import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, AlertTriangle, CheckCircle, Download } from "lucide-react";
import api from "@/api/axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function FinancialReport() {
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef(null);

  const [data, setData] = useState({
    weekly: { budget: 0, spent: 0 },
    monthly: { budget: 0, spent: 0 },
    yearly: { budget: 0, spent: 0 },
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
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

  // --- PDF GENERATION LOGIC ---
  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    setPdfLoading(true);

    try {
      // Configuration to ensure stability
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        // This helps prevent cloning issues with certain CSS features
        onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('[data-print-target]');
            if(clonedElement) {
                clonedElement.style.fontFamily = 'Arial, sans-serif'; // Enforce simple font
            }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20);
      
      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`Financial_Report_${dateStr}.pdf`);

    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setPdfLoading(false);
    }
  };

  // --- CONTENT GENERATION ---
  const generateParagraph = (period, name) => {
    const { budget, spent } = period;
    const diff = budget - spent;
    const percent = budget > 0 ? ((spent / budget) * 100).toFixed(1) : 0;

    if (budget === 0) return `For your ${name} expenses, you have spent NPR ${spent.toLocaleString()} so far. No budget limit has been set for this period.`;
    
    // Using inline hex colors strictly
    if (spent > budget) {
      return `For your ${name} budget, you are currently <span style="font-weight:bold; color:#dc2626;">over budget</span>. You have spent NPR ${spent.toLocaleString()} against a limit of NPR ${budget.toLocaleString()}, exceeding it by NPR ${Math.abs(diff).toLocaleString()}. This is a utilization of ${percent}%.`;
    } else {
      return `For your ${name} budget, you are <span style="font-weight:bold; color:#16a34a;">on track</span>. You have spent NPR ${spent.toLocaleString()} out of NPR ${budget.toLocaleString()}, leaving you with NPR ${diff.toLocaleString()} (${(100 - percent).toFixed(1)}%) remaining.`;
    }
  };

  const getOverallHealth = () => {
    const wHealth = data.weekly.spent <= data.weekly.budget || data.weekly.budget === 0;
    const mHealth = data.monthly.spent <= data.monthly.budget || data.monthly.budget === 0;
    
    if (wHealth && mHealth) return { status: "Excellent", color: "#16a34a", icon: CheckCircle };
    if (!wHealth && !mHealth) return { status: "Critical", color: "#dc2626", icon: AlertTriangle };
    return { status: "Needs Attention", color: "#f97316", icon: AlertTriangle };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center text-gray-400">
          <div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Generating Analysis...</div>
        </CardContent>
      </Card>
    );
  }

  const health = getOverallHealth();
  const Icon = health.icon;

  return (
    <div 
      ref={reportRef}
      data-print-target="true"
      className="rounded-xl border shadow-sm"
      style={{ 
        backgroundColor: "#ffffff", 
        borderColor: "#e5e7eb",
        borderWidth: "1px",
        borderStyle: "solid"
      }}
    >
      {/* Header */}
      <div 
        className="flex flex-row items-center justify-between p-6 pb-2"
        style={{ borderBottom: "1px solid #f3f4f6" }}
      >
        <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "#1f2937" }}>
          {/* Explicitly coloring the icon wrapper */}
          <span style={{ color: "#2563eb", display: "flex", alignItems: "center" }}>
            <FileText size={20} />
          </span>
          Financial Health Report
        </div>
        
        <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div 
                className="flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full shadow-sm"
                style={{ 
                    backgroundColor: "#ffffff", 
                    color: health.color,
                    border: `1px solid ${health.color}`,
                    opacity: 0.9
                }}
            >
                <Icon size={14} /> {health.status}
            </div>

            {/* Download Button - Ignored by html2canvas */}
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadPDF} 
                disabled={pdfLoading}
                className="ml-2 hidden md:flex" 
                data-html2canvas-ignore="true"
            >
                {pdfLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4" />}
            </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 pt-6 space-y-4 leading-relaxed" style={{ color: "#374151", fontSize: "15px" }}>
        <p dangerouslySetInnerHTML={{ __html: generateParagraph(data.weekly, "weekly") }} />
        <p dangerouslySetInnerHTML={{ __html: generateParagraph(data.monthly, "monthly") }} />
        <p dangerouslySetInnerHTML={{ __html: generateParagraph(data.yearly, "yearly") }} />
        
        {/* Summary Box */}
        <div 
            className="mt-4 p-4 rounded-lg text-sm"
            style={{ 
                backgroundColor: "#eff6ff", 
                color: "#1e40af", 
                border: "1px solid #dbeafe"
            }}
        >
            <strong>Summary:</strong> Total expenditure this year stands at 
            <span style={{ fontWeight: "bold" }}> NPR {data.yearly.spent.toLocaleString()}</span>. 
            {data.monthly.spent > data.monthly.budget && data.monthly.budget > 0 
                ? " Ideally, you should reduce spending in non-essential categories to get back on track for the month." 
                : " Maintain this spending habit to maximize your yearly savings."}
        </div>
      </div>
    </div>
  );
}