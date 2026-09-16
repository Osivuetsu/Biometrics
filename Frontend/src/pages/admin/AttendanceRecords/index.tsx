import { useState } from 'react';
import { useAttendance } from '@/hooks';
import { PageHeader, StatusBadge } from '@/components/ui';
import DataTable from '@/components/tables/DataTable';
import { format } from 'date-fns';
import type { Attendance } from '@/types';

export default function AdminAttendanceRecords() {
  const [courseId, setCourseId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAttendance({
    course_id: courseId || undefined,
    page,
  });

  const columns = [
    { key: 'student', header: 'Student', render: (a: Attendance) => (
      <div>
        <p className="font-medium text-slate-200">{a.student?.name}</p>
        <p className="text-xs text-slate-500 font-mono">{a.student?.matric_no}</p>
      </div>
    )},
    { key: 'course', header: 'Course', render: (a: Attendance) => (
      <span className="text-xs font-mono text-primary-400">{a.course?.course_code}</span>
    )},
    { key: 'time', header: 'Timestamp', render: (a: Attendance) => (
      <span className="text-sm text-slate-400">{format(new Date(a.timestamp), 'dd MMM yyyy, HH:mm')}</span>
    )},
    { key: 'score', header: 'Distance', render: (a: Attendance) => (
      <span className="font-mono text-xs">{a.distance_score?.toFixed(4) ?? '—'}</span>
    )},
    { key: 'status', header: 'Status', render: (a: Attendance) => <StatusBadge status={a.verification_status} /> },
  ];

  return (
    <div>
      <PageHeader title="Attendance Records" subtitle={`${data?.meta?.total ?? 0} total records`} />

      <div className="card mb-4 flex gap-4">
        <input
          className="input max-w-xs"
          placeholder="Filter by Course ID…"
          value={courseId}
          onChange={(e) => { setCourseId(e.target.value); setPage(1); }}
          type="number"
        />
      </div>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} keyField="attendance_id" />

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button className="btn-secondary px-3 py-1 text-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span className="text-sm text-slate-400 self-center">{page} / {data.meta.totalPages}</span>
          <button className="btn-secondary px-3 py-1 text-sm" disabled={page === data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
