// components/CarManager.tsx
import React, { useState } from "react";
import { RefreshCw, Trash2, Plus, Car as CarIcon } from "lucide-react";

export default function CarManager({
  cars,
  refreshCars,
}: {
  cars: any[];
  refreshCars: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    type: "Sedan",
    seats: 4,
    baseDayPrice: 3000,
    image: "/image/cars/dzire.jpg"
  });
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setForm({
        name: "",
        type: "Sedan",
        seats: 4,
        baseDayPrice: 3000,
        image: "/image/cars/dzire.jpg"
      });
      refreshCars();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this car?")) return;
    try {
      await fetch(`/api/cars?id=${id}`, { method: 'DELETE' });
      refreshCars();
    } catch (e) { console.error(e); }
  }

  return (
    <div className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CarIcon className="text-cyan-400" /> Fleet Management
        </h2>
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 bg-slate-900/50 p-4 rounded-xl border border-white/5">
        <input
          className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:border-cyan-500 outline-none"
          placeholder="Car Name (e.g. Toyota Innova)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <select
          className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white outline-none"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Luxury">Luxury</option>
          <option value="Bus">Bus</option>
        </select>

        <input
          type="number"
          className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:border-cyan-500 outline-none"
          placeholder="Seats"
          value={form.seats}
          onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value) })}
        />

        <input
          type="number"
          className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:border-cyan-500 outline-none"
          placeholder="Price/Day (₹)"
          value={form.baseDayPrice}
          onChange={(e) => setForm({ ...form, baseDayPrice: parseInt(e.target.value) })}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:scale-105 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Plus size={18} />} Add Car
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div
            key={car.id}
            className="group relative bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors"
          >
            <div className="aspect-video relative bg-slate-800">
              <img src={car.image} alt={car.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={() => handleDelete(car.id)}
                className="absolute top-2 right-2 p-2 bg-red-600/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4">
              <div className="font-bold text-white text-lg">{car.name}</div>
              <div className="text-slate-400 text-sm flex justify-between items-center mt-1">
                <span>{car.type} • {car.seats} Seats</span>
                <span className="text-cyan-400 font-bold">₹{car.baseDayPrice}/day</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
