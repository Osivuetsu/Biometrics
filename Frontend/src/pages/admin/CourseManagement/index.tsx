import { useState } from 'react';
import { useCourses, useDeleteCourse, useCreateCourse, useLecturers } from '@/hooks';
import { PageHeader } from '@/components/ui';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/modals/Modal';
import { useForm } from 'react-hook-form';
import type { Course } from '@/types';

function AddCourseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { register, handleSubmit, reset } = useForm();
  const createCourse = useCreateCourse();
  const { data: lecturers } = useLecturers();

  const onSubmit = async (data: any) => {
    await createCourse.mutateAsync({ ...data, lecturer_id: parseInt(data.lecturer_id) });
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Course">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Course Code</label>
            <input className="input" {...register('course_code', { required: true })} placeholder="CSC 301" />
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" {...register('title', { required: true })} placeholder="Data Structures" />
          </div>
        </div>
        <div>
          <label className="label">Lecturer</label>
          <select className="input" {...register('lecturer_id', { required: true })}>
            <option value="">Select lecturer…</option>
            {lecturers?.data?.map((l) => (
              <option key={l.lecturer_id} value={l.lecturer_id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={createCourse.isPending} className="btn-primary flex-1">
            {createCourse.isPending ? 'Creating…' : 'Create Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CourseManagement() {
  const [showAdd, setShowAdd] = useState(false);
  const { data, isLoading } = useCourses();
  const deleteCourse = useDeleteCourse();

  const columns = [
    { key: 'code', header: 'Code', render: (c: Course) => (
      <span className="font-mono text-xs text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded">{c.course_code}</span>
    )},
    { key: 'title', header: 'Title', render: (c: Course) => <span className="font-medium text-slate-200">{c.title}</span> },
    { key: 'lecturer', header: 'Lecturer', render: (c: Course) => c.lecturer?.name ?? '—' },
    { key: 'enrolled', header: 'Enrolled', render: (c: Course) => c._count?.enrollments ?? 0 },
    { key: 'actions', header: '', render: (c: Course) => (
      <button onClick={() => { if (confirm(`Delete ${c.course_code}?`)) deleteCourse.mutate(c.course_id); }}
        className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-900/20 transition-colors">
        Delete
      </button>
    )},
  ];

  return (
    <div>
      <PageHeader title="Courses" subtitle={`${data?.meta?.total ?? 0} courses`}
        action={<button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Course</button>} />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} keyField="course_id" />
      <AddCourseModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
