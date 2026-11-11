import prisma from '../src/config/database';

async function main() {
  try {
    const lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { email: 'b_1794137382486@t.com' },
          { email: { contains: '1794137382486' } },
        ],
      },
    });
    console.log('Lead found:', lead);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'b_1794137382486@t.com' },
          { email: { contains: '1794137382486' } },
        ],
      },
    });
    console.log('User found:', user);

    const allApprovedLeads = await prisma.lead.findMany({
      where: {
        status: { in: ['SENT', 'Disetujui', 'APPROVED', 'ACCEPTED'] },
      },
    });
    console.log('All approved leads count:', allApprovedLeads.length);
    console.log('Sample approved leads:', allApprovedLeads);
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

