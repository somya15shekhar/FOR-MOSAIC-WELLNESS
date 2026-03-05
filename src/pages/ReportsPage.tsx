import { useState, useEffect } from 'react';
import {
  Download,
  Filter,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { API_URL } from '@/config';

interface AuditReport {
  id: string;
  invoice_id: string;
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  audit_date: string;
  issues: Array<{
    rule: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    amount: number;
    explanation?: string;
  }>;
  total_overcharge: number;
  potential_savings: number;
  compliance_score: number;
  issue_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

export default function ReportsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AuditReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/audit-reports`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setFilteredReports(data.reports);
      } else {
        toast.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Network error while fetching reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.vendor_name.toLowerCase().includes(query) ||
          report.invoice_number.toLowerCase().includes(query)
      );
    }

    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter((report) => {
        if (filterSeverity === 'critical') return report.critical_count > 0;
        if (filterSeverity === 'high') return report.high_count > 0;
        if (filterSeverity === 'medium') return report.medium_count > 0;
        if (filterSeverity === 'low') return report.low_count > 0;
        return true;
      });
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [searchQuery, filterSeverity, reports]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSeverityBadge = (report: AuditReport) => {
    if (report.critical_count > 0) {
      return <span className="badge badge-danger">{report.critical_count} Critical</span>;
    }
    if (report.high_count > 0) {
      return <span className="badge badge-warning">{report.high_count} High</span>;
    }
    if (report.medium_count > 0) {
      return <span className="badge badge-warning" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>{report.medium_count} Medium</span>;
    }
    if (report.low_count > 0) {
      return <span className="badge badge-accent">{report.low_count} Low</span>;
    }
    return <span className="badge badge-success">Clean</span>;
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-[#10B981]';
    if (score >= 70) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  const getIssueSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { bg: 'bg-[rgba(239,68,68,0.08)]', text: 'text-[#EF4444]', border: 'border-[rgba(239,68,68,0.2)]', icon: '🔴' };
      case 'HIGH': return { bg: 'bg-[rgba(245,158,11,0.08)]', text: 'text-[#F59E0B]', border: 'border-[rgba(245,158,11,0.2)]', icon: '🟠' };
      case 'MEDIUM': return { bg: 'bg-[rgba(59,130,246,0.08)]', text: 'text-[#3B82F6]', border: 'border-[rgba(59,130,246,0.2)]', icon: '🟡' };
      case 'LOW': return { bg: 'bg-[rgba(107,114,128,0.08)]', text: 'text-[#6B7280]', border: 'border-[rgba(107,114,128,0.2)]', icon: '🔵' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', icon: 'ℹ️' };
    }
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReportId((prev) => (prev === reportId ? null : reportId));
  };

  const exportReports = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(filteredReports, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-reports-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Reports exported as JSON');
    } else {
      // CSV export
      const headers = ['Invoice Number', 'Vendor', 'Date', 'Amount', 'Issues', 'Compliance Score', 'Potential Savings'];
      const rows = filteredReports.map((r) => [
        r.invoice_number,
        r.vendor_name,
        r.invoice_date,
        r.total_amount,
        r.issue_count,
        r.compliance_score,
        r.potential_savings,
      ]);
      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-reports-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Reports exported as CSV');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <h1 className="text-xl font-display font-semibold text-[#0B0D10]">Audit Reports</h1>
            <p className="text-xs text-[#6B7280]">Detailed analysis of all audited invoices</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReports('csv')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <Input
                    placeholder="Search by vendor or invoice number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#6B7280]" />
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="input-field py-2 px-3 w-40"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display font-semibold">
                All Reports ({filteredReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-[#2F8E92] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[#6B7280]">Loading reports...</p>
                </div>
              ) : paginatedReports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[rgba(11,13,16,0.04)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-[#9CA3AF]" />
                  </div>
                  <p className="text-[#6B7280]">No reports found</p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => { setSearchQuery(''); setFilterSeverity('all'); }}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}></th>
                          <th>Invoice #</th>
                          <th>Vendor</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Issues</th>
                          <th>Compliance</th>
                          <th>Savings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedReports.map((report) => {
                          const isExpanded = expandedReportId === report.id;
                          return (
                            <>
                              <tr
                                key={report.id}
                                className="group cursor-pointer"
                                onClick={() => toggleExpand(report.id)}
                                style={{ borderBottom: isExpanded ? 'none' : undefined }}
                              >
                                <td style={{ width: '40px', paddingRight: 0 }}>
                                  <ChevronDown
                                    className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  />
                                </td>
                                <td className="font-mono text-sm">{report.invoice_number}</td>
                                <td className="font-medium">{report.vendor_name}</td>
                                <td className="text-[#6B7280]">
                                  {new Date(report.invoice_date).toLocaleDateString()}
                                </td>
                                <td className="font-medium">
                                  {formatCurrency(report.total_amount)}
                                </td>
                                <td>{getSeverityBadge(report)}</td>
                                <td>
                                  <span className={`text-sm font-medium ${getComplianceColor(report.compliance_score)}`}>
                                    {report.compliance_score}%
                                  </span>
                                </td>
                                <td className="text-[#10B981] font-medium">
                                  {formatCurrency(report.potential_savings)}
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr key={`${report.id}-details`}>
                                  <td colSpan={8} className="p-0">
                                    <div className="px-6 py-4 bg-[rgba(47,142,146,0.03)] border-t border-b border-[rgba(47,142,146,0.1)]">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Info className="w-4 h-4 text-[#2F8E92]" />
                                        <h4 className="text-sm font-semibold text-[#0B0D10]">
                                          Issue Details — {report.issue_count} issue{report.issue_count !== 1 ? 's' : ''} found
                                        </h4>
                                      </div>
                                      {report.issues.length === 0 ? (
                                        <p className="text-sm text-[#6B7280] italic">No issues detected — invoice is clean.</p>
                                      ) : (
                                        <div className="space-y-3">
                                          {report.issues.map((issue, idx) => {
                                            const style = getIssueSeverityStyle(issue.severity);
                                            return (
                                              <div
                                                key={idx}
                                                className={`rounded-lg border ${style.border} ${style.bg} p-4`}
                                              >
                                                <div className="flex items-start justify-between gap-4">
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <span className="text-sm">{style.icon}</span>
                                                      <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>
                                                        {issue.severity} — {issue.rule.replace(/_/g, ' ')}
                                                      </span>
                                                    </div>
                                                    <p className="text-sm text-[#374151] leading-relaxed">
                                                      {issue.explanation || issue.description}
                                                    </p>
                                                  </div>
                                                  {issue.amount > 0 && (
                                                    <div className="flex-shrink-0 text-right">
                                                      <p className="text-xs text-[#6B7280]">Impact</p>
                                                      <p className={`text-sm font-semibold ${style.text}`}>
                                                        {formatCurrency(issue.amount)}
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgba(11,13,16,0.08)]">
                      <p className="text-sm text-[#6B7280]">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, filteredReports.length)} of{' '}
                        {filteredReports.length} reports
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-[#6B7280] px-3">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
