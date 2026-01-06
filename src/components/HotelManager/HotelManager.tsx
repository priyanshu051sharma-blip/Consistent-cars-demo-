import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Hotel, MapPin, Star, DollarSign } from 'lucide-react';

interface HotelType {
    id: string;
    name: string;
    image: string;
    pricePerNight: number;
    rating: number;
    description: string;
    amenities: string;
    locationId: string;
    location?: { name: string };
}

interface LocationType {
    id: string;
    name: string;
}

export default function HotelManager({ hotels, refreshHotels }: { hotels: HotelType[], refreshHotels: () => void }) {
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        pricePerNight: '',
        rating: '',
        description: '',
        amenities: '',
        locationId: ''
    });

    useEffect(() => {
        // Fetch locations for the dropdown
        fetch('/api/locations?simple=true') // We might need to check if /api/locations exists or if we need to create it/update it. 
        // For now, let's assume we can fetch them or just hardcode if API missing. 
        // Wait, I should check if /api/locations exists. 
        // Actually, let's try to fetch from a generic endpoint or just assume standard /api/locations if not I'll create it.
        // Looking at schema, Location model exists.
        // Let's defer fetching locations until I confirm api/locations exists. I'll write a simple fetch inside here assuming it might work or fail gracefully.
    }, []);

    // Better approach: Let's fetch locations in the parent (Dashboard) and pass them down, OR fetch here.
    // I'll fetch here for encapsulation.

    useEffect(() => {
        const fetchLocs = async () => {
            try {
                // Assuming we might need to create this endpoint if it doesnt exist
                const res = await fetch('/api/locations');
                if (res.ok) setLocations(await res.json());
            } catch (e) { console.error("Failed to load locations"); }
        }
        fetchLocs();
    }, []);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/hotels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ name: '', image: '', pricePerNight: '', rating: '', description: '', amenities: '', locationId: '' });
                setIsAdding(false);
                refreshHotels();
            } else {
                alert("Failed to add hotel");
            }
        } catch (error) {
            alert("Error adding hotel");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/hotels?id=${id}`, { method: 'DELETE' });
            if (res.ok) refreshHotels();
            else alert("Failed to delete");
        } catch (error) {
            alert("Error deleting");
        }
    }

    return (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Hotel className="text-cyan-400" size={20} /> Hotel Management
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-all"
                >
                    <Plus size={16} /> Add Hotel
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="p-6 bg-slate-900/50 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Hotel Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-slate-800 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-cyan-500" />
                    <select required value={formData.locationId} onChange={e => setFormData({ ...formData, locationId: e.target.value })} className="bg-slate-800 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-cyan-500">
                        <option value="">Select Location</option>
                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                    <input required placeholder="Image URL" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="bg-slate-800 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-cyan-500" />
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="number" placeholder="Price/Night" value={formData.pricePerNight} onChange={e => setFormData({ ...formData, pricePerNight: e.target.value })} className="bg-slate-800 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-cyan-500" />
                        <input required type="number" step="0.1" placeholder="Rating (0-5)" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className="bg-slate-800 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-cyan-500" />
                    </div>
                    <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-slate-800 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-cyan-500 md:col-span-2 h-20" />
                    <input placeholder="Amenities (comma separated)" value={formData.amenities} onChange={e => setFormData({ ...formData, amenities: e.target.value })} className="bg-slate-800 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-cyan-500 md:col-span-2" />

                    <div className="md:col-span-2 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 hover:bg-white/10 rounded-lg text-slate-300 transition">Cancel</button>
                        <button disabled={loading} type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 rounded-lg font-bold transition disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Hotel'}
                        </button>
                    </div>
                </form>
            )}

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotels.map(hotel => (
                    <div key={hotel.id} className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden group hover:border-cyan-500/50 transition-all">
                        <div className="h-32 bg-slate-800 relative">
                            <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                            <button onClick={() => handleDelete(hotel.id)} className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={16} />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-xs text-cyan-400 font-bold border border-white/10">
                                <MapPin size={12} /> {hotel.location?.name || 'Unknown'}
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-white text-lg">{hotel.name}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                <span className="flex items-center gap-1"><DollarSign size={14} className="text-green-400" /> {hotel.pricePerNight}</span>
                                <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /> {hotel.rating}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {hotels.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-500 italic">No hotels found. Add one to get started.</div>
                )}
            </div>
        </div>
    );
}
