import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':invoiceNumber/pdf')
  async downloadPdf(@Param('invoiceNumber') invoiceNumber: string, @Res() response: Response) {
    const { buffer, filename } = await this.invoicesService.generatePdf(invoiceNumber);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.send(buffer);
  }

  @Get(':invoiceNumber')
  findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.invoicesService.findByInvoiceNumber(invoiceNumber);
  }
}
