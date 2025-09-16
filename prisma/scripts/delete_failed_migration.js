import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  await client.query(`DELETE FROM "_prisma_migrations" WHERE migration_name = '20250915184000_add_email_to_user';`);
  console.log('Deleted failed migration record.');
  await client.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
