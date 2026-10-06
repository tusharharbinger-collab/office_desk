import { createClient } from '@libsql/client';

// Read from .env if present
try {
  (process as any).loadEnvFile?.();
} catch {}

const url = process.env.TURSO_DATABASE_URL || 'libsql://smartdesk-db-diyay13.aws-ap-south-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

console.log('🔍 Testing Turso Cloud Database Connection...');
console.log(`URL: ${url}`);

if (!authToken) {
  console.log('\n⚠️ TURSO_AUTH_TOKEN is missing in your .env file!');
  console.log('Please add TURSO_AUTH_TOKEN=your_token_here to your .env file.');
  process.exit(1);
}

const client = createClient({
  url,
  authToken
});

async function testConnection() {
  try {
    const result = await client.execute('SELECT 1 as connected');
    console.log('✅ Connected to Turso successfully!', result.rows);
  } catch (err: any) {
    console.error('❌ Failed to connect to Turso:', err.message);
  }
}

testConnection();
