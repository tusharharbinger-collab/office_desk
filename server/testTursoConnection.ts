process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { createClient } from '@libsql/client';

try {
  (process as any).loadEnvFile?.();
} catch {}

const url = 'https://smartdesk-db-diyay13.aws-ap-south-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

console.log('🔍 Testing Turso Cloud Database Connection...');
console.log(`URL: ${url}`);

const client = createClient({
  url,
  authToken
});

async function testConnection() {
  try {
    const result = await client.execute('SELECT 1 as connected');
    console.log('🎉 ✅ SUCCESS! Connected to Turso Cloud Database!', result.rows);
  } catch (err: any) {
    console.error('❌ Connection error:', err.message);
  }
}

testConnection();
