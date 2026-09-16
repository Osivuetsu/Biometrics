import { useDashboard } from '@/hooks';
import { StatCard, LoadingPage, PageHeader } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export default function LecturerDashboard() {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) return <LoadingPage />;

  const stats = data?.stats || {};
  const courses = data?.courses || [];

  return (
    <div>
      <PageHeader title={`Welcome, ${data?.lecturer?.name?.split(' ')[0] ?? 'Lecturer'}`}
        subtitle="Your teaching overview" />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Courses" value={stats.totalCourses ?? 0} icon="📚" />
        <StatCard label="Students" value={stats.totalStudents ?? 0} icon="👤" accent="text-violet-400" />
        <StatCard label="Today's Attendance" value={stats.todayAttendance ?? 0} icon="✓" accent="text-emerald-400" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-200">My Courses</h2>
          <button onClick={() => navigate('/lecturer/take-attendance')} className="btn-primary text-sm px-3 py-1.5">
            Take Attendance →
          </button>
        </div>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No courses assigned.</p>
        ) : (
          <div className="space-y-3">
            {courses.map((c: any) => (
              <div key={c.course_id}
                onClick={() => navigate(`/lecturer/courses/${c.course_id}/students`)}
                className="flex items-center justify-between p-3 rounded-lg border border-surface-border hover:bg-surface cursor-pointer transition-colors">
                <div>
                  <span className="text-xs font-mono text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded mr-2">{c.course_code}</span>
                  <span className="text-sm font-medium text-slate-200">{c.title}</span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>{c.enrolled} enrolled</p>
                  <p className="text-emerald-400">{c.today_attendance} today</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
