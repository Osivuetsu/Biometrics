import { useState } from 'react';
import { useMyAttendance } from '@/hooks';
import { PageHeader, StatusBadge, LoadingPage } from '@/components/ui';
import { format } from 'date-fns';
import type { Attendance } from '@/types';

export default function AttendanceHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyAttendance({ page });

  if (isLoading) return <LoadingPage />;

  const records = data?.data ?? [];
  const meta = data?.meta;

  // Compute simple stats
  const verified = records.filter((a: Attendance) => a.verification_status === 'VERIFIED').length;
  const total = records.length;

  return (
    <div>
      <PageHeader title="Attendance History" subtitle={`${meta?.total ?? 0} total records`} />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-100">{meta?.total ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">Total Records</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-400">{verified}</p>
          <p className="text-xs text-slate-400 mt-1">Verified (this page)</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-400">
            {total > 0 ? ((verified / total) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Rate (this page)</p>
        </div>
      </div>

      {/* Records */}
      <div className="space-y-2">
        {records.length === 0 ? (
          <div className="card text-center py-12 text-slate-500">No attendance records found.</div>
        ) : (
          records.map((a: Attendance) => (
            <div key={a.attendance_id}
              className="card flex items-center justify-between py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded">
                    {a.course?.course_code}
                  </span>
                  <span className="text-sm text-slate-200">{a.course?.title}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {format(new Date(a.timestamp), 'EEEE, dd MMM yyyy — HH:mm')}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {a.distance_score != null && (
                  <span className="text-xs font-mono text-slate-500">{a.distance_score.toFixed(4)}</span>
                )}
                <StatusBadge status={a.verification_status} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button className="btn-secondary px-3 py-1 text-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span className="text-sm text-slate-400 self-center">{page} / {meta.totalPages}</span>
          <button className="btn-secondary px-3 py-1 text-sm" disabled={page === meta.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
