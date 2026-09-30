import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertTriangle, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  User,
  BookOpen,
  Send,
  Upload,
  BarChart3,
  Tag,
  GraduationCap,
  Calendar,
  Lock,
  Eye
} from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.png';
import { StudentsList } from './StudentsList';

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
  { path: '/admin/exams', label: 'Exams', icon: BookOpen, superadminOnly: true },
  { path: '/admin/superadmin-exams', label: 'SuperAdmin Exams', icon: Eye, superadminOnly: true },
  { path: '/admin/exam-access', label: 'Exam Access', icon: Lock, superadminOnly: true },
  { path: '/admin/exam-release', label: 'Exam Release', icon: Send, superadminOnly: true },
  { path: '/admin/results', label: 'Results', icon: FileText },
  { path: '/admin/programmes', label: 'Programmes', icon: Calendar, superadminOnly: true },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/zionianplus', label: 'ZIONIANPLUS', icon: Upload, superadminOnly: true },
  { path: '/admin/violations', label: 'Violations', icon: AlertTriangle },
  { path: '/admin/settings', label: 'Settings', icon: Settings, superadminOnly: true },
  { path: '/admin/version-management', label: 'Version Management', icon: Tag, superadminOnly: true },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside 
      className={`bg-primary text-primary-foreground h-screen sticky top-0 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-primary-foreground/10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display font-bold text-lg">ZionExam</h1>
              <p className="text-xs text-primary-foreground/60">Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems
          .filter(item => {
            // For overseers, only show specific menu items
            if (admin?.role === 'overseer') {
              return ['Dashboard', 'Exams', 'Teachers', 'Programmes', 'Results'].includes(item.label);
            }
            // For superadmins, show all items
            if (admin?.role === 'superadmin') {
              return true;
            }
            // For regular admins, only show non-superadmin items
            return !item.superadminOnly;
          })
          .map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                isActive 
                  ? 'bg-primary-foreground text-primary' 
                  : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
              }`}
            >
              <item.icon size={20} />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          );
        })}

        {/* Students List Section */}
        <div className={`mt-4 ${collapsed ? 'hidden' : ''}`}>
          <button
            onClick={() => setShowStudents(!showStudents)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-primary-foreground/80 hover:bg-primary-foreground/10 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <User size={20} />
              {!collapsed && <span className="font-medium">Students</span>}
            </div>
            {!collapsed && (
              showStudents ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </button>
          
          {showStudents && !collapsed && (
            <div className="mt-2 bg-primary/20 rounded-lg overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                <StudentsList />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Admin Info & Logout */}
      <div className="p-3 border-t border-primary-foreground/10">
        {!collapsed && admin && (
          <div className="mb-3 px-3 py-2 bg-primary-foreground/5 rounded-lg">
            <p className="font-medium text-sm truncate">{admin.name}</p>
            <p className="text-xs text-primary-foreground/60 capitalize">{admin.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-foreground/80 hover:bg-destructive/20 hover:text-destructive-foreground transition-all duration-200"
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-primary border-2 border-primary-foreground/20 rounded-full p-1 hover:bg-primary/80 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default AdminSidebar;
