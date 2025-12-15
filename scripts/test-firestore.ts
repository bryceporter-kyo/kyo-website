import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function test() {
  console.log('Testing Firestore connection...');
  console.log('Project ID:', serviceAccount.project_id);
  
  try {
    // Try to list collections
    const collections = await db.listCollections();
    console.log('Collections found:', collections.map(c => c.id));
    
    // Try a simple write
    console.log('Attempting to write a test document...');
    await db.collection('_test').doc('test').set({ timestamp: new Date().toISOString() });
    console.log('Write successful!');
    
    // Clean up
    await db.collection('_test').doc('test').delete();
    console.log('Test document deleted.');
    
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Details:', error.details);
  }
  
  await admin.app().delete();
}

test();
