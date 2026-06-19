// pages/admin-dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isAdminLoggedIn, logoutAdmin } from "../utils/auth";
import { motion } from "framer-motion";
import { Car, DollarSign, Users, Calendar, LogOut, RefreshCw, Search, Filter, Hotel, Loader2 } from "lucide-react";
import Link from "next/link"; // If needed for links
import CarManager from "../components/CarManager/CarManager";
import HotelManager from "../components/HotelManager/HotelManager";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Download } from "lucide-react";

interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  type: string;
  details: string; // JSON string
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<any[]>([]); // Use any for DB car shape
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, carsRes, hotelsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/cars'),
        fetch('/api/hotels')
      ]);

      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (carsRes.ok) setCars(await carsRes.json());
      if (hotelsRes.ok) setHotels(await hotelsRes.json());
    } catch (e) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch('/api/bookings/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
      }
    } catch (e) {
      alert("Failed to update status");
    }
  }

  useEffect(() => {
    // Auth Check
    const checkAuth = () => {
      if (!isAdminLoggedIn()) {
        router.replace("/admin-login");
      } else {
        setAuthChecking(false);
        fetchData();
      }
    }
    // Small delay to prevent flash if checking localStorage is instant but hydration is slow
    // Actually, isAdminLoggedIn is synchronous localStorage check. 
    // We just need to wait for client-side mount.
    checkAuth();
  }, [router]);

  // Derived State
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const totalBookings = bookings.length;

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin-login');
  }

  const generateInvoice = (booking: Booking) => {
    const doc = new jsPDF();
    let details: any = {};
    try { details = JSON.parse(booking.details); } catch (e) { }

    // Colors
    const primaryColor = [8, 145, 178]; // Cyan-600
    const secondaryColor = [64, 64, 64];

    // Header
    doc.setFillColor(8, 145, 178); // Cyan-600
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 180, 25, { align: "right" });
    doc.setFontSize(16);
    doc.text("Consistent Cars", 14, 25);

    // Info
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const invoiceDate = new Date(booking.createdAt).toLocaleDateString();
    doc.text(`Date: ${invoiceDate}`, 14, 50);
    doc.text(`Booking ID: ${booking.id.slice(0, 8).toUpperCase()}`, 14, 55);

    // Customer
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 14, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(booking.customerName, 14, 76);
    doc.text(booking.email, 14, 81);
    doc.text(booking.phone, 14, 86);

    // Details logic
    const isHotel = booking.type === 'Hotel';
    const rate = isHotel ? details.basePrice || booking.amount : (booking.amount / (details.duration || 1));
    const desc = isHotel ? `Hotel Stay: ${details.route}` : `Vehicle Rental: ${details.vehicle}`;
    const subDesc = isHotel ? `1 Night @ ${rate}` : `${details.duration || 1} Days @ ${rate}/day`;

    // Table
    doc.autoTable({
      startY: 105,
      head: [["Description", "Details", "Amount"]],
      body: [
        [desc, subDesc, `Rs. ${(isHotel ? (details.basePrice || booking.amount) : booking.amount).toLocaleString()}`],
        isHotel ? ["GST (12%)", "Tax", `Rs. ${(details.gstAmount || 0).toLocaleString()}`] : ["Taxes", "Included", "Rs. 0"],
      ],
      foot: [["", "Total", `Rs. ${booking.amount.toLocaleString()}`]],
      headStyles: { fillColor: [8, 145, 178], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
      theme: 'grid',
      columnStyles: { 2: { halign: 'right' } }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text("Thank you for choosing Consistent Cars!", 105, finalY, { align: "center" });

    doc.save(`Invoice_${booking.id.slice(0, 6)}.pdf`);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-cyan-400" size={48} />
          <p className="text-slate-400 font-medium">Verifying Credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500/30">

      {/* Sidebar / Navigation (Simplified as top bar for now) */}
      <main className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Admin Dashboard</h2>
            <p className="text-slate-400 mt-1">Manage bookings, fleet, and hotels.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-white/10 transition">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-slate-400 mb-1 text-sm font-medium">Total Revenue</p>
              <h2 className="text-3xl font-bold text-white flex items-center gap-1">₹{totalRevenue.toLocaleString()}</h2>
            </div>
            <div className="absolute bottom-4 right-4 p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
              <DollarSign size={24} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-slate-400 mb-1 text-sm font-medium">Total Bookings</p>
              <h2 className="text-3xl font-bold text-white">{totalBookings}</h2>
            </div>
            <div className="absolute bottom-4 right-4 p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Calendar size={24} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-slate-400 mb-1 text-sm font-medium">Active Fleet</p>
              <h2 className="text-3xl font-bold text-white">{cars.length}</h2>
            </div>
            <div className="absolute bottom-4 right-4 p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <Car size={24} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-slate-400 mb-1 text-sm font-medium">Partner Hotels</p>
              <h2 className="text-3xl font-bold text-white">{hotels.length}</h2>
            </div>
            <div className="absolute bottom-4 right-4 p-3 bg-pink-500/20 rounded-xl text-pink-400">
              <Hotel size={24} />
            </div>
          </motion.div>
        </div>

        {/* Finance Hub */}
        <div className="bg-slate-800/30 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="text-emerald-400" /> Financial Hub
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-slate-400 text-sm mb-1">Gross Revenue</p>
                <h2 className="text-3xl font-bold text-white">₹{totalRevenue.toLocaleString()}</h2>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                  </div>
                  100%
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 text-emerald-500/10">
                <DollarSign size={100} />
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5 relative overflow-hidden">
              {/* Logic: Assume Hotel types have 12% GST included. GST = Total * (12/112) */}
              {(() => {
                const hotelRevenue = bookings.filter(b => {
                  let d: any = {};
                  try { d = JSON.parse(b.details); } catch (e) { }
                  return d.vehicle === 'Hotel Stay'; // As set in hotels/[id].tsx
                }).reduce((sum, b) => sum + b.amount, 0);

                // Approx GST collected (12% inclusive)
                const gstCollected = Math.round(hotelRevenue * (12 / 112));

                return (
                  <>
                    <div className="relative z-10">
                      <p className="text-slate-400 text-sm mb-1">Estimated GST (12%)</p>
                      <h2 className="text-3xl font-bold text-white">₹{gstCollected.toLocaleString()}</h2>
                      <p className="text-xs text-slate-500 mt-4">From Hotel Bookings</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 text-purple-500/10">
                      <DollarSign size={100} />
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5 relative overflow-hidden">
              {(() => {
                const hotelRevenue = bookings.filter(b => {
                  let d: any = {};
                  try { d = JSON.parse(b.details); } catch (e) { }
                  return d.vehicle === 'Hotel Stay';
                }).reduce((sum, b) => sum + b.amount, 0);
                const gstCollected = Math.round(hotelRevenue * (12 / 112));
                const netRevenue = totalRevenue - gstCollected;

                return (
                  <>
                    <div className="relative z-10">
                      <p className="text-slate-400 text-sm mb-1">Net Revenue</p>
                      <h2 className="text-3xl font-bold text-white">₹{netRevenue.toLocaleString()}</h2>
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${(netRevenue / totalRevenue) * 100}%` }}></div>
                        </div>
                        {Math.round((netRevenue / totalRevenue) * 100)}%
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 text-blue-500/10">
                      <DollarSign size={100} />
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Managers */}
        <div className="space-y-8">
          <CarManager cars={cars} refreshCars={fetchData} />
          <HotelManager hotels={hotels} refreshHotels={fetchData} />
        </div>

        {/* Bookings Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h3 className="text-lg font-bold text-white">All Bookings</h3>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500 outline-none w-full md:w-64"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg pl-10 pr-8 py-2 text-sm text-white focus:border-cyan-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Details</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading bookings...</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No bookings found.</td></tr>
                ) : (
                  filteredBookings.map((booking) => {
                    let details: any = {};
                    try { details = JSON.parse(booking.details); } catch (e) { }

                    return (
                      <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{booking.customerName}</div>
                          <div className="text-xs text-slate-500">{booking.email}</div>
                          <div className="text-xs text-slate-600">{booking.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-300">{details.vehicle || details.route}</div>
                          <div className="text-xs text-slate-500">{details.date}</div>
                        </td>
                        <td className="p-4 font-medium text-white">₹{booking.amount.toLocaleString()}</td>
                        <td className="p-4 text-sm text-slate-400">{new Date(booking.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <select
                            value={booking.status}
                            onChange={(e) => updateStatus(booking.id, e.target.value)}
                            className={`px-2 py-1 rounded-md text-xs font-semibold border-none outline-none cursor-pointer
                                                ${booking.status === 'Paid' ? 'bg-green-500/20 text-green-400' :
                                booking.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                                  booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-white'}
                                            `}
                          >
                            <option value="Paid">Paid</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <button onClick={() => generateInvoice(booking)} className="p-2 bg-slate-700 hover:bg-cyan-600 rounded-lg text-white transition" title="Download Invoice">
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </main>
    </div>
  );
}

