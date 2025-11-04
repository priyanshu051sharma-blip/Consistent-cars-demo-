// components/CarManager.tsx
import React, { useState } from "react";
import { Car } from "@/pages/admin-dashboard";
import { v4 as uuidv4 } from "uuid";

export default function CarManager({
  cars,
  setCars,
}: {
  cars: Car[];
  setCars: (c: Car[]) => void;
}) {
  const [form, setForm] = useState<Partial<Car>>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license: "",
    mileage: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetForm() {
    setForm({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      license: "",
      mileage: 0,
    });
    setEditingId(null);
  }

  function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.make || !form.model || !form.license)
      return alert("Fill make, model and license.");
    if (editingId) {
      setCars(
        cars.map((c) =>
          c.id === editingId ? ({ ...(c as any), ...(form as any) } as Car) : c
        )
      );
    } else {
      const newCar: Car = {
        id: uuidv4(),
        make: form.make as string,
        model: form.model as string,
        year: form.year as number,
        license: form.license as string,
        mileage: (form.mileage as number) || 0,
        status: "Available",
      };
      setCars([newCar, ...cars]);
    }
    resetForm();
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-[#00ffff]">
      <h2 className="text-2xl font-bold text-[#00ffff] mb-4">Car Management</h2>

      <form
        onSubmit={(e) => handleSave(e)}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <input
          className="p-2 bg-gray-800 rounded"
          placeholder="Make"
          value={form.make}
          onChange={(e) => setForm({ ...form, make: e.target.value })}
        />
        <input
          className="p-2 bg-gray-800 rounded"
          placeholder="Model"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
        />
        <input
          className="p-2 bg-gray-800 rounded"
          placeholder="License"
          value={form.license}
          onChange={(e) => setForm({ ...form, license: e.target.value })}
        />
        <input
          type="number"
          className="p-2 bg-gray-800 rounded"
          placeholder="Year"
          value={form.year}
          onChange={(e) =>
            setForm({ ...form, year: parseInt(e.target.value || "0") })
          }
        />
        <input
          type="number"
          className="p-2 bg-gray-800 rounded"
          placeholder="Mileage"
          value={form.mileage}
          onChange={(e) =>
            setForm({ ...form, mileage: parseInt(e.target.value || "0") })
          }
        />
        <div className="flex gap-3 items-center">
          <button
            type="submit"
            className="px-4 py-2 bg-[#00ffff] rounded font-bold text-gray-900"
          >
            {editingId ? "Update" : "Add Car"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-2 border rounded"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Fleet ({cars.length})</h3>
        <div className="space-y-3">
          {cars.map((car) => (
            <div
              key={car.id}
              className="flex items-center justify-between p-3 bg-gray-800 rounded"
            >
              <div>
                <div className="font-semibold">
                  {car.make} {car.model} • {car.year}
                </div>
                <div className="text-sm text-gray-400">
                  {car.license} • {car.mileage} km
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={car.status}
                  onChange={(e) =>
                    setCars(
                      cars.map((c) =>
                        c.id === car.id
                          ? { ...c, status: e.target.value as any }
                          : c
                      )
                    )
                  }
                  className="bg-gray-700 p-2 rounded"
                >
                  <option>Available</option>
                  <option>Rented</option>
                  <option>Reserved</option>
                  <option>Maintenance</option>
                </select>
                <button
                  onClick={() => {
                    setForm({
                      make: car.make,
                      model: car.model,
                      year: car.year,
                      license: car.license,
                      mileage: car.mileage,
                    });
                    setEditingId(car.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3 py-2 rounded bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (!confirm("Delete car?")) return;
                    setCars(cars.filter((c) => c.id !== car.id));
                  }}
                  className="px-3 py-2 rounded bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
