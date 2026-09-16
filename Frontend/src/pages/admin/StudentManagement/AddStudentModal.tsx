import { useForm } from 'react-hook-form';
import Modal from '@/components/modals/Modal';
import { useCreateStudent } from '@/hooks';

interface Props { isOpen: boolean; onClose: () => void; }

export default function AddStudentModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const createStudent = useCreateStudent();

  const onSubmit = async (data: any) => {
    await createStudent.mutateAsync({ ...data, level: parseInt(data.level) });
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Student">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Username</label>
            <input className="input" {...register('username', { required: true })} placeholder="johndoe" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" {...register('password', { required: true, minLength: 6 })} placeholder="Min 6 chars" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" {...register('name', { required: true })} placeholder="John Doe" />
          </div>
          <div>
            <label className="label">Matric No.</label>
            <input className="input" {...register('matric_no', { required: true })} placeholder="CSC/2021/001" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Department</label>
            <input className="input" {...register('department', { required: true })} placeholder="Computer Science" />
          </div>
          <div>
            <label className="label">Level</label>
            <select className="input" {...register('level', { required: true })}>
              {[100, 200, 300, 400, 500].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={createStudent.isPending} className="btn-primary flex-1">
            {createStudent.isPending ? 'Creating…' : 'Create Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
