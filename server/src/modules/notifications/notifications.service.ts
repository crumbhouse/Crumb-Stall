import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ListNotificationsQuery } from './dto/list-notifications-query.dto';

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string, query: ListNotificationsQuery) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };

    const [notifications, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          userId,
          readAt: null,
        },
      }),
    ]);

    return {
      data: notifications.map(serializeNotification),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        unreadCount,
      },
    };
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        readAt: notification.readAt ?? new Date(),
      },
    });

    return serializeNotification(updatedNotification);
  }

  async markAllRead(userId: string) {
    const now = new Date();
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: now,
      },
    });

    return {
      updatedCount: result.count,
      readAt: now.toISOString(),
    };
  }

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: input,
    });

    return serializeNotification(notification);
  }
}

function serializeNotification(notification: {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  readAt: Date | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    readAt: notification.readAt?.toISOString() ?? null,
    metadata: notification.metadata,
    createdAt: notification.createdAt.toISOString(),
  };
}
