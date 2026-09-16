import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAttendanceSummary } from '@/hooks';
import { PageHeader, LoadingPage } from '@/components/ui';
import api from '@/services/api';
import type { ApiResponse, Course } from '@/types';

export default function CourseStudents() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const id = parseInt(courseId!);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['courses', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Course>>(`/courses/${id}`);
      return res.data.data!;
    },
    enabled: !!id,
  });

  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary(id);

  if (courseLoading || summaryLoading) return <LoadingPage />;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-200 mb-4 flex items-center gap-1">
        ← Back
      </button>
      <PageHeader
        title={`${course?.course_code} — ${course?.title}`}
        subtitle={`${(summary as any[])?.length ?? 0} enrolled students`}
        action={
          <button onClick={() => navigate('/lecturer/take-attendance')} className="btn-primary text-sm">
            Take Attendance
          </button>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              {['Matric No.', 'Name', 'Total Classes', 'Verified', 'Attendance %'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(summary as any[])?.map((row) => {
              const pct = row.total_classes > 0 ? (row.verified / row.total_classes) * 100 : 0;
              return (
                <tr key={row.student_id} className="border-b border-surface-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-xs text-primary-400">{row.matric_no}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.total_classes}</td>
                  <td className="px-4 py-3">{row.verified}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className={`text-xs font-medium ${pct >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
