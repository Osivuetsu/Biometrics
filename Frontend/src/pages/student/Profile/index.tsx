import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useUiStore } from '@/store/uiStore';
import { PageHeader } from '@/components/ui';
import { useForm } from 'react-hook-form';

export default function Profile() {
  const { user } = useAuthStore();
  const addToast = useUiStore((s) => s.addToast);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const student = user?.student;

  const onChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      addToast('Password changed successfully', 'success');
      reset();
      setIsChangingPassword(false);
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile info */}
        <div className="card space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-600/30 flex items-center justify-center text-primary-400 text-2xl font-bold">
              {student?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{student?.name}</h2>
              <p className="text-sm text-slate-400">{user?.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { label: 'Matric No.', value: student?.matric_no },
              { label: 'Department', value: student?.department },
              { label: 'Level', value: student?.level ? `${student.level}L` : '—' },
              { label: 'Role', value: user?.role },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-lg p-3 border border-surface-border">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-200 mt-0.5">{value ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-200">Security</h2>
            <button onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="btn-secondary text-sm px-3 py-1.5">
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input className="input" type="password"
                  {...register('currentPassword', { required: 'Required' })} />
                {errors.currentPassword && <p className="text-xs text-red-400 mt-1">{errors.currentPassword.message}</p>}
              </div>
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password"
                  {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                {errors.newPassword && <p className="text-xs text-red-400 mt-1">{errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input className="input" type="password"
                  {...register('confirmPassword', { required: 'Required' })} />
              </div>
              <button type="submit" className="btn-primary w-full">Update Password</button>
            </form>
          ) : (
            <p className="text-sm text-slate-500">Keep your account secure by using a strong, unique password.</p>
          )}
        </div>
      </div>
    </div>
  );
}
