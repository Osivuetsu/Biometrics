import { useState } from 'react';
import { useAttendanceReport, useCourses } from '@/hooks';
import { PageHeader, LoadingPage } from '@/components/ui';

export default function AdminReports() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const { data: courses } = useCourses({ limit: 100 });
  const { data: report, isLoading } = useAttendanceReport(selectedCourseId!);

  return (
    <div>
      <PageHeader title="Reports" subtitle="Attendance analytics by course" />

      <div className="card mb-6">
        <label className="label">Select Course</label>
        <select className="input max-w-sm"
          value={selectedCourseId ?? ''}
          onChange={(e) => setSelectedCourseId(parseInt(e.target.value))}>
          <option value="">Choose a course…</option>
          {courses?.data?.map((c) => (
            <option key={c.course_id} value={c.course_id}>{c.course_code} — {c.title}</option>
          ))}
        </select>
      </div>

      {selectedCourseId && (
        isLoading ? <LoadingPage /> : (
          <div className="space-y-4">
            {report?.course && (
              <div className="card">
                <h2 className="text-base font-semibold text-slate-200">{report.course.course_code} — {report.course.title}</h2>
                <p className="text-sm text-slate-400 mt-1">Lecturer: {report.course.lecturer} · {report.total_enrolled} enrolled</p>
              </div>
            )}

            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Matric No.', 'Name', 'Department', 'Total', 'Verified', 'Attendance %'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs text-slate-400 font-semibold uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report?.report?.map((row: any) => (
                    <tr key={row.student_id} className="border-b border-surface-border last:border-0 hover:bg-surface/50">
                      <td className="px-3 py-2 font-mono text-xs text-primary-400">{row.matric_no}</td>
                      <td className="px-3 py-2 text-slate-200">{row.name}</td>
                      <td className="px-3 py-2 text-slate-400">{row.department}</td>
                      <td className="px-3 py-2">{row.total_records}</td>
                      <td className="px-3 py-2">{row.verified_attendance}</td>
                      <td className="px-3 py-2">
                        <span className={`font-medium ${parseFloat(row.attendance_percentage) >= 75
                          ? 'text-emerald-400' : 'text-red-400'}`}>
                          {row.attendance_percentage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
