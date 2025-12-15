import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

console.log('Project ID:', serviceAccount.project_id);

// Initialize with explicit project ID
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

// Get Firestore with explicit database ID
const db = getFirestore(app, '(default)');

async function test() {
  console.log('\n=== Testing Firestore with explicit (default) database ===');
  
  try {
    console.log('Attempting to add document...');
    const docRef = await db.collection('test').add({ 
      message: 'Hello from seed script',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Document written with ID:', docRef.id);
    
    await docRef.delete();
    console.log('✅ Test document deleted.');
    
  } catch (error: any) {
    console.error('\n❌ Error occurred:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    
    // Check if it's a permission issue
    if (error.code === 7) {
      console.error('\n  This is a PERMISSION_DENIED error.');
      console.error('  Make sure the service account has Firestore access.');
    }
  }
  
  await admin.app().delete();
  console.log('\nTest complete.');
}

test();
