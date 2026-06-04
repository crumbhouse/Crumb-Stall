import {
  AdminApprovalStatus,
  AuthProvider,
  PrismaClient,
  UserRole,
  FoodType,
  CouponType,
} from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Snacks',
    slug: 'snacks',
    description: 'Fast bites for between classes.',
    sortOrder: 1,
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    description: 'Coffee, tea, shakes, and refreshers.',
    sortOrder: 2,
  },
  {
    name: 'Combos',
    slug: 'combos',
    description: 'Student-friendly meal bundles.',
    sortOrder: 3,
  },
  {
    name: 'Desserts',
    slug: 'desserts',
    description: 'Sweet finishes and quick treats.',
    sortOrder: 4,
  },
];

async function main() {
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? 'CrumbHouse@2026';
  const superAdmin = await prisma.user.upsert({
    where: { email: 'crumbhouse2026@gmail.com' },
    update: {
      name: 'Crumb House Super Admin',
      role: UserRole.SUPER_ADMIN,
      provider: AuthProvider.CREDENTIALS,
      passwordHash: hashPassword(superAdminPassword),
      adminApprovalStatus: AdminApprovalStatus.APPROVED,
      adminApprovedAt: new Date(),
      isSuspended: false,
    },
    create: {
      email: 'crumbhouse2026@gmail.com',
      name: 'Crumb House Super Admin',
      role: UserRole.SUPER_ADMIN,
      provider: AuthProvider.CREDENTIALS,
      passwordHash: hashPassword(superAdminPassword),
      adminApprovalStatus: AdminApprovalStatus.APPROVED,
      adminApprovedAt: new Date(),
    },
  });

  await prisma.cart.upsert({
    where: { userId: superAdmin.id },
    update: {},
    create: { userId: superAdmin.id },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@crumbstall.local' },
    update: {
      adminApprovalStatus: AdminApprovalStatus.APPROVED,
      adminApprovedAt: new Date(),
      adminApprovedByEmail: superAdmin.email,
    },
    create: {
      email: 'admin@crumbstall.local',
      name: 'Crumb Stall Admin',
      role: UserRole.ADMIN,
      adminApprovalStatus: AdminApprovalStatus.APPROVED,
      adminApprovedAt: new Date(),
      adminApprovedByEmail: superAdmin.email,
    },
  });

  await prisma.cart.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  const categoryRecords = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });

    categoryRecords.set(category.slug, record.id);
  }

  const snacksId = categoryRecords.get('snacks');
  const beveragesId = categoryRecords.get('beverages');
  const combosId = categoryRecords.get('combos');

  if (!snacksId || !beveragesId || !combosId) {
    throw new Error('Seed categories were not created.');
  }

  await prisma.foodItem.upsert({
    where: { slug: 'classic-veg-burger' },
    update: {},
    create: {
      categoryId: snacksId,
      name: 'Classic Veg Burger',
      slug: 'classic-veg-burger',
      description: 'Crispy patty, fresh veggies, and house sauce in a toasted bun.',
      ingredients: ['Veg patty', 'Lettuce', 'Tomato', 'House sauce'],
      price: 89,
      discountPrice: 79,
      tags: ['burger', 'quick-bite', 'popular'],
      type: FoodType.VEG,
      isFeatured: true,
      popularity: 95,
    },
  });

  await prisma.foodItem.upsert({
    where: { slug: 'steamed-momos' },
    update: {},
    create: {
      categoryId: snacksId,
      name: 'Steamed Momos',
      slug: 'steamed-momos',
      description: 'Soft steamed momos served with spicy chutney.',
      ingredients: ['Flour wrap', 'Veg filling', 'Chilli chutney'],
      price: 69,
      tags: ['momos', 'student-favorite'],
      type: FoodType.VEG,
      isFeatured: true,
      popularity: 90,
    },
  });

  await prisma.foodItem.upsert({
    where: { slug: 'cold-coffee' },
    update: {},
    create: {
      categoryId: beveragesId,
      name: 'Cold Coffee',
      slug: 'cold-coffee',
      description: 'Chilled coffee blended smooth for a quick recharge.',
      ingredients: ['Coffee', 'Milk', 'Sugar'],
      price: 79,
      tags: ['coffee', 'beverage'],
      type: FoodType.VEG,
      popularity: 82,
    },
  });

  await prisma.foodItem.upsert({
    where: { slug: 'burger-coffee-combo' },
    update: {},
    create: {
      categoryId: combosId,
      name: 'Burger + Coffee Combo',
      slug: 'burger-coffee-combo',
      description: 'A filling burger with cold coffee at a student-friendly price.',
      ingredients: ['Classic Veg Burger', 'Cold Coffee'],
      price: 159,
      discountPrice: 139,
      tags: ['combo', 'value'],
      type: FoodType.VEG,
      isFeatured: true,
      popularity: 88,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: CouponType.PERCENTAGE,
      value: 10,
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-01-01T00:00:00.000Z'),
      usageLimit: 5000,
      minimumAmount: 99,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SAVE50' },
    update: {},
    create: {
      code: 'SAVE50',
      type: CouponType.FIXED_AMOUNT,
      value: 50,
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-01-01T00:00:00.000Z'),
      usageLimit: 2000,
      minimumAmount: 299,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');

  return `scrypt$${salt}$${hash}`;
}
