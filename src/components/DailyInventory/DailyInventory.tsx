// components/DailyInventory.tsx
import React, { useMemo } from "react";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  license: string;
  mileage: number;
  status: string;
}

export default function DailyInventory({ cars }: { cars: Car[] }) {
  const totals = useMemo(() => {
    const t = {
      total: cars.length,
      available: 0,
      rented: 0,
      reserved: 0,
      maintenance: 0,
    };
    cars.forEach((c) => {
      if (c.status === "Available") t.available++;
      if (c.status === "Rented") t.rented++;
      if (c.status === "Reserved") t.reserved++;
      if (c.status === "Maintenance") t.maintenance++;
    });
    return t;
  }, [cars]);

  function exportCSV() {
    const rows = [
      ["Make", "Model", "Year", "License", "Mileage", "Status"],
      ...cars.map((c) => [
        c.make,
        c.model,
        String(c.year),
        c.license,
        String(c.mileage),
        c.status,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-[#00ffff]">
      <h2 className="text-2xl font-bold text-[#00ffff] mb-4">
        Daily Inventory
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm text-gray-400">Total Fleet</div>
          <div className="text-2xl font-bold">{totals.total}</div>
        </div>
        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm text-gray-400">Available</div>
          <div className="text-2xl font-bold text-green-400">
            {totals.available}
          </div>
        </div>
        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm text-gray-400">Rented</div>
          <div className="text-2xl font-bold text-blue-400">
            {totals.rented}
          </div>
        </div>
        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm text-gray-400">Maintenance</div>
          <div className="text-2xl font-bold text-red-400">
            {totals.maintenance}
          </div>
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <button
          onClick={exportCSV}
          className="px-3 py-2 bg-[#00ffff] text-gray-900 rounded"
        >
          Export CSV
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(JSON.stringify(cars, null, 2));
            alert("Copied fleet JSON to clipboard");
          }}
          className="px-3 py-2 bg-gray-700 rounded border border-[#00ffff]"
        >
          Copy JSON
        </button>
      </div>

      <div className="space-y-2">
        {cars.map((c) => (
          <div
            key={c.id}
            className={`p-3 rounded flex justify-between items-center ${c.status === "Available"
                ? "bg-[#06281f]"
                : c.status === "Rented"
                  ? "bg-[#0b2236]"
                  : c.status === "Maintenance"
                    ? "bg-[#2b0b0b]"
                    : "bg-[#352a11]"
              }`}
          >
            <div>
              <div className="font-semibold">
                {c.make} {c.model} • {c.license}
              </div>
              <div className="text-sm text-gray-300">
                {c.year} • {c.mileage} km
              </div>
            </div>
            <div className="text-sm font-bold">
              <span className="px-3 py-1 rounded">{c.status}</span>
            </div>
          </div>
        ))}
        {cars.length === 0 && (
          <div className="text-gray-400">
            No cars in fleet. Add some in Car Management.
          </div>
        )}
      </div>
    </div>
  );
}
