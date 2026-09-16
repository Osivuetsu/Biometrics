import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import LoginForm from './LoginForm';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth, getDashboardPath } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (data: { username: string; password: string }) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await authService.login(data.username, data.password);
      setAuth(result.user, result.token);
      navigate(getDashboardPath(), { replace: true });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold text-slate-100 mb-5">Sign in to your account</h2>
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
    </>
  );
}
