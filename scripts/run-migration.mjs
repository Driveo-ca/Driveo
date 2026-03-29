/**
 * Run a SQL migration against your Supabase database.
 *
 * Usage:
 *   node scripts/run-migration.mjs <migration-file> --db-password <password>
 *
 * Example:
 *   node scripts/run-migration.mjs supabase/migrations/007_rls_policies.sql --db-password YOUR_DB_PASSWORD
 *
 * Or set SUPABASE_DB_PASSWORD env var:
 *   SUPABASE_DB_PASSWORD=xxx node scripts/run-migration.mjs supabase/migrations/007_rls_policies.sql
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Read .env.local for SUPABASE_URL
const envPath = path.join(rootDir, '.env.local');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

// Extract project ref from Supabase URL
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

// Get DB password
const args = process.argv.slice(2);
const pwIdx = args.indexOf('--db-password');
const dbPassword = (pwIdx !== -1 ? args[pwIdx + 1] : null) || process.env.SUPABASE_DB_PASSWORD;

if (!dbPassword) {
  console.error('ERROR: Provide database password via --db-password flag or SUPABASE_DB_PASSWORD env var');
  process.exit(1);
}

// Get migration file
const migrationFile = args.find(a => a.endsWith('.sql'));
if (!migrationFile) {
  console.error('ERROR: Provide a .sql migration file path');
  process.exit(1);
}

const sqlPath = path.resolve(rootDir, migrationFile);
if (!fs.existsSync(sqlPath)) {
  console.error(`ERROR: File not found: ${sqlPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf-8');

// Connect to Supabase PostgreSQL
const client = new pg.Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: dbPassword,
  ssl: { rejectUnauthorized: false },
});

try {
  console.log(`Connecting to db.${projectRef}.supabase.co ...`);
  await client.connect();
  console.log('Connected. Running migration...\n');
  await client.query(sql);
  console.log('Migration applied successfully!');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
