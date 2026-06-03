import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const invoiceInclude = {
  order: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      coupon: {
        select: {
          code: true,
        },
      },
      items: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  },
} satisfies Prisma.InvoiceInclude;

type InvoiceRecord = Prisma.InvoiceGetPayload<{ include: typeof invoiceInclude }>;

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByInvoiceNumber(invoiceNumber: string) {
    const invoice = await this.ensureInvoice(invoiceNumber);

    return mapInvoice(invoice);
  }

  async generatePdf(invoiceNumber: string) {
    const invoice = mapInvoice(await this.ensureInvoice(invoiceNumber));
    const buffer = createInvoicePdf(invoice);

    return {
      buffer,
      filename: `${invoice.invoiceNumber}.pdf`,
    };
  }

  private async ensureInvoice(invoiceNumber: string) {
    const normalizedInvoiceNumber = normalizeInvoiceNumber(invoiceNumber);
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber: normalizedInvoiceNumber },
      include: invoiceInclude,
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    const orderNumber = getOrderNumberFromInvoiceNumber(normalizedInvoiceNumber);
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        invoice: {
          include: invoiceInclude,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Invoice not found');
    }

    if (order.invoice) {
      return order.invoice;
    }

    return this.prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber: normalizedInvoiceNumber,
      },
      include: invoiceInclude,
    });
  }
}

function normalizeInvoiceNumber(invoiceNumber: string) {
  const trimmed = invoiceNumber.trim().toUpperCase();
  return trimmed.startsWith('INV-') ? trimmed : `INV-${trimmed}`;
}

function getOrderNumberFromInvoiceNumber(invoiceNumber: string) {
  return invoiceNumber.startsWith('INV-') ? invoiceNumber.slice(4) : invoiceNumber;
}

function mapInvoice(invoice: InvoiceRecord) {
  const order = invoice.order;
  const payment = order.payments[0] ?? null;

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    generatedAt: invoice.generatedAt.toISOString(),
    invoiceUrl: invoice.invoiceUrl,
    orderNumber: order.orderNumber,
    orderStatus: order.status,
    placedAt: order.placedAt?.toISOString() ?? order.createdAt.toISOString(),
    pickupTime: order.pickupTime?.toISOString() ?? null,
    customer: {
      name: order.user.name,
      email: order.user.email,
    },
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      note: item.note,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
      totalPrice: item.totalPrice.toNumber(),
    })),
    subtotalAmount: order.subtotalAmount.toNumber(),
    taxAmount: order.taxAmount.toNumber(),
    discountAmount: order.discountAmount.toNumber(),
    totalAmount: order.totalAmount.toNumber(),
    couponCode: order.coupon?.code ?? null,
    payment: payment
      ? {
          provider: payment.provider,
          status: payment.status,
          paymentId: payment.providerPaymentId,
          providerOrderId: payment.providerOrderId,
          amount: payment.amount.toNumber(),
          currency: payment.currency,
        }
      : null,
  };
}

type InvoicePdfData = ReturnType<typeof mapInvoice>;

function createInvoicePdf(invoice: InvoicePdfData) {
  const lines = buildInvoicePdfLines(invoice);
  const content = lines
    .map(({ text, x, y, size = 10 }) => `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`)
    .join('\n');

  return buildPdf(content);
}

function buildInvoicePdfLines(invoice: InvoicePdfData) {
  const lines: Array<{ text: string; x: number; y: number; size?: number }> = [
    { text: 'Crumb Stall', x: 50, y: 790, size: 22 },
    { text: 'Scan. Order. Pickup.', x: 50, y: 770, size: 10 },
    { text: `Invoice: ${invoice.invoiceNumber}`, x: 50, y: 735, size: 14 },
    { text: `Order: ${invoice.orderNumber}`, x: 50, y: 715 },
    { text: `Generated: ${formatDate(invoice.generatedAt)}`, x: 50, y: 700 },
    { text: `Customer: ${invoice.customer.name}`, x: 50, y: 675 },
    { text: `Email: ${invoice.customer.email}`, x: 50, y: 660 },
    { text: `Payment: ${invoice.payment?.status ?? 'Captured'}`, x: 50, y: 640 },
    { text: 'Items', x: 50, y: 605, size: 13 },
    { text: 'Qty  Item', x: 50, y: 585 },
    { text: 'Amount', x: 450, y: 585 },
  ];

  let y = 565;
  for (const item of invoice.items) {
    lines.push({ text: `${item.quantity} x ${item.name}`, x: 50, y });
    lines.push({ text: formatAmount(item.totalPrice), x: 450, y });
    y -= 15;

    if (item.note) {
      lines.push({ text: `Note: ${item.note}`, x: 70, y, size: 9 });
      y -= 15;
    }
  }

  y -= 20;
  lines.push({ text: `Subtotal: ${formatAmount(invoice.subtotalAmount)}`, x: 350, y });
  y -= 16;

  if (invoice.discountAmount > 0) {
    lines.push({
      text: `Discount${invoice.couponCode ? ` (${invoice.couponCode})` : ''}: -${formatAmount(invoice.discountAmount)}`,
      x: 350,
      y,
    });
    y -= 16;
  }

  lines.push({ text: `Tax: ${formatAmount(invoice.taxAmount)}`, x: 350, y });
  y -= 18;
  lines.push({ text: `Total paid: ${formatAmount(invoice.totalAmount)}`, x: 350, y, size: 13 });
  lines.push({ text: 'Thank you for ordering from Crumb Stall.', x: 50, y: 80, size: 11 });

  return lines;
}

function buildPdf(content: string) {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  pdf += offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, '0')} 00000 n \n`)
    .join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf);
}

function escapePdfText(value: string) {
  return value
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function formatAmount(value: number) {
  return `Rs ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
