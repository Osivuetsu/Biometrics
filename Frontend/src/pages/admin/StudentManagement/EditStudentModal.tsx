import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/modals/Modal';
import { useUpdateStudent } from '@/hooks';
import type { Student } from '@/types';

interface Props { isOpen: boolean; onClose: () => void; student: Student | null; }

export default function EditStudentModal({ isOpen, onClose, student }: Props) {
  const { register, handleSubmit, reset } = useForm();
  const updateStudent = useUpdateStudent();

  useEffect(() => { if (student) reset(student); }, [student, reset]);

  const onSubmit = async (data: any) => {
    if (!student) return;
    await updateStudent.mutateAsync({ id: student.student_id, data: { ...data, level: parseInt(data.level) } });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" {...register('name', { required: true })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Department</label>
            <input className="input" {...register('department', { required: true })} />
          </div>
          <div>
            <label className="label">Level</label>
            <select className="input" {...register('level')}>
              {[100, 200, 300, 400, 500].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={updateStudent.isPending} className="btn-primary flex-1">
            {updateStudent.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
