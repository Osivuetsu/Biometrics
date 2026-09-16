import { clsx } from 'clsx';

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <div className={clsx(
    'animate-spin rounded-full border-2 border-surface-border border-t-primary-500',
    size === 'sm' && 'w-4 h-4',
    size === 'md' && 'w-6 h-6',
    size === 'lg' && 'w-10 h-10',
  )} />
);

// ── Loading page ──────────────────────────────────────────────────────────────
export const LoadingPage = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState = ({ message = 'No records found' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
    <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
    </svg>
    <p className="text-sm">{message}</p>
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps { label: string; value: string | number; icon: React.ReactNode; accent?: string; }
export const StatCard = ({ label, value, icon, accent = 'text-primary-500' }: StatCardProps) => (
  <div className="card flex items-center gap-4">
    <div className={clsx('text-3xl', accent)}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'VERIFIED') return <span className="badge-verified">Verified</span>;
  if (status === 'FAILED') return <span className="badge-failed">Failed</span>;
  return <span className="badge-pending">Pending</span>;
};

// ── Page header ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ── Toast container ───────────────────────────────────────────────────────────
import { useUiStore } from '@/store/uiStore';

export const ToastContainer = () => {
  const { toasts, removeToast } = useUiStore();
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} onClick={() => removeToast(t.id)}
          className={clsx(
            'px-4 py-3 rounded-lg shadow-lg text-sm font-medium cursor-pointer transition-all',
            t.type === 'success' && 'bg-emerald-600 text-white',
            t.type === 'error' && 'bg-red-600 text-white',
            t.type === 'info' && 'bg-primary-600 text-white',
          )}>
          {t.message}
        </div>
      ))}
    </div>
  );
};
