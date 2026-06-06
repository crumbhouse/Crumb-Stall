import { Injectable, MessageEvent } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { Observable, Subject, filter, map, startWith } from 'rxjs';

type BaseLiveEvent = {
  createdAt: string;
  orderNumber?: string;
  status?: OrderStatus;
};

type CustomerLiveEvent = BaseLiveEvent & {
  scope: 'customer';
  userId: string;
  type: 'notification' | 'order-status';
  notificationId?: string;
};

type AdminLiveEvent = BaseLiveEvent & {
  scope: 'admin';
  type: 'admin-order-updated';
};

type LiveEvent = CustomerLiveEvent | AdminLiveEvent;

@Injectable()
export class LiveEventsService {
  private readonly events$ = new Subject<LiveEvent>();

  customerEvents(userId: string): Observable<MessageEvent> {
    return this.events$.pipe(
      filter(
        (event): event is CustomerLiveEvent =>
          event.scope === 'customer' && event.userId === userId,
      ),
      map((event) => toMessageEvent(event)),
      startWith(
        toMessageEvent({
          scope: 'customer',
          userId,
          type: 'notification',
          createdAt: new Date().toISOString(),
        }),
      ),
    );
  }

  adminEvents(): Observable<MessageEvent> {
    return this.events$.pipe(
      filter((event): event is AdminLiveEvent => event.scope === 'admin'),
      map((event) => toMessageEvent(event)),
      startWith(
        toMessageEvent({
          scope: 'admin',
          type: 'admin-order-updated',
          createdAt: new Date().toISOString(),
        }),
      ),
    );
  }

  emitCustomerNotification(input: {
    userId: string;
    notificationId: string;
    orderNumber?: string;
    status?: OrderStatus;
  }) {
    this.events$.next({
      scope: 'customer',
      type: 'notification',
      userId: input.userId,
      notificationId: input.notificationId,
      orderNumber: input.orderNumber,
      status: input.status,
      createdAt: new Date().toISOString(),
    });
  }

  emitCustomerOrderStatus(input: {
    userId: string;
    orderNumber: string;
    status: OrderStatus;
  }) {
    this.events$.next({
      scope: 'customer',
      type: 'order-status',
      userId: input.userId,
      orderNumber: input.orderNumber,
      status: input.status,
      createdAt: new Date().toISOString(),
    });
  }

  emitAdminOrderUpdated(input: { orderNumber: string; status: OrderStatus }) {
    this.events$.next({
      scope: 'admin',
      type: 'admin-order-updated',
      orderNumber: input.orderNumber,
      status: input.status,
      createdAt: new Date().toISOString(),
    });
  }
}

function toMessageEvent(event: LiveEvent): MessageEvent {
  return {
    data: event,
  };
}
