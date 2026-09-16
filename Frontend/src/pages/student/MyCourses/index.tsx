// import { useCourses } from '@/hooks';
// import { PageHeader, LoadingPage } from '@/components/ui';
// import type { Course } from '@/types';

// export default function StudentMyCourses() {
//   const { data, isLoading } = useCourses();
//   if (isLoading) return <LoadingPage />;

//   return (
//     <div>
//       <PageHeader title="My Courses" subtitle={`${data?.data?.length ?? 0} courses enrolled`} />
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {data?.data?.map((c: Course) => (
//           <div key={c.course_id} className="card">
//             <div className="flex items-start justify-between mb-3">
//               <span className="text-xs font-mono text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded">
//                 {c.course_code}
//               </span>
//             </div>
//             <h3 className="text-base font-semibold text-slate-200">{c.title}</h3>
//             <p className="text-sm text-slate-500 mt-1">👤 {c.lecturer?.name}</p>
//             <p className="text-xs text-slate-600 mt-1">{c.lecturer?.email}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollment.service.frontend';
import { useUiStore } from '@/store/uiStore';
import { PageHeader, LoadingPage } from '@/components/ui';

export default function StudentMyCourses() {
  const [tab, setTab] = useState<'enrolled' | 'available'>('enrolled');
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['available-courses'],
    queryFn: enrollmentService.getAvailableCourses,
  });

  const enrollMutation = useMutation({
    mutationFn: enrollmentService.selfEnroll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['available-courses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Enrolled successfully', 'success');
    },
    onError: (e: any) => addToast(e.response?.data?.message || 'Enrollment failed', 'error'),
  });

  const unenrollMutation = useMutation({
    mutationFn: enrollmentService.selfUnenroll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['available-courses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Unenrolled successfully', 'success');
    },
    onError: (e: any) => addToast(e.response?.data?.message || 'Failed to unenroll', 'error'),
  });

  if (isLoading) return <LoadingPage />;

  const enrolled = courses?.filter((c: any) => c.is_enrolled) ?? [];
  const available = courses?.filter((c: any) => !c.is_enrolled) ?? [];
  const displayed = tab === 'enrolled' ? enrolled : available;

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle={`${enrolled.length} enrolled · ${available.length} available`}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1 w-fit mb-6">
        {(['enrolled', 'available'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t
                ? 'bg-primary-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}>
            {t === 'enrolled' ? `Enrolled (${enrolled.length})` : `Browse (${available.length})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-400">
            {tab === 'enrolled'
              ? 'You have not enrolled in any courses yet. Browse available courses.'
              : 'No more courses available to enroll in.'}
          </p>
          {tab === 'enrolled' && (
            <button onClick={() => setTab('available')} className="btn-primary mt-4 px-6">
              Browse Courses
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((c: any) => (
            <div key={c.course_id} className={`card flex flex-col justify-between gap-4 border ${
              c.is_enrolled ? 'border-primary-500/30' : 'border-surface-border'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded">
                    {c.course_code}
                  </span>
                  {c.is_enrolled && (
                    <span className="text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-800 px-2 py-0.5 rounded-full">
                      Enrolled
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-200">{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1">👤 {c.lecturer?.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{c._count?.enrollments ?? 0} students enrolled</p>
              </div>

              {c.is_enrolled ? (
                <button
                  onClick={() => {
                    if (confirm(`Unenroll from ${c.course_code}?`)) {
                      unenrollMutation.mutate(c.course_id);
                    }
                  }}
                  disabled={unenrollMutation.isPending}
                  className="btn-danger text-sm py-1.5 w-full">
                  Unenroll
                </button>
              ) : (
                <button
                  onClick={() => enrollMutation.mutate(c.course_id)}
                  disabled={enrollMutation.isPending}
                  className="btn-primary text-sm py-1.5 w-full">
                  Enroll
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
