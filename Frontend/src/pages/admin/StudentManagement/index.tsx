import { useState } from 'react';
import { useStudents, useDeleteStudent } from '@/hooks';
import { PageHeader } from '@/components/ui';
import StudentTable from './StudentTable';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import type { Student } from '@/types';

export default function StudentManagement() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const { data, isLoading } = useStudents({ search: search || undefined, page });
  const deleteStudent = useDeleteStudent();

  const handleDelete = (s: Student) => {
    if (confirm(`Delete ${s.name}? This cannot be undone.`)) {
      deleteStudent.mutate(s.student_id);
    }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${data?.meta?.total ?? 0} registered students`}
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            + Add Student
          </button>
        }
      />

      <div className="card mb-4">
        <input
          className="input max-w-sm"
          placeholder="Search by name, matric no, or department…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <StudentTable
        data={data?.data ?? []}
        isLoading={isLoading}
        onEdit={setEditStudent}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button className="btn-secondary px-3 py-1 text-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span className="text-sm text-slate-400 self-center">{page} / {data.meta.totalPages}</span>
          <button className="btn-secondary px-3 py-1 text-sm" disabled={page === data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      <AddStudentModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      <EditStudentModal isOpen={!!editStudent} onClose={() => setEditStudent(null)} student={editStudent} />
    </div>
  );
}
