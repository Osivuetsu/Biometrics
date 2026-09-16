import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  isLoading: boolean;
  error?: string;
}

export default function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<{ username: string; password: string }>();
  const [showPass, setShowPass] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Username</label>
        <input className="input" placeholder="Enter your username"
          {...register('username', { required: 'Username is required' })} />
        {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>}
      </div>

      <div>
        <label className="label">Password</label>
        <div className="relative">
          <input className="input pr-10" type={showPass ? 'text' : 'password'}
            placeholder="Enter your password"
            {...register('password', { required: 'Password is required' })} />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 mt-2">
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
