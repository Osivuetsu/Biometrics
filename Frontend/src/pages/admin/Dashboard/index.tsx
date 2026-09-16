import { useDashboard } from '@/hooks';
import { StatCard, LoadingPage, PageHeader } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <LoadingPage />;

  const stats = data?.stats || {};
  const recent = data?.recentAttendance || [];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="System overview" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Students" value={stats.totalStudents ?? 0} icon="👤" />
        <StatCard label="Lecturers" value={stats.totalLecturers ?? 0} icon="🎓" accent="text-violet-400" />
        <StatCard label="Courses" value={stats.totalCourses ?? 0} icon="📚" accent="text-sky-400" />
        <StatCard label="Enrollments" value={stats.totalEnrollments ?? 0} icon="📋" accent="text-amber-400" />
        <StatCard label="Today's Attendance" value={stats.todayAttendance ?? 0} icon="✓" accent="text-emerald-400" />
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-slate-200 mb-4">Recent Attendance</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No attendance recorded today.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((a: any) => (
              <div key={a.attendance_id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-200">{a.student?.name}</p>
                  <p className="text-xs text-slate-500">{a.course?.course_code} · {a.student?.matric_no}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.verification_status} />
                  <span className="text-xs text-slate-500">{format(new Date(a.timestamp), 'HH:mm')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
