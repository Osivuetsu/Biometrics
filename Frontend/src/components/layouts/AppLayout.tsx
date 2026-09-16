import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { ToastContainer } from '@/components/ui';
import { clsx } from 'clsx';

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/admin/students', label: 'Students', icon: '👤' },
  { to: '/admin/lecturers', label: 'Lecturers', icon: '🎓' },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/face-enrollment', label: 'Face Enrollment', icon: '👁' },
  { to: '/admin/attendance', label: 'Attendance', icon: '✓' },
  { to: '/admin/reports', label: 'Reports', icon: '📊' },
];

const lecturerNav = [
  { to: '/lecturer/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/lecturer/courses', label: 'My Courses', icon: '📚' },
  { to: '/lecturer/take-attendance', label: 'Take Attendance', icon: '👁' },
  { to: '/lecturer/reports', label: 'Reports', icon: '📊' },
];

const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/student/courses', label: 'My Courses', icon: '📚' },
  { to: '/student/attendance', label: 'Attendance', icon: '✓' },
  { to: '/student/profile', label: 'Profile', icon: '👤' },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const navigate = useNavigate();

  const navItems =
    user?.role === 'ADMIN' ? adminNav :
    user?.role === 'LECTURER' ? lecturerNav : studentNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside className={clsx(
        'flex flex-col bg-surface-card border-r border-surface-border transition-all duration-200',
        sidebarOpen ? 'w-56' : 'w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">AE</span>
          </div>
          {sidebarOpen && <span className="font-bold text-slate-100 text-sm">AttendEye</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors duration-150',
                isActive
                  ? 'bg-primary-600/20 text-primary-400 font-medium'
                  : 'text-slate-400 hover:bg-surface-border hover:text-slate-200'
              )}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-surface-border p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center text-primary-400 text-xs font-bold flex-shrink-0">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{user?.username}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center text-slate-500 hover:text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-surface-card border-b border-surface-border flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={toggleSidebar} className="text-slate-400 hover:text-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <span className="text-xs text-slate-500 bg-surface border border-surface-border px-2 py-1 rounded">
            {user?.role}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
