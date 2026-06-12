import Link from "next/link";
import { CustomerNav } from "@/components/customer-nav";
import { getInvoice, getInvoicePdfUrl, type InvoiceDetail } from "@/lib/invoices";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoiceNumber: string }>;
}) {
  const { invoiceNumber } = await params;
  const invoice = await getInvoice(invoiceNumber);

  if (!invoice) {
    return (
      <main className="min-h-screen bg-[#f6f6f4] text-[#171717]">
        <CustomerNav />
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-lg border border-dashed border-[#d7d7cf] bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d21f32]">
              Invoice
            </p>
            <h1 className="mt-2 text-3xl font-black">Invoice not found</h1>
            <p className="mt-3 text-sm font-semibold text-[#646464]">
              We could not find `{invoiceNumber}` in the billing system yet.
            </p>
            <Link
              href="/orders"
              className="mt-6 inline-flex rounded-md bg-[#d21f32] px-5 py-3 font-black text-white"
            >
              Back to orders
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f4] text-[#171717]">
      <CustomerNav />
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d21f32]">
              Invoice
            </p>
            <h1 className="mt-2 text-3xl font-black">{invoice.invoiceNumber}</h1>
            <p className="mt-1 text-sm font-semibold text-[#646464]">
              Generated {formatDateTime(invoice.generatedAt)}
            </p>
          </div>
          <Link
            href={`/orders/${invoice.orderNumber}`}
            className="w-fit rounded-md bg-[#171717] px-5 py-3 text-sm font-black text-white"
          >
            Track order
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-[#e8e8e3] bg-white shadow-sm">
          <div className="grid gap-5 border-b border-[#e8e8e3] bg-[#fffaf2] p-5 sm:grid-cols-3">
            <InvoiceMeta label="Order" value={invoice.orderNumber} helper={formatStatus(invoice.orderStatus)} />
            <InvoiceMeta label="Customer" value={invoice.customer.name} helper={invoice.customer.email} />
            <InvoiceMeta label="Payment" value={invoice.payment?.status ?? "Captured"} helper={invoice.payment?.paymentId ?? "Payment captured"} />
          </div>

          <div className="p-5">
            <div className="hidden rounded-md bg-[#f6f6f4] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#646464] sm:grid sm:grid-cols-[minmax(260px,1fr)_110px_130px_140px]">
              <span>Item</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>

            <div className="divide-y divide-[#eeeeea]">
              {invoice.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 py-4 text-sm sm:grid-cols-[minmax(260px,1fr)_110px_130px_140px] sm:items-start"
                >
                  <div>
                    <p className="font-black">{item.name}</p>
                    {item.note ? (
                      <p className="mt-1 rounded-md bg-[#f9f9f7] px-2 py-1 text-xs font-semibold text-[#646464]">
                        Note: {item.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex justify-between sm:block sm:text-right">
                    <span className="font-bold text-[#646464] sm:hidden">Qty</span>
                    <span className="font-semibold">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between sm:block sm:text-right">
                    <span className="font-bold text-[#646464] sm:hidden">Rate</span>
                    <span>{formatCurrency(item.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between font-black sm:block sm:text-right">
                    <span className="text-[#646464] sm:hidden">Amount</span>
                    <span>{formatCurrency(item.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 border-t border-[#e8e8e3] bg-[#fbfbf8] p-5 lg:grid-cols-[1fr_340px]">
            <div className="space-y-2 text-sm font-semibold text-[#646464]">
              <p>Placed: {formatDateTime(invoice.placedAt)}</p>
              <p>Pickup: {formatDateTime(invoice.pickupTime)}</p>
              <p>Provider: {invoice.payment?.provider ?? "Razorpay"}</p>
            </div>

            <InvoiceTotals invoice={invoice} />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[#e8e8e3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#646464]">
            Need this for reimbursement or records? Download the receipt as a PDF.
          </p>
          <a
            href={getInvoicePdfUrl(invoice.invoiceNumber)}
            className="w-fit rounded-md bg-[#d21f32] px-5 py-3 text-sm font-black text-white transition hover:bg-[#c82031]"
          >
            Download PDF
          </a>
        </div>
      </section>
    </main>
  );
}

function InvoiceMeta({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d21f32]">{label}</p>
      <p className="mt-2 font-black">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[#646464]">{helper}</p>
    </div>
  );
}

function InvoiceTotals({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <div className="space-y-3 text-sm text-[#555]">
      <div className="flex justify-between gap-4">
        <span>Subtotal</span>
        <span>{formatCurrency(invoice.subtotalAmount)}</span>
      </div>
      {invoice.discountAmount > 0 ? (
        <div className="flex justify-between gap-4 text-[#166534]">
          <span>Discount{invoice.couponCode ? ` (${invoice.couponCode})` : ""}</span>
          <span>- {formatCurrency(invoice.discountAmount)}</span>
        </div>
      ) : null}
      <div className="flex justify-between gap-4">
        <span>Tax</span>
        <span>{formatCurrency(invoice.taxAmount)}</span>
      </div>
      <div className="flex justify-between gap-4 border-t border-[#e8e8e3] pt-3 text-lg font-black text-[#171717]">
        <span>Total paid</span>
        <span>{formatCurrency(invoice.totalAmount)}</span>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return `Rs ${value}`;
}

function formatDateTime(value: string | undefined | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ");
}
