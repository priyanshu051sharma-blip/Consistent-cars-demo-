import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isCustomerLoggedIn, getCustomerSession, clearCustomerSession } from '../utils/customer-auth';

export default function MyAccountPage() {
  const router = useRouter();
  const [session, setSession] = useState(getCustomerSession());

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      router.replace('/login');
      return;
    }
    setSession(getCustomerSession());
  }, [router]);

  const handleLogout = () => {
    clearCustomerSession();
    router.push('/');
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/10">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">My account</p>
        <h1 className="mt-3 text-3xl font-bold">Welcome, {session.name}</h1>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-sm text-slate-400">Name</p>
            <p className="mt-2 text-lg font-semibold text-white">{session.name}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-sm text-slate-400">Email</p>
            <p className="mt-2 text-lg font-semibold text-white">{session.email}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-sm text-slate-400">Mobile Number</p>
            <p className="mt-2 text-lg font-semibold text-white">{session.phone || 'Not added'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-sm text-slate-400">Bookings</p>
            <p className="mt-2 text-lg font-semibold text-white">Track and manage your trip requests</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/my-bookings" className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:opacity-95">
            View My Bookings
          </Link>
          <button onClick={handleLogout} className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-white hover:bg-white/5">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
