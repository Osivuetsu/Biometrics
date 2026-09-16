import { useState } from 'react';
import { useCourses, useAttendanceReport } from '@/hooks';
import { PageHeader, LoadingPage } from '@/components/ui';

export default function LecturerReports() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [threshold, setThreshold] = useState(75);
  const { data: courses } = useCourses({ limit: 100 });
  const { data: report, isLoading } = useAttendanceReport(selectedCourseId!);

  const filtered = selectedCourseId && report?.report
    ? report.report.filter((r: any) => parseFloat(r.attendance_percentage) < threshold)
    : [];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Course attendance analytics" />

      <div className="card mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="label">Course</label>
          <select className="input" value={selectedCourseId ?? ''}
            onChange={(e) => setSelectedCourseId(parseInt(e.target.value))}>
            <option value="">Select a course…</option>
            {courses?.data?.map((c) => (
              <option key={c.course_id} value={c.course_id}>{c.course_code} — {c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Low Attendance Threshold (%)</label>
          <input className="input w-32" type="number" min={0} max={100} value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))} />
        </div>
      </div>

      {selectedCourseId && (
        isLoading ? <LoadingPage /> : (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center">
                <p className="text-2xl font-bold text-slate-100">{report?.total_enrolled ?? 0}</p>
                <p className="text-xs text-slate-400 mt-1">Enrolled</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {report?.report?.filter((r: any) => parseFloat(r.attendance_percentage) >= threshold).length ?? 0}
                </p>
                <p className="text-xs text-slate-400 mt-1">Above threshold</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-red-400">{filtered.length}</p>
                <p className="text-xs text-slate-400 mt-1">Below {threshold}%</p>
              </div>
            </div>

            {/* Low attendance table */}
            {filtered.length > 0 && (
              <div className="card">
                <h2 className="text-sm font-semibold text-red-400 mb-3">⚠ Students Below {threshold}% Attendance</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border">
                      {['Matric No.', 'Name', 'Verified', 'Attendance %'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs text-slate-400 font-semibold uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row: any) => (
                      <tr key={row.student_id} className="border-b border-surface-border last:border-0">
                        <td className="px-3 py-2 font-mono text-xs text-primary-400">{row.matric_no}</td>
                        <td className="px-3 py-2 text-slate-200">{row.name}</td>
                        <td className="px-3 py-2">{row.verified_attendance}</td>
                        <td className="px-3 py-2 font-medium text-red-400">{row.attendance_percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
