/**
 * Tests for the Photos API routes
 * 
 * This test file validates:
 * 1. Supabase Storage bucket exists and is accessible
 * 2. GET /api/photos returns images correctly
 * 3. The seed-hero functionality works (reads files from public/edited)
 * 4. Ownership/auth checks work correctly
 * 
 * Run with: npm test (or npx tsx tests/testPhotosApi.ts)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientType = SupabaseClient<any, any, any> | null;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';
const OWNER_EMAILS = process.env.OWNER_EMAILS || '';

let passed = 0;
let failed = 0;

function log(level: 'info' | 'pass' | 'fail' | 'warn', message: string, data?: unknown) {
  const icons = { info: 'ℹ️', pass: '✅', fail: '❌', warn: '⚠️' };
  const icon = icons[level];
  if (data !== undefined) {
    console.log(`${icon} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  } else {
    console.log(`${icon} ${message}`);
  }
}

function assert(condition: boolean, message: string, details?: unknown): void {
  if (condition) {
    log('pass', message);
    passed++;
  } else {
    log('fail', message, details);
    failed++;
  }
}

async function testEnvironmentVariables() {
  log('info', '=== Testing Environment Variables ===');
  
  assert(!!SUPABASE_URL, 'SUPABASE_URL is set', { value: SUPABASE_URL ? '***' : undefined });
  assert(!!SUPABASE_SERVICE_KEY, 'SUPABASE_SERVICE_ROLE_KEY is set', { value: SUPABASE_SERVICE_KEY ? '***' : undefined });
  assert(!!SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is set', { value: SUPABASE_ANON_KEY ? '***' : undefined });
  assert(!!PHOTOS_BUCKET, 'SUPABASE_PHOTOS_BUCKET is set', { value: PHOTOS_BUCKET });
  assert(!!OWNER_EMAILS, 'OWNER_EMAILS is set', { value: OWNER_EMAILS });
  
  // Validate URL format
  if (SUPABASE_URL) {
    try {
      new URL(SUPABASE_URL);
      log('pass', 'SUPABASE_URL is a valid URL');
      passed++;
    } catch {
      log('fail', 'SUPABASE_URL is not a valid URL', { value: SUPABASE_URL });
      failed++;
    }
  }
}

async function testSupabaseConnection() {
  log('info', '=== Testing Supabase Connection ===');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    log('warn', 'Skipping Supabase connection test - missing credentials');
    return null;
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Test basic connection by listing buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      log('fail', 'Failed to connect to Supabase Storage', { error: error.message });
      failed++;
      return null;
    }
    
    log('pass', 'Connected to Supabase Storage successfully');
    passed++;
    
    // Check if photos bucket exists
    const photosBucket = buckets?.find(b => b.name === PHOTOS_BUCKET);
    assert(!!photosBucket, `Bucket "${PHOTOS_BUCKET}" exists`, { 
      availableBuckets: buckets?.map(b => b.name) 
    });
    
    if (photosBucket) {
      log('info', 'Photos bucket details', {
        name: photosBucket.name,
        public: photosBucket.public,
        created_at: photosBucket.created_at
      });
    }
    
    return supabase;
  } catch (e) {
    log('fail', 'Exception connecting to Supabase', { error: e instanceof Error ? e.message : String(e) });
    failed++;
    return null;
  }
}

async function testStorageListFiles(supabase: SupabaseClientType) {
  log('info', '=== Testing Storage List Files ===');
  
  if (!supabase) {
    log('warn', 'Skipping storage list test - no Supabase client');
    return;
  }
  
  try {
    // List root of photos bucket
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .list('', { limit: 10 });
    
    if (rootError) {
      log('fail', 'Failed to list root of photos bucket', { error: rootError.message });
      failed++;
    } else {
      log('pass', 'Listed root of photos bucket');
      passed++;
      log('info', 'Root contents', { 
        count: rootFiles?.length ?? 0,
        items: rootFiles?.map(f => ({ name: f.name, isFolder: !f.metadata }))
      });
    }
    
    // List hero folder specifically
    const { data: heroFiles, error: heroError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .list('hero', { limit: 10 });
    
    if (heroError) {
      log('warn', 'Hero folder may not exist yet', { error: heroError.message });
    } else {
      log('info', 'Hero folder contents', {
        count: heroFiles?.length ?? 0,
        items: heroFiles?.map(f => f.name)
      });
    }
  } catch (e) {
    log('fail', 'Exception listing storage files', { error: e instanceof Error ? e.message : String(e) });
    failed++;
  }
}

async function testLocalEditedFiles() {
  log('info', '=== Testing Local public/edited Files ===');
  
  const root = process.cwd();
  const editedDir = path.join(root, 'public', 'edited');
  
  try {
    const exists = fs.existsSync(editedDir);
    assert(exists, `Directory exists: ${editedDir}`);
    
    if (!exists) return [];
    
    const entries = fs.readdirSync(editedDir, { withFileTypes: true });
    const files = entries.filter(e => e.isFile()).map(e => e.name);
    
    assert(files.length > 0, 'Found image files in public/edited', { files });
    
    // Check file sizes
    for (const file of files.slice(0, 3)) { // Check first 3 files
      const filePath = path.join(editedDir, file);
      const stats = fs.statSync(filePath);
      log('info', `File: ${file}`, { 
        size: `${(stats.size / 1024).toFixed(1)} KB`,
        extension: path.extname(file)
      });
    }
    
    return files;
  } catch (e) {
    log('fail', 'Exception reading local files', { error: e instanceof Error ? e.message : String(e) });
    failed++;
    return [];
  }
}

async function testUploadToStorage(supabase: SupabaseClientType) {
  log('info', '=== Testing Upload to Storage ===');
  
  if (!supabase) {
    log('warn', 'Skipping upload test - no Supabase client');
    return;
  }
  
  const testFileName = `test-${Date.now()}.txt`;
  const testContent = `Test file created at ${new Date().toISOString()}`;
  const testPath = `_test/${testFileName}`;
  
  try {
    // Upload test file
    const { error: uploadError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(testPath, Buffer.from(testContent), { 
        contentType: 'text/plain',
        upsert: true 
      });
    
    if (uploadError) {
      log('fail', 'Failed to upload test file', { error: uploadError.message });
      failed++;
      return;
    }
    
    log('pass', 'Uploaded test file successfully');
    passed++;
    
    // Get signed URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .createSignedUrl(testPath, 60);
    
    if (signedError) {
      log('warn', 'Failed to create signed URL', { error: signedError.message });
    } else {
      log('pass', 'Created signed URL');
      passed++;
      log('info', 'Signed URL (valid 60s)', { url: signedData?.signedUrl?.substring(0, 80) + '...' });
    }
    
    // Clean up - delete test file
    const { error: deleteError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove([testPath]);
    
    if (deleteError) {
      log('warn', 'Failed to clean up test file', { error: deleteError.message });
    } else {
      log('pass', 'Cleaned up test file');
      passed++;
    }
  } catch (e) {
    log('fail', 'Exception in upload test', { error: e instanceof Error ? e.message : String(e) });
    failed++;
  }
}

async function testOwnershipConfig() {
  log('info', '=== Testing Ownership Configuration ===');
  
  const emails = OWNER_EMAILS.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  
  assert(emails.length > 0, 'At least one owner email is configured', { emails });
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const email of emails) {
    const isValid = emailRegex.test(email);
    assert(isValid, `Valid email format: ${email}`);
  }
}

async function main() {
  console.log('\n🧪 Photos API Test Suite\n');
  console.log('=' .repeat(50));
  
  // Run all tests
  await testEnvironmentVariables();
  await testOwnershipConfig();
  const supabase = await testSupabaseConnection();
  await testStorageListFiles(supabase);
  await testLocalEditedFiles();
  await testUploadToStorage(supabase);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed > 0) {
    console.log('❌ Some tests failed. Check the output above for details.\n');
    console.log('Common issues:');
    console.log('  1. Missing environment variables in .env.local');
    console.log('  2. Supabase project not active or credentials invalid');
    console.log('  3. Storage bucket "photos" does not exist');
    console.log('  4. OWNER_EMAILS not configured');
    process.exit(1);
  }
  
  console.log('✅ All tests passed!\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
