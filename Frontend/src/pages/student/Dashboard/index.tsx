import { useDashboard } from '@/hooks';
import { StatCard, LoadingPage, PageHeader, StatusBadge } from '@/components/ui';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { data, isLoading } = useDashboard();
  if (isLoading) return <LoadingPage />;

  const student = data?.student;
  const stats = data?.stats || {};
  const recent = data?.recentAttendance || [];
  const courses = data?.courses || [];

  return (
    <div>
      <PageHeader
        title={`Hello, ${student?.name?.split(' ')[0] ?? 'Student'}`}
        subtitle={`${student?.matric_no} · ${student?.department} · ${student?.level}L`}
      />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Enrolled Courses" value={stats.totalCourses ?? 0} icon="📚" />
        <StatCard label="Attendance Records" value={stats.totalAttendance ?? 0} icon="✓" accent="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-200 mb-4">My Courses</h2>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No courses enrolled.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((c: any) => (
                <div key={c.course_id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
                  <div>
                    <span className="text-xs font-mono text-primary-400">{c.course_code}</span>
                    <p className="text-sm text-slate-200">{c.title}</p>
                  </div>
                  <span className="text-xs text-slate-500">{c.lecturer}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent attendance */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Recent Attendance</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No recent attendance records.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((a: any) => (
                <div key={a.attendance_id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
                  <div>
                    <p className="text-xs font-mono text-primary-400">{a.course?.course_code}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{format(new Date(a.timestamp), 'dd MMM yyyy, HH:mm')}</p>
                  </div>
                  <StatusBadge status={a.verification_status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
