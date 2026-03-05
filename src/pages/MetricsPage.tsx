import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

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

// Chart colors defined inline in data

export default function MetricsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      toast.error('Network error while fetching metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare chart data
  const vendorData = stats?.vendor_breakdown
    ? Object.entries(stats.vendor_breakdown).map(([name, data]) => ({
      name,
      invoices: data.count,
      amount: data.amount,
      issues: data.issues,
    }))
    : [];

  const issueTypeData = [
    { name: 'Overcharges', value: stats?.total_overcharges || 0, color: '#EF4444' },
    { name: 'Duplicates', value: stats?.duplicate_count || 0, color: '#F59E0B' },
    { name: 'GST Errors', value: stats?.gst_errors || 0, color: '#8B5CF6' },
  ];

  const complianceTrendData = [
    { month: 'Jan', score: 85 },
    { month: 'Feb', score: 88 },
    { month: 'Mar', score: stats?.avg_compliance_score || 90 },
  ];

  const savingsData = [
    { month: 'Jan', savings: 25000 },
    { month: 'Feb', savings: 42000 },
    { month: 'Mar', savings: stats?.total_savings || 0 },
  ];

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
            <h1 className="text-xl font-display font-semibold text-[#0B0D10]">Analytics & Metrics</h1>
            <p className="text-xs text-[#6B7280]">Deep insights into your invoice auditing</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-micro text-[#6B7280]">Total Processed</p>
                  <BarChart3 className="w-4 h-4 text-[#6B7280]" />
                </div>
                <p className="text-3xl font-display font-semibold text-[#0B0D10]">
                  {isLoading ? '-' : stats?.total_invoices || 0}
                </p>
                <p className="text-sm text-[#10B981] mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-micro text-[#6B7280]">Total Billed</p>
                  <DollarSign className="w-4 h-4 text-[#6B7280]" />
                </div>
                <p className="text-3xl font-display font-semibold text-[#0B0D10]">
                  {isLoading ? '-' : formatCurrency(stats?.total_billed || 0)}
                </p>
                <p className="text-sm text-[#6B7280] mt-2">
                  Across all vendors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-micro text-[#6B7280]">Issues Detected</p>
                  <AlertTriangle className="w-4 h-4 text-[#6B7280]" />
                </div>
                <p className="text-3xl font-display font-semibold text-[#EF4444]">
                  {isLoading ? '-' : (stats?.duplicate_count || 0) + (stats?.gst_errors || 0)}
                </p>
                <p className="text-sm text-[#EF4444] mt-2 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-micro text-[#6B7280]">Money Saved</p>
                  <CheckCircle className="w-4 h-4 text-[#6B7280]" />
                </div>
                <p className="text-3xl font-display font-semibold text-[#10B981]">
                  {isLoading ? '-' : formatCurrency(stats?.total_savings || 0)}
                </p>
                <p className="text-sm text-[#10B981] mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Recovered funds
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Vendor Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold">
                  Vendor Breakdown
                </CardTitle>
                <p className="text-sm text-[#6B7280]">Invoices and amounts by vendor</p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,13,16,0.08)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(11,13,16,0.12)' }}
                      />
                      <YAxis
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(11,13,16,0.12)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid rgba(11,13,16,0.12)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 24px rgba(0,0,0,0.06)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="invoices" fill="#2F8E92" name="Invoices" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="issues" fill="#EF4444" name="Issues" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Issue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold">
                  Issue Distribution
                </CardTitle>
                <p className="text-sm text-[#6B7280]">Types of issues detected</p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={issueTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {issueTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid rgba(11,13,16,0.12)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 24px rgba(0,0,0,0.06)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold">
                  Compliance Trend
                </CardTitle>
                <p className="text-sm text-[#6B7280]">Average compliance score over time</p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={complianceTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,13,16,0.08)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(11,13,16,0.12)' }}
                      />
                      <YAxis
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(11,13,16,0.12)' }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid rgba(11,13,16,0.12)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 24px rgba(0,0,0,0.06)'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Compliance Score']}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#2F8E92"
                        strokeWidth={3}
                        dot={{ fill: '#2F8E92', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Savings Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold">
                  Savings Over Time
                </CardTitle>
                <p className="text-sm text-[#6B7280]">Potential savings identified</p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={savingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,13,16,0.08)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(11,13,16,0.12)' }}
                      />
                      <YAxis
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(11,13,16,0.12)' }}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid rgba(11,13,16,0.12)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 24px rgba(0,0,0,0.06)'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Savings']}
                      />
                      <Bar
                        dataKey="savings"
                        fill="#10B981"
                        name="Potential Savings"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
