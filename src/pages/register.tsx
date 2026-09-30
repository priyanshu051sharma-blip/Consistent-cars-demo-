import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { isCustomerLoggedIn, setCustomerSession } from '../utils/customer-auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      router.replace('/my-bookings');
    }
  }, [router]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to create your account.');
      }

      setCustomerSession({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
      });
      router.push('/my-bookings');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-8 shadow-2xl shadow-cyan-900/10 backdrop-blur-md">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">New customer</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Create an account</h1>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Name</label>
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Mobile Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="9876543210"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
