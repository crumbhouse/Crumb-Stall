export type InvoiceDetail = {
  id: string;
  invoiceNumber: string;
  generatedAt: string;
  invoiceUrl: string | null;
  orderNumber: string;
  orderStatus: string;
  placedAt: string;
  pickupTime: string | null;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    note: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string | null;
  payment: {
    provider: string;
    status: string;
    paymentId: string | null;
    providerOrderId: string | null;
    amount: number;
    currency: string;
  } | null;
};

const apiUrl =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api/v1";

export function getInvoicePdfUrl(invoiceNumber: string) {
  return `/api/invoices/${encodeURIComponent(invoiceNumber)}/pdf`;
}

export async function getInvoice(invoiceNumber: string): Promise<InvoiceDetail | null> {
  try {
    const response = await fetch(`${apiUrl}/invoices/${invoiceNumber}`, {
      next: { revalidate: 5 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as InvoiceDetail;
  } catch {
    return null;
  }
}
