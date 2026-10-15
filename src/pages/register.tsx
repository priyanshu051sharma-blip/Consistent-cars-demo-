import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { isCustomerLoggedIn, setCustomerSession } from '../utils/customer-auth';

export async function getServerSideProps() {
  return { redirect: { destination: '/', permanent: false } };
}

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

      const rawText = await response.text();
      let result: any = {};

      if (rawText) {
        try {
          result = JSON.parse(rawText);
        } catch {
          throw new Error(rawText.replace(/\s+/g, ' ').trim().slice(0, 180) || 'Unable to create your account.');
        }
      }

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
    <div className="min-h-screen bg-[#071827] text-white flex items-center justify-center px-4 py-14 md:py-20">
      <div className="w-full max-w-[1200px]">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">New customer</p>
          <h1 className="mt-4 text-[clamp(3rem,6vw,7rem)] font-black leading-[0.92] tracking-[-0.06em] text-white">
            Create an account
          </h1>
        </div>

        {error && (
          <div
            aria-live="polite"
            className="mb-8 w-full rounded-[1.25rem] border border-red-300/60 bg-[#43202d]/80 px-6 py-5 text-[clamp(1.5rem,2vw,2.4rem)] leading-[1.3] tracking-[-0.02em] text-red-100 shadow-[0_0_0_1px_rgba(248,113,113,0.25)]"
          >
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
