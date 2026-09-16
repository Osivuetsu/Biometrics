import DataTable from '@/components/tables/DataTable';
import type { Student } from '@/types';

interface Props {
  data: Student[];
  isLoading: boolean;
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
}

export default function StudentTable({ data, isLoading, onEdit, onDelete }: Props) {
  const columns = [
    { key: 'matric', header: 'Matric No.', render: (s: Student) => (
      <span className="font-mono text-xs text-primary-400">{s.matric_no}</span>
    )},
    { key: 'name', header: 'Name', render: (s: Student) => (
      <span className="font-medium text-slate-200">{s.name}</span>
    )},
    { key: 'dept', header: 'Department', render: (s: Student) => s.department },
    { key: 'level', header: 'Level', render: (s: Student) => (
      <span className="text-xs bg-primary-900/40 text-primary-300 px-2 py-0.5 rounded">{s.level}</span>
    )},
    { key: 'actions', header: '', render: (s: Student) => (
      <div className="flex gap-2 justify-end">
        <button onClick={() => onEdit(s)} className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-surface-border transition-colors">Edit</button>
        <button onClick={() => onDelete(s)} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-900/20 transition-colors">Delete</button>
      </div>
    ), width: '100px' },
  ];

  return <DataTable columns={columns} data={data} isLoading={isLoading} keyField="student_id" />;
}
