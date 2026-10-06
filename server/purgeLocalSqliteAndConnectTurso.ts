import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';

console.log('🔄 Starting SQLite to Turso Migration & Cleanup Utility...');

// 1. Target files to purge
const filesToPurge = ['smartdesk.db', 'smartdesk.db-wal', 'smartdesk.db-shm'];

filesToPurge.forEach((filename) => {
  const filePath = path.resolve(process.cwd(), filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted local SQLite database file: ${filename}`);
    } catch (err: any) {
      console.warn(`⚠️ Could not delete ${filename}: ${err.message}`);
    }
  } else {
    console.log(`ℹ️ Local SQLite file ${filename} does not exist.`);
  }
});

// 2. Turso Connection Helper
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (TURSO_DATABASE_URL && TURSO_AUTH_TOKEN) {
  console.log(`🚀 Connecting to Turso Cloud Database at: ${TURSO_DATABASE_URL}`);
  const tursoClient = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  tursoClient.execute('SELECT 1')
    .then(() => console.log('✅ Successfully verified connection to Turso Cloud Database!'))
    .catch((err) => console.error('❌ Failed to connect to Turso Cloud Database:', err.message));
} else {
  console.log('\n💡 Turso Credentials Note:');
  console.log('To connect to your live Turso Cloud database:');
  console.log('1. Install Turso CLI: curl -sSfL https://get.turso.tech | bash');
  console.log('2. Create DB: turso db create smartdesk-db');
  console.log('3. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your .env file.');
}
