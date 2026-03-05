import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ArrowRight,
  Receipt,
  RefreshCw
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { API_URL } from '@/config';

interface DashboardStats {
  total_invoices: number;
  total_billed: number;
  total_overcharges: number;
  total_savings: number;
  duplicate_count: number;
  gst_errors: number;
  avg_compliance_score: number;
  vendor_breakdown: Record<string, { count: number; amount: number; issues: number }>;
}

interface RecentInvoice {
  id: string;
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  audit: {
    compliance_score: number;
    issue_count: number;
    issues: Array<{ rule: string; severity: string; description: string }>;
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch stats
      const statsResponse = await fetch(`${API_URL}/dashboard/stats`, {
        credentials: 'include',
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent invoices
      const invoicesResponse = await fetch(`${API_URL}/invoices`, {
        credentials: 'include',
      });

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setRecentInvoices(invoicesData.invoices.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-[#10B981]';
    if (score >= 70) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  const getComplianceBg = (score: number) => {
    if (score >= 90) return 'bg-[#10B981]';
    if (score >= 70) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA]">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <main
        className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-[rgba(11,13,16,0.12)] flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-display font-semibold text-[#0B0D10]">Dashboard</h1>
            <p className="text-xs text-[#6B7280]">Overview of your invoice audits</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/upload')}
              className="bg-[#2F8E92] hover:bg-[#3BA3A7] gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Invoice
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Invoices */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-micro text-[#6B7280] mb-1">Total Invoices</p>
                    <p className="text-3xl font-display font-semibold text-[#0B0D10]">
                      {isLoading ? '-' : stats?.total_invoices || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-[rgba(47,142,146,0.1)] rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-[#2F8E92]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Billed */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-micro text-[#6B7280] mb-1">Total Billed</p>
                    <p className="text-3xl font-display font-semibold text-[#0B0D10]">
                      {isLoading ? '-' : formatCurrency(stats?.total_billed || 0)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-[rgba(11,13,16,0.06)] rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#6B7280]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overcharges */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-micro text-[#6B7280] mb-1">Overcharges</p>
                    <p className="text-3xl font-display font-semibold text-[#EF4444]">
                      {isLoading ? '-' : formatCurrency(stats?.total_overcharges || 0)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-[rgba(239,68,68,0.1)] rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Potential Savings */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-micro text-[#6B7280] mb-1">Potential Savings</p>
                    <p className="text-3xl font-display font-semibold text-[#10B981]">
                      {isLoading ? '-' : formatCurrency(stats?.total_savings || 0)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-[rgba(16,185,129,0.1)] rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Compliance Score */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-micro text-[#6B7280]">Compliance Score</p>
                  <CheckCircle className="w-4 h-4 text-[#6B7280]" />
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-display font-semibold ${getComplianceColor(stats?.avg_compliance_score || 100)}`}>
                    {isLoading ? '-' : `${stats?.avg_compliance_score || 100}%`}
                  </span>
                </div>
                <div className="mt-4 progress-bar">
                  <div
                    className={`progress-bar-fill ${getComplianceBg(stats?.avg_compliance_score || 100)}`}
                    style={{ width: `${stats?.avg_compliance_score || 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Duplicates */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-micro text-[#6B7280]">Duplicate Invoices</p>
                  <FileText className="w-4 h-4 text-[#6B7280]" />
                </div>
                <p className="text-4xl font-display font-semibold text-[#0B0D10]">
                  {isLoading ? '-' : stats?.duplicate_count || 0}
                </p>
                <p className="text-sm text-[#6B7280] mt-2">
                  Potential double payments detected
                </p>
              </CardContent>
            </Card>

            {/* GST Errors */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-micro text-[#6B7280]">GST Errors</p>
                  <AlertTriangle className="w-4 h-4 text-[#6B7280]" />
                </div>
                <p className="text-4xl font-display font-semibold text-[#0B0D10]">
                  {isLoading ? '-' : stats?.gst_errors || 0}
                </p>
                <p className="text-sm text-[#6B7280] mt-2">
                  Tax calculation mismatches
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-display font-semibold">Recent Invoices</CardTitle>
                <p className="text-sm text-[#6B7280]">Latest uploaded and audited invoices</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reports')}
                className="gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[rgba(11,13,16,0.04)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-[#9CA3AF]" />
                  </div>
                  <p className="text-[#6B7280]">No invoices uploaded yet</p>
                  <Button
                    onClick={() => navigate('/upload')}
                    className="mt-4 bg-[#2F8E92] hover:bg-[#3BA3A7]"
                  >
                    Upload Your First Invoice
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Vendor</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Issues</th>
                        <th>Compliance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((invoice) => (
                        <tr key={invoice.id} className="cursor-pointer" onClick={() => navigate('/reports')}>
                          <td className="font-mono text-sm">{invoice.invoice_number}</td>
                          <td className="font-medium">{invoice.vendor_name}</td>
                          <td className="text-[#6B7280]">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </td>
                          <td className="font-medium">
                            {formatCurrency(invoice.total_amount)}
                          </td>
                          <td>
                            {invoice.audit?.issue_count > 0 ? (
                              <span className="badge badge-warning">
                                {invoice.audit.issue_count} issues
                              </span>
                            ) : (
                              <span className="badge badge-success">Clean</span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${getComplianceBg(invoice.audit?.compliance_score || 100)}`}
                              />
                              <span className={`text-sm ${getComplianceColor(invoice.audit?.compliance_score || 100)}`}>
                                {invoice.audit?.compliance_score || 100}%
                              </span>
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
        </div>
      </main>
    </div>
  );
}
