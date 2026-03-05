import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/metrics', icon: BarChart3, label: 'Metrics' },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <aside 
      className={`h-screen fixed left-0 top-0 z-40 bg-white border-r border-[rgba(11,13,16,0.12)] transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[rgba(11,13,16,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2F8E92] rounded-xl flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-display font-semibold text-lg text-[#0B0D10]">
              InvoiceAI
            </span>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#2F8E92] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#3BA3A7] transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[rgba(47,142,146,0.1)] text-[#2F8E92]' 
                  : 'text-[#6B7280] hover:bg-[rgba(11,13,16,0.04)] hover:text-[#0B0D10]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#2F8E92]' : ''}`} />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[rgba(11,13,16,0.12)]">
        {/* Settings */}
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-[#6B7280] hover:bg-[rgba(11,13,16,0.04)] hover:text-[#0B0D10] ${
            isSettingsOpen ? 'bg-[rgba(11,13,16,0.04)]' : ''
          }`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium text-sm">Settings</span>
          )}
        </button>

        {/* User Info & Logout */}
        <div className="mt-2 pt-2 border-t border-[rgba(11,13,16,0.08)]">
          {!isCollapsed && user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-[#0B0D10] truncate">{user.name}</p>
              <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-[#6B7280] hover:bg-[rgba(239,68,68,0.08)] hover:text-[#EF4444]"
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
