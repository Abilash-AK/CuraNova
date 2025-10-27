import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/react-app/contexts/AuthContext";
import { useRole } from "@/react-app/contexts/RoleContext";
import ThemeToggle from "./ThemeToggle";
import { 
  Home,
  Users,
  UserPlus,
  Stethoscope,
  LogOut,
  Menu,
  X,
  Search
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { role, isDoctor } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check for demo user
  const demoUser = localStorage.getItem('demo-user');
  const demoSession = localStorage.getItem('demo-session');
  let currentUser = user;
  
  if (demoUser && demoSession && !user) {
    currentUser = JSON.parse(demoUser);
  }

  const handleLogout = async () => {
    // Always clear local storage first
    localStorage.removeItem('demo-user');
    localStorage.removeItem('demo-session');
    
    try {
      // Call the logout API endpoint directly to clear server-side session
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      });
    } catch {
      // Logout API call failed, continue with logout process
    }
    
    try {
      // Call the regular logout if user exists
      if (user) {
        await logout();
      }
    } catch {
      // Auth service logout failed, continue with logout process
    }
    
    // Always navigate to login page regardless of any errors above
    navigate('/login', { replace: true });
    
    // Force a page reload to clear any remaining auth state
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Add Patient', href: '/patients/add', icon: UserPlus },
    ...(isDoctor ? [
      { name: 'Similar Conditions', href: '/similar-conditions', icon: Search },
    ] : []),
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (demoUser && demoSession && !user) {
      const parsedDemoUser = JSON.parse(demoUser) as { name?: string };
      return parsedDemoUser.name || 'Demo User';
    }
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    return displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">CuraNova</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{role} Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentUser?.email || 'No email'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {getUserDisplayName().split(' ')[0]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
