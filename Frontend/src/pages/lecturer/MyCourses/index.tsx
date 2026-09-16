// pages/lecturer/MyCourses/index.tsx
import { useCourses } from '@/hooks';
import { PageHeader, LoadingPage } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import type { Course } from '@/types';

export default function MyCourses() {
  const { data, isLoading } = useCourses();
  const navigate = useNavigate();
  if (isLoading) return <LoadingPage />;
  return (
    <div>
      <PageHeader title="My Courses" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data?.map((c: Course) => (
          <div key={c.course_id} className="card cursor-pointer hover:border-primary-500/50 transition-colors"
            onClick={() => navigate(`/lecturer/courses/${c.course_id}/students`)}>
            <span className="text-xs font-mono text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded">{c.course_code}</span>
            <h3 className="text-base font-semibold text-slate-200 mt-2">{c.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{c._count?.enrollments ?? 0} students enrolled</p>
          </div>
        ))}
      </div>
    </div>
  );
}
