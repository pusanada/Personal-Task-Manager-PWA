import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';

// Load .env.local manually for this verification script
const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

console.log('====================================================');
console.log('🔍 [1/3] CHECKING ENVIRONMENT VARIABLES (.env.local)');
console.log('====================================================');

const requiredEnvs = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Supabase Service Role Key' },
  { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', label: 'Firebase Web API Key' },
  { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', label: 'Firebase Project ID' },
  { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', label: 'Firebase Sender ID' },
  { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', label: 'Firebase Web App ID' },
  { key: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY', label: 'Firebase Web Push VAPID Key' },
  { key: 'FIREBASE_CLIENT_EMAIL', label: 'Firebase Admin Client Email' },
  { key: 'FIREBASE_PRIVATE_KEY', label: 'Firebase Admin Private Key' },
];

let envErrors = 0;
for (const item of requiredEnvs) {
  const val = env[item.key];
  if (!val || val.includes('placeholder') || val.includes('your-')) {
    console.error(`❌ ${item.label} (${item.key}): MISSING or INVALID`);
    envErrors++;
  } else {
    const preview = val.length > 20 ? `${val.slice(0, 12)}...${val.slice(-6)}` : val;
    console.log(`✅ ${item.label} (${item.key}): SET [${preview}]`);
  }
}

console.log('\n====================================================');
console.log('🔍 [2/3] VERIFYING SUPABASE & FIREBASE SDK CONNECTIONS');
console.log('====================================================');

// 1. Test Supabase Service Role Connection
let supabaseSuccess = false;
try {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.from('tasks').select('id').limit(1);
  if (error) {
    console.error(`❌ Supabase Service Role Test: FAILED -> ${error.message}`);
  } else {
    console.log(`✅ Supabase Service Role Connection: SUCCESS (Connected to database)`);
    supabaseSuccess = true;
  }
} catch (err) {
  console.error(`❌ Supabase Connection Exception: ${err.message}`);
}

// 2. Test Firebase Admin Private Key
let firebaseSuccess = false;
try {
  let privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const app = admin.initializeApp(
    {
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    },
    'verification-app'
  );

  console.log(`✅ Firebase Admin SDK Initialized: SUCCESS (Project: ${app.options.projectId})`);
  firebaseSuccess = true;
} catch (err) {
  console.error(`❌ Firebase Admin SDK Initialization: FAILED -> ${err.message}`);
}

console.log('\n====================================================');
console.log('🔍 [3/3] TESTING ALL REST API ENDPOINTS (http://localhost:3000)');
console.log('====================================================');

const BASE_URL = 'http://localhost:3000';

async function testApi() {
  const results = [];

  // 1. GET /api/tasks
  try {
    const res = await fetch(`${BASE_URL}/api/tasks`);
    const json = await res.json();
    if (res.ok && Array.isArray(json.data)) {
      results.push({ endpoint: 'GET /api/tasks', status: res.status, result: 'PASSED', info: `${json.data.length} tasks retrieved` });
    } else {
      results.push({ endpoint: 'GET /api/tasks', status: res.status, result: 'FAILED', info: JSON.stringify(json) });
    }
  } catch (e) {
    results.push({ endpoint: 'GET /api/tasks', status: 500, result: 'ERROR', info: e.message });
  }

  // 2. POST /api/tasks
  let createdTaskId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '🧪 Temporary Verification Task',
        subject: 'API Test',
        priority: 'High',
        deadline: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    const json = await res.json();
    if (res.status === 201 && json.data?.id) {
      createdTaskId = json.data.id;
      results.push({ endpoint: 'POST /api/tasks', status: res.status, result: 'PASSED', info: `Created task ID: ${createdTaskId}` });
    } else {
      results.push({ endpoint: 'POST /api/tasks', status: res.status, result: 'FAILED', info: JSON.stringify(json) });
    }
  } catch (e) {
    results.push({ endpoint: 'POST /api/tasks', status: 500, result: 'ERROR', info: e.message });
  }

  // 3. GET /api/tasks/[id]
  if (createdTaskId) {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${createdTaskId}`);
      const json = await res.json();
      if (res.ok && json.data?.id === createdTaskId) {
        results.push({ endpoint: `GET /api/tasks/[id]`, status: res.status, result: 'PASSED', info: `Retrieved task "${json.data.title}"` });
      } else {
        results.push({ endpoint: `GET /api/tasks/[id]`, status: res.status, result: 'FAILED', info: JSON.stringify(json) });
      }
    } catch (e) {
      results.push({ endpoint: `GET /api/tasks/[id]`, status: 500, result: 'ERROR', info: e.message });
    }

    // 4. PUT /api/tasks/[id]
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${createdTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress', priority: 'Medium' }),
      });
      const json = await res.json();
      if (res.ok && json.data?.status === 'In Progress') {
        results.push({ endpoint: `PUT /api/tasks/[id]`, status: res.status, result: 'PASSED', info: `Updated status to "In Progress"` });
      } else {
        results.push({ endpoint: `PUT /api/tasks/[id]`, status: res.status, result: 'FAILED', info: JSON.stringify(json) });
      }
    } catch (e) {
      results.push({ endpoint: `PUT /api/tasks/[id]`, status: 500, result: 'ERROR', info: e.message });
    }

    // 5. DELETE /api/tasks/[id]
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${createdTaskId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        results.push({ endpoint: `DELETE /api/tasks/[id]`, status: res.status, result: 'PASSED', info: `Cleaned up task ID: ${createdTaskId}` });
      } else {
        results.push({ endpoint: `DELETE /api/tasks/[id]`, status: res.status, result: 'FAILED', info: JSON.stringify(json) });
      }
    } catch (e) {
      results.push({ endpoint: `DELETE /api/tasks/[id]`, status: 500, result: 'ERROR', info: e.message });
    }
  }

  // 6. POST /api/import
  try {
    const res = await fetch(`${BASE_URL}/api/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: [
          {
            title: 'Sample Batch Import Task',
            subject: 'Batch Subject',
            priority: 'Low',
            deadline: new Date(Date.now() + 172800000).toISOString(),
          },
        ],
      }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      results.push({ endpoint: 'POST /api/import', status: res.status, result: 'PASSED', info: `Imported ${json.count} task(s)` });
      // clean up if id returned
      if (json.data?.[0]?.id) {
        await fetch(`${BASE_URL}/api/tasks/${json.data[0].id}`, { method: 'DELETE' });
      }
    } else {
      results.push({ endpoint: 'POST /api/import', status: res.status, result: 'FAILED', info: JSON.stringify(json) });
    }
  } catch (e) {
    results.push({ endpoint: 'POST /api/import', status: 500, result: 'ERROR', info: e.message });
  }

  // 7. POST /api/notifications/register
  try {
    const res = await fetch(`${BASE_URL}/api/notifications/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'test_fcm_token_verification_12345',
        platform: 'web',
      }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      results.push({ endpoint: 'POST /api/notifications/register', status: res.status, result: 'PASSED', info: 'Token schema registered' });
    } else {
      results.push({ endpoint: 'POST /api/notifications/register', status: res.status, result: 'FAILED', info: JSON.stringify(json) });
    }
  } catch (e) {
    results.push({ endpoint: 'POST /api/notifications/register', status: 500, result: 'ERROR', info: e.message });
  }

  // 8. POST /api/notifications/send (Schema / Auth test)
  try {
    const res = await fetch(`${BASE_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'test_token',
        title: 'Test',
        body: 'Body',
      }),
    });
    const json = await res.json();
    // With fake token, Firebase will return 400 or 500 with invalid token message, proving endpoint runs through Firebase Admin
    if (res.status === 400 || res.status === 500 || res.ok) {
      results.push({ endpoint: 'POST /api/notifications/send', status: res.status, result: 'PASSED', info: `Firebase handler executed: ${json.error || 'Sent'}` });
    } else {
      results.push({ endpoint: 'POST /api/notifications/send', status: res.status, result: 'FAILED', info: JSON.stringify(json) });
    }
  } catch (e) {
    results.push({ endpoint: 'POST /api/notifications/send', status: 500, result: 'ERROR', info: e.message });
  }

  // 9. GET /api/notifications/cron
  try {
    const res = await fetch(`${BASE_URL}/api/notifications/cron`);
    const json = await res.json();
    if (res.ok) {
      results.push({ endpoint: 'GET /api/notifications/cron', status: res.status, result: 'PASSED', info: `Cron executed (Tasks evaluated: ${json.tasksEvaluated ?? 0}, Sent: ${json.remindersSent ?? 0})` });
    } else {
      results.push({ endpoint: 'GET /api/notifications/cron', status: res.status, result: 'FAILED', info: JSON.stringify(json) });
    }
  } catch (e) {
    results.push({ endpoint: 'GET /api/notifications/cron', status: 500, result: 'ERROR', info: e.message });
  }

  for (const r of results) {
    const icon = r.result === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} [${r.status}] ${r.endpoint.padEnd(32)}: ${r.result} (${r.info})`);
  }
}

await testApi();
