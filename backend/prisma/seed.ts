import {
  PrismaClient,
  Environment,
  TicketStatusValue,
  ActivityAction,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ENVIRONMENTS = [
  Environment.THOR,
  Environment.QA,
  Environment.RELEASE,
  Environment.PRODUCTION,
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'qa@example.com' },
    update: {},
    create: {
      email: 'qa@example.com',
      passwordHash,
      name: 'QA Tester',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
    },
  });

  const existingForUser = await prisma.ticket.count({
    where: { createdById: user.id },
  });
  if (existingForUser > 0) {
    console.log('Demo user already has tickets — skipping example tickets.');
    console.log('Users: qa@example.com / admin@example.com | Password: password123');
    return;
  }

  const examples = [
    {
      ticketId: 'TKT-1001',
      title: 'Login page validation on mobile',
      basecampLink: 'https://3.basecamp.com/example/posts/1001',
      notes: 'Verify responsive layout and OAuth redirect.',
      currentEnvironment: Environment.THOR,
      envStatuses: {
        [Environment.THOR]: TicketStatusValue.IN_PROGRESS,
        [Environment.QA]: TicketStatusValue.IN_PROGRESS,
        [Environment.RELEASE]: TicketStatusValue.IN_PROGRESS,
        [Environment.PRODUCTION]: TicketStatusValue.IN_PROGRESS,
      },
    },
    {
      ticketId: 'TKT-1002',
      title: 'Checkout flow end-to-end test',
      basecampLink: 'https://3.basecamp.com/example/posts/1002',
      notes: 'Payment sandbox credentials in vault.',
      currentEnvironment: Environment.QA,
      envStatuses: {
        [Environment.THOR]: TicketStatusValue.PASS,
        [Environment.QA]: TicketStatusValue.IN_PROGRESS,
        [Environment.RELEASE]: TicketStatusValue.IN_PROGRESS,
        [Environment.PRODUCTION]: TicketStatusValue.IN_PROGRESS,
      },
    },
    {
      ticketId: 'TKT-1003',
      title: 'API rate limiting behavior',
      basecampLink: 'https://3.basecamp.com/example/posts/1003',
      currentEnvironment: Environment.THOR,
      envStatuses: {
        [Environment.THOR]: TicketStatusValue.FAIL,
        [Environment.QA]: TicketStatusValue.IN_PROGRESS,
        [Environment.RELEASE]: TicketStatusValue.IN_PROGRESS,
        [Environment.PRODUCTION]: TicketStatusValue.IN_PROGRESS,
      },
    },
    {
      ticketId: 'TKT-1004',
      title: 'Dashboard export CSV feature',
      basecampLink: 'https://3.basecamp.com/example/posts/1004',
      currentEnvironment: Environment.RELEASE,
      envStatuses: {
        [Environment.THOR]: TicketStatusValue.PASS,
        [Environment.QA]: TicketStatusValue.PASS,
        [Environment.RELEASE]: TicketStatusValue.BLOCKED,
        [Environment.PRODUCTION]: TicketStatusValue.IN_PROGRESS,
      },
    },
    {
      ticketId: 'TKT-1005',
      title: 'Production smoke test suite',
      basecampLink: 'https://3.basecamp.com/example/posts/1005',
      currentEnvironment: Environment.PRODUCTION,
      envStatuses: {
        [Environment.THOR]: TicketStatusValue.PASS,
        [Environment.QA]: TicketStatusValue.PASS,
        [Environment.RELEASE]: TicketStatusValue.PASS,
        [Environment.PRODUCTION]: TicketStatusValue.PASS,
      },
    },
  ];

  for (const ex of examples) {
    await prisma.ticket.deleteMany({ where: { ticketId: ex.ticketId } });

    const ticket = await prisma.ticket.create({
      data: {
        ticketId: ex.ticketId,
        title: ex.title,
        basecampLink: ex.basecampLink,
        notes: ex.notes,
        currentEnvironment: ex.currentEnvironment,
        createdById: user.id,
        statuses: {
          create: ENVIRONMENTS.map((env) => ({
            environment: env,
            status: ex.envStatuses[env],
          })),
        },
        activityLogs: {
          create: {
            userId: user.id,
            action: ActivityAction.CREATED,
            environment: Environment.THOR,
            newStatus: TicketStatusValue.IN_PROGRESS,
            message: 'Seed: ticket created',
          },
        },
      },
      include: { statuses: true },
    });

    const hasFail = ticket.statuses.some((s) => s.status === TicketStatusValue.FAIL);
    const hasBlocked = ticket.statuses.some((s) => s.status === TicketStatusValue.BLOCKED);
    const prodPass =
      ticket.statuses.find((s) => s.environment === Environment.PRODUCTION)?.status ===
      TicketStatusValue.PASS;

    let overallStatus: 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'BLOCKED' = 'IN_PROGRESS';
    if (hasFail) overallStatus = 'FAIL';
    else if (hasBlocked) overallStatus = 'BLOCKED';
    else if (prodPass) overallStatus = 'PASS';

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { overallStatus },
    });
  }

  console.log('Seed completed.');
  console.log('Users: qa@example.com / admin@example.com');
  console.log('Password: password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
