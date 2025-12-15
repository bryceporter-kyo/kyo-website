import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Try different initialization approaches
console.log('Project ID:', serviceAccount.project_id);

// Approach 1: Using getFirestore with databaseId
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Try with the default database
const db = admin.firestore();

async function test() {
  console.log('\n=== Testing Firestore (default database) ===');
  
  try {
    // Get project info
    console.log('Firestore settings:', db.settings);
    
    // Try to add a document
    console.log('Attempting to add document to test collection...');
    const docRef = await db.collection('test').add({ 
      message: 'Hello from seed script',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Document written with ID:', docRef.id);
    
    // Delete test doc
    await docRef.delete();
    console.log('Test document deleted.');
    
  } catch (error: any) {
    console.error('\nError occurred:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    if (error.details) console.error('  Details:', error.details);
    if (error.metadata) console.error('  Metadata:', JSON.stringify(error.metadata));
  }
  
  await admin.app().delete();
  console.log('\nTest complete.');
}

test();
