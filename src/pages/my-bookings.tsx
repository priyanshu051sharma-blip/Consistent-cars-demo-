import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Download, MapPin, Calendar, Car, CircleDollarSign } from 'lucide-react';
import { isCustomerLoggedIn, clearCustomerSession } from '../utils/customer-auth';

interface BookingRecord {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  type: string;
  details: string | Record<string, any>;
  amount: number;
  status: string;
  paymentStatus: string;
  bookingReference: string;
  invoiceNumber?: string | null;
  createdAt: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings?customer=true');
      if (response.status === 401) {
        clearCustomerSession();
        router.replace('/login');
        return;
      }

      const result = await response.json();
      setBookings(result.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      router.replace('/login');
      return;
    }

    fetchBookings();
  }, [router]);

  const handleDownload = async (bookingId: string) => {
    const response = await fetch(`/api/bookings/${bookingId}/invoice`);
    if (!response.ok) {
      alert('Invoice is not available yet.');
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${bookingId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const parseDetails = (details: string | Record<string, any>) => {
    if (!details) return {};
    if (typeof details === 'string') {
      try {
        return JSON.parse(details);
      } catch {
        return {};
      }
    }
    return details;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">My account</p>
            <h1 className="mt-2 text-3xl font-bold">My Bookings</h1>
          </div>
          <Link href="/my-account" className="rounded-full border border-cyan-500/30 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/10">
            View Account
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center text-slate-300">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-10 text-center text-slate-300">
            No bookings found yet. <Link href="/booking" className="font-semibold text-cyan-400">Book a car</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const details = parseDetails(booking.details);
              const route = details.route || details.pickupLocation && details.dropLocation ? `${details.pickupLocation} → ${details.dropLocation}` : 'Trip details unavailable';
              return (
                <div key={booking.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-2 inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                        {booking.status}
                      </div>
                      <h2 className="text-xl font-bold text-white">{booking.bookingReference || booking.id}</h2>
                      <p className="mt-1 text-sm text-slate-400">{route}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDownload(booking.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/15"
                      >
                        <Download size={16} /> Download Invoice
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"><Car size={14} /> Vehicle</div>
                      <p className="text-base font-semibold text-white">{details.vehicle || booking.type}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"><MapPin size={14} /> Route</div>
                      <p className="text-sm text-white">{route}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"><Calendar size={14} /> Date</div>
                      <p className="text-sm text-white">{details.date || new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"><CircleDollarSign size={14} /> Fare</div>
                      <p className="text-lg font-bold text-white">₹{Number(booking.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Payment: {booking.paymentStatus}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Booking: {booking.status}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Invoice: {booking.invoiceNumber || 'Pending'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
