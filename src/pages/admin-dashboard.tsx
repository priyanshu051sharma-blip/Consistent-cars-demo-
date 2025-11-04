// pages/admin-dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isAdminLoggedIn } from "../utils/auth";
import CarManager from "../components/CarManager/CarManager";
import BillCreator from "../components/BillCreator/BillCreator";
import DailyInventory from "../components/DailyInventory/DailyInventory";

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  license: string;
  mileage: number;
  status: "Available" | "Rented" | "Reserved" | "Maintenance";
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}
export interface Invoice {
  id: string;
  customerName: string;
  carId: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  paid: boolean;
  deposit?: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace("/admin-login");
      return;
    }

    const rawCars = localStorage.getItem("cc_cars");
    const rawInvoices = localStorage.getItem("cc_invoices");
    if (rawCars) setCars(JSON.parse(rawCars));
    if (rawInvoices) setInvoices(JSON.parse(rawInvoices));
  }, [router]);

  useEffect(() => {
    localStorage.setItem("cc_cars", JSON.stringify(cars));
  }, [cars]);

  useEffect(() => {
    localStorage.setItem("cc_invoices", JSON.stringify(invoices));
  }, [invoices]);

  return (
    <>
      {/* <Header /> */}
      <main className="min-h-screen bg-[#0b0f10] text-white p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-4xl font-extrabold text-center">
            Admin Dashboard
          </h1>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <CarManager cars={cars} setCars={setCars} />
              <BillCreator
                cars={cars}
                invoices={invoices}
                setInvoices={setInvoices}
              />
            </div>

            <aside>
              <DailyInventory cars={cars} />
            </aside>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-6 mb-4 text-[#00ffff]">
              Invoices
            </h2>
            <div className="grid gap-4">
              {invoices.length === 0 && (
                <p className="text-gray-400">No invoices yet.</p>
              )}
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-gray-900 p-4 rounded-xl border border-[#00ffff] flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">{inv.customerName}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(inv.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm mt-2">
                      Total:{" "}
                      <span className="font-bold text-[#00ffff]">
                        ₹{inv.total.toFixed(2)}
                      </span>
                      {inv.paid ? (
                        <span className="ml-3 text-sm text-green-400">
                          Paid
                        </span>
                      ) : (
                        <span className="ml-3 text-sm text-yellow-400">
                          Unpaid
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const newInvs = invoices.map((i) =>
                          i.id === inv.id ? { ...i, paid: !i.paid } : i
                        );
                        setInvoices(newInvs);
                      }}
                      className="px-3 py-2 bg-[#00ffff] text-gray-900 rounded font-semibold"
                    >
                      Toggle Paid
                    </button>

                    <button
                      onClick={() => {
                        const win = window.open("", "_blank");
                        if (!win) return;
                        win.document.write(
                          `<pre>${JSON.stringify(inv, null, 2)}</pre>`
                        );
                        win.document.close();
                      }}
                      className="px-3 py-2 bg-gray-700 rounded border border-[#00ffff]"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => {
                        setInvoices(invoices.filter((i) => i.id !== inv.id));
                      }}
                      className="px-3 py-2 bg-red-600 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
