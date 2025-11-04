// components/BillCreator.tsx
import React, { useState } from "react";
import { Car, Invoice } from "@/pages/admin-dashboard";
import { v4 as uuidv4 } from "uuid";

function money(n: number) {
  return Math.round(n * 100) / 100;
}

export default function BillCreator({
  cars,
  invoices,
  setInvoices,
}: {
  cars: Car[];
  invoices: Invoice[];
  setInvoices: (i: Invoice[]) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [selectedCar, setSelectedCar] = useState<string | "">("");
  const [items, setItems] = useState<
    { desc: string; amount: number; id: string }[]
  >([]);
  const [taxRate, setTaxRate] = useState(0.18);
  const [deposit, setDeposit] = useState<number>(0);

  function addItem() {
    setItems([{ desc: "New charge", amount: 0, id: uuidv4() }, ...items]);
  }
  function updateItem(
    id: string,
    next: Partial<{ desc: string; amount: number }>
  ) {
    setItems(items.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }
  function removeItem(id: string) {
    setItems(items.filter((it) => it.id !== id));
  }

  const subtotal = money(items.reduce((s, it) => s + (it.amount || 0), 0));
  const tax = money(subtotal * taxRate);
  const total = money(subtotal + tax - deposit);

  function handleCreate() {
    if (!customerName) return alert("Customer name required");
    const inv: Invoice = {
      id: uuidv4(),
      customerName,
      carId: selectedCar || null,
      items: items.map((it) => ({
        id: it.id,
        description: it.desc,
        amount: money(it.amount),
      })),
      subtotal,
      tax,
      total,
      createdAt: new Date().toISOString(),
      paid: false,
      deposit: deposit || 0,
    };
    setInvoices([inv, ...invoices]);
    // mark car rented if selected
    if (selectedCar) {
      const allCars = JSON.parse(
        localStorage.getItem("cc_cars") || "[]"
      ) as Car[];
      const updated = allCars.map((c) =>
        c.id === selectedCar ? { ...c, status: "Rented" } : c
      );
      localStorage.setItem("cc_cars", JSON.stringify(updated));
    }
    // clear form
    setCustomerName("");
    setSelectedCar("");
    setItems([]);
    setDeposit(0);
    alert("Invoice created");
  }

  function handlePrint(inv: Invoice) {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html><head><title>Invoice ${
        inv.id
      }</title></head><body><pre>${JSON.stringify(
        inv,
        null,
        2
      )}</pre></body></html>`
    );
    w.document.close();
    w.print();
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-[#00ffff]">
      <h2 className="text-2xl font-bold text-[#00ffff] mb-4">Bill Creation</h2>

      <div className="space-y-3">
        <input
          placeholder="Customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded"
        />
        <select
          value={selectedCar}
          onChange={(e) => setSelectedCar(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded"
        >
          <option value="">-- Select Car (optional) --</option>
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.make} {c.model} • {c.license} ({c.status})
            </option>
          ))}
        </select>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Items</div>
            <div>
              <button
                onClick={addItem}
                className="px-3 py-1 bg-[#00ffff] text-gray-900 rounded"
              >
                + Add Item
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex gap-2">
                <input
                  value={it.desc}
                  onChange={(e) => updateItem(it.id, { desc: e.target.value })}
                  className="p-2 bg-gray-800 rounded flex-1"
                />
                <input
                  type="number"
                  value={it.amount}
                  onChange={(e) =>
                    updateItem(it.id, {
                      amount: parseFloat(e.target.value || "0"),
                    })
                  }
                  className="w-32 p-2 bg-gray-800 rounded"
                />
                <button
                  onClick={() => removeItem(it.id)}
                  className="px-3 bg-red-600 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-sm text-gray-400">
                No custom items added yet. Add rental fee, extras, fines here.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value || "0"))}
            className="p-2 bg-gray-800 rounded"
          />
          <input
            type="number"
            step="0.01"
            value={deposit}
            onChange={(e) => setDeposit(parseFloat(e.target.value || "0"))}
            className="p-2 bg-gray-800 rounded"
            placeholder="Deposit"
          />
        </div>

        <div className="p-3 bg-gray-800 rounded">
          <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
          <div>Tax: ₹{tax.toFixed(2)}</div>
          <div className="font-bold">
            Total (after deposit): ₹{total.toFixed(2)}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-[#00ffff] rounded font-bold text-gray-900"
          >
            Create Invoice
          </button>
          <button
            onClick={() => {
              // quick demo print last created invoice
              const inv = invoices[0];
              if (!inv) return alert("No invoice to print");
              handlePrint(inv);
            }}
            className="px-4 py-2 bg-gray-700 rounded border border-[#00ffff]"
          >
            Print Last
          </button>
        </div>
      </div>
    </div>
  );
}
