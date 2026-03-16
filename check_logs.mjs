
import { db } from './server/db.js';
import { auditLogs } from './shared/schema.js';

async function checkAuditLogs() {
  try {
    const logs = await db.select().from(auditLogs);
    console.log('Total Audit Logs in Drizzle:', logs.length);
    console.log('Audit Logs in Drizzle DB:', JSON.stringify(logs, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error fetching logs:', error);
    process.exit(1);
  }
}

checkAuditLogs();
