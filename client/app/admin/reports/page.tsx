import { AdminShell } from "@/components/admin-shell";

const reports = [
  {
    type: "orders",
    title: "Orders report",
    description:
      "Order number, status, customer, item summary, coupon, tax, discount, and total amount.",
  },
  {
    type: "customers",
    title: "Customers report",
    description:
      "Customer contact, join date, last activity, order count, total spend, and average order value.",
  },
  {
    type: "food-sales",
    title: "Food sales report",
    description:
      "Food item, category, quantity sold, and revenue sorted by the strongest sellers.",
  },
];

export default function AdminReportsPage() {
  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
          Reports
        </p>
        <h1 className="mt-2 text-3xl font-black">Export reports</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-500">
          Download styled Excel reports for operations, customer review, and sales analysis.
        </p>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {reports.map((report) => (
          <article key={report.type} className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-xl font-black">{report.title}</p>
            <p className="mt-2 min-h-20 text-sm font-semibold leading-6 text-stone-500">
              {report.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`/api/admin/reports/${report.type}?format=xlsx`}
                className="inline-flex rounded-md bg-stone-950 px-4 py-3 text-sm font-black text-white"
              >
                Download Excel
              </a>
              <a
                href={`/api/admin/reports/${report.type}?format=csv`}
                className="inline-flex rounded-md border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-700"
              >
                CSV
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Export notes</h2>
        <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-stone-600 md:grid-cols-3">
          <p>Reports are generated from the latest database state at download time.</p>
          <p>Only paid/placed-or-later orders are included in customer spend and food sales.</p>
          <p>Excel downloads include styled headings, filters, borders, frozen rows, and widths.</p>
        </div>
      </section>
    </AdminShell>
  );
}
