import { useState } from 'react';
import { useLecturers, useDeleteLecturer, useCreateLecturer } from '@/hooks';
import { PageHeader } from '@/components/ui';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/modals/Modal';
import { useForm } from 'react-hook-form';
import type { Lecturer } from '@/types';

function AddLecturerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { register, handleSubmit, reset } = useForm();
  const createLecturer = useCreateLecturer();

  const onSubmit = async (data: any) => {
    await createLecturer.mutateAsync(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Lecturer">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Username</label>
            <input className="input" {...register('username', { required: true })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" {...register('password', { required: true })} />
          </div>
        </div>
        <div>
          <label className="label">Full Name</label>
          <input className="input" {...register('name', { required: true })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...register('email', { required: true })} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={createLecturer.isPending} className="btn-primary flex-1">
            {createLecturer.isPending ? 'Creating…' : 'Create Lecturer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function LecturerManagement() {
  const [showAdd, setShowAdd] = useState(false);
  const { data, isLoading } = useLecturers();
  const deleteLecturer = useDeleteLecturer();

  const columns = [
    { key: 'name', header: 'Name', render: (l: Lecturer) => <span className="font-medium text-slate-200">{l.name}</span> },
    { key: 'email', header: 'Email', render: (l: Lecturer) => <span className="text-slate-400">{l.email}</span> },
    { key: 'courses', header: 'Courses', render: (l: Lecturer) => (
      <span className="text-sm">{(l.courses?.length ?? 0)} assigned</span>
    )},
    { key: 'actions', header: '', render: (l: Lecturer) => (
      <button onClick={() => { if (confirm(`Delete ${l.name}?`)) deleteLecturer.mutate(l.lecturer_id); }}
        className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-900/20 transition-colors">
        Delete
      </button>
    )},
  ];

  return (
    <div>
      <PageHeader title="Lecturers" subtitle={`${data?.meta?.total ?? 0} lecturers`}
        action={<button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Lecturer</button>} />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} keyField="lecturer_id" />
      <AddLecturerModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
