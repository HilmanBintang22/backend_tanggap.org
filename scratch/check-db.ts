import prisma from '../src/config/database';

async function main() {
  try {
    const tables: any = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log('Tables in public schema:', tables.map((t: any) => t.table_name));

    // Check columns of Lead or school_leads
    const leadColumns: any = await prisma.$queryRaw`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND (table_name LIKE '%lead%' OR table_name LIKE '%school%')`;
    console.log('Lead/School columns:', leadColumns);

    // Let's check existing leads
    try {
      const leads = await prisma.lead.findMany({ take: 5 });
      console.log('Prisma Lead sample:', leads);
    } catch (e: any) {
      console.log('Prisma Lead query failed:', e.message);
    }

    // Let's check if table school_leads exists
    try {
      const schoolLeads: any = await prisma.$queryRaw`SELECT * FROM "school_leads" LIMIT 5`;
      console.log('Raw school_leads query:', schoolLeads);
    } catch (e: any) {
      console.log('Raw school_leads failed:', e.message);
    }
  } catch (err: any) {
    console.error('DB query error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
