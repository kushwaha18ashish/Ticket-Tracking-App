import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('qa@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name);
        toast.success('Account created');
      } else {
        await login(email, password);
        toast.success('Welcome back');
      }
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          QA Ticket Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isRegister ? 'Create an account' : 'Sign in to manage validation tickets'}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-medium text-slate-500">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-slate-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            {isRegister ? 'Register' : 'Sign In'}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="mt-4 w-full text-center text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {isRegister
            ? 'Already have an account? Sign in'
            : 'Need an account? Register'}
        </button>
        {!isRegister && (
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900">
            Demo: qa@example.com / password123
          </p>
        )}
      </div>
    </div>
  );
}
