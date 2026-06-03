import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { parseCreateCheckoutOrderDto } from './dto/create-checkout-order.dto';
import { parseListOrdersQuery } from './dto/list-orders-query.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findRecentGuestOrders(@Query() query: Record<string, unknown>) {
    return this.ordersService.findRecentGuestOrders(parseListOrdersQuery(query));
  }

  @Post('checkout')
  createCheckoutOrder(@Body() body: Record<string, unknown>) {
    return this.ordersService.createCheckoutOrder(parseCreateCheckoutOrderDto(body));
  }

  @Get(':orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }
}
