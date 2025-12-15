/**
 * Firebase Seed Script (Admin SDK Version)
 * 
 * This script pushes all existing JSON data to Firebase Firestore.
 * 
 * SETUP:
 * 1. Go to Firebase Console > Project Settings > Service Accounts
 * 2. Click "Generate new private key"
 * 3. Save the file as 'serviceAccountKey.json' in the project root
 * 4. Add 'serviceAccountKey.json' to .gitignore
 * 
 * RUN: npm run seed
 * 
 * Collections seeded:
 * - events
 * - announcements
 * - staff
 * - board
 * - links
 * - buttons
 * - internal-sections
 */

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Import JSON data
import eventsData from '../src/lib/events.json';
import announcementsData from '../src/lib/announcements.json';
import staffData from '../src/lib/staff.json';
import linksData from '../src/lib/links.json';
import buttonsData from '../src/lib/buttons.json';
import internalSectionsData from '../src/lib/internal-sections.json';
import placeholderImagesData from '../src/lib/placeholder-images.json';

// Check for service account key
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  console.error('');
  console.error('To fix this:');
  console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save the file as "serviceAccountKey.json" in the project root');
  console.error('4. Add "serviceAccountKey.json" to .gitignore');
  console.error('');
  process.exit(1);
}

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = getFirestore('default');

// Set Firestore settings for the default database
db.settings({
  ignoreUndefinedProperties: true
});

console.log(`🔧 Connected to Firebase project: ${serviceAccount.project_id}\n`);

interface SeedResult {
  collection: string;
  count: number;
  status: 'success' | 'error' | 'skipped';
  message?: string;
}

async function checkCollectionEmpty(collectionName: string): Promise<boolean> {
  try {
    const snapshot = await db.collection(collectionName).limit(1).get();
    return snapshot.empty;
  } catch (error) {
    console.log(`  ⚠️ Could not check if ${collectionName} is empty, will attempt to seed anyway`);
    return true;
  }
}

async function seedEvents(): Promise<SeedResult> {
  const collectionName = 'events';
  try {
    const isEmpty = await checkCollectionEmpty(collectionName);
    if (!isEmpty) {
      return { collection: collectionName, count: 0, status: 'skipped', message: 'Collection already has data' };
    }

    const batch = db.batch();
    const events = eventsData.events;
    
    for (const event of events) {
      const docRef = db.collection(collectionName).doc(String(event.id));
      batch.set(docRef, {
        date: event.date,
        name: event.name,
        location: event.location || null,
        time: event.time || null,
        link: event.link || null,
        type: event.type || 'normal'
      });
    }
    
    await batch.commit();
    return { collection: collectionName, count: events.length, status: 'success' };
  } catch (error) {
    return { collection: collectionName, count: 0, status: 'error', message: String(error) };
  }
}

async function seedAnnouncements(): Promise<SeedResult> {
  const collectionName = 'announcements';
  try {
    const isEmpty = await checkCollectionEmpty(collectionName);
    if (!isEmpty) {
      return { collection: collectionName, count: 0, status: 'skipped', message: 'Collection already has data' };
    }

    const batch = db.batch();
    const announcements = announcementsData.announcements;
    
    for (const announcement of announcements) {
      const docRef = db.collection(collectionName).doc(String(announcement.id));
      batch.set(docRef, {
        title: announcement.title,
        date: announcement.date,
        excerpt: announcement.excerpt,
        expiryDate: null
      });
    }
    
    await batch.commit();
    return { collection: collectionName, count: announcements.length, status: 'success' };
  } catch (error) {
    return { collection: collectionName, count: 0, status: 'error', message: String(error) };
  }
}

async function seedStaff(): Promise<SeedResult> {
  const collectionName = 'staff';
  try {
    const isEmpty = await checkCollectionEmpty(collectionName);
    if (!isEmpty) {
      return { collection: collectionName, count: 0, status: 'skipped', message: 'Collection already has data' };
    }

    const batch = db.batch();
    const staff = staffData.staff;
    
    for (const member of staff) {
      const docRef = db.collection(collectionName).doc(member.id);
      batch.set(docRef, {
        name: member.name,
        title: member.title,
        bio: member.bio,
        image: member.image,
        email: member.email
      });
    }
    
    await batch.commit();
    return { collection: collectionName, count: staff.length, status: 'success' };
  } catch (error) {
    return { collection: collectionName, count: 0, status: 'error', message: String(error) };
  }
}

async function seedBoard(): Promise<SeedResult> {
  const collectionName = 'board';
  try {
    const isEmpty = await checkCollectionEmpty(collectionName);
    if (!isEmpty) {
      return { collection: collectionName, count: 0, status: 'skipped', message: 'Collection already has data' };
    }

    const batch = db.batch();
    const board = staffData.board;
    
    for (const member of board) {
      const docRef = db.collection(collectionName).doc(member.id);
      batch.set(docRef, {
        name: member.name,
        title: member.title,
        bio: member.bio,
        image: member.image,
        email: member.email
      });
    }
    
    await batch.commit();
    return { collection: collectionName, count: board.length, status: 'success' };
  } catch (error) {
    return { collection: collectionName, count: 0, status: 'error', message: String(error) };
  }
}

async function seedLinks(): Promise<SeedResult> {
  const collectionName = 'links';
  try {
    const isEmpty = await checkCollectionEmpty(collectionName);
    if (!isEmpty) {
      return { collection: collectionName, count: 0, status: 'skipped', message: 'Collection already has data' };
    }

    const batch = db.batch();
    const links = linksData.links;
    
    for (const link of links) {
      const docRef = db.collection(collectionName).doc(link.id);
      batch.set(docRef, {
        name: link.name,
        url: link.url
      });
    }
    
    await batch.commit();
    return { collection: collectionName, count: links.length, status: 'success' };
  } catch (error) {
    return { collection: collectionName, count: 0, status: 'error', message: String(error) };
  }
}

async function seedButtons(): Promise<SeedResult> {
  const collectionName = 'buttons';
  try {
    const isEmpty = await checkCollectionEmpty(collectionName);
    if (!isEmpty) {
      return { collection: collectionName, count: 0, status: 'skipped', message: 'Collection already has data' };
    }

    const batch = db.batch();
    const buttons = buttonsData.buttons;
    
    for (const button of buttons) {
      const docRef = db.collection(collectionName).doc(button.id);
      batch.set(docRef, {
        location: button.location,
        text: button.text,
        link: button.link,
        visible: button.visible
      });
    }
    
    await batch.commit();
    return { collection: collectionName, count: buttons.length, status: 'success' };
  } catch (error) {
    return { collection: collectionName, count: 0, status: 'error', message: String(error) };
  }
}

async function seedInternalSections(): Promise<SeedResult> {
  const collectionName = 'internal-sections';
  try {
    const isEmpty = await checkCollectionEmpty(collectionName);
    if (!isEmpty) {
      return { collection: collectionName, count: 0, status: 'skipped', message: 'Collection already has data' };
    }

    const batch = db.batch();
    const sections = internalSectionsData.sections;
    
    for (const section of sections) {
      const docRef = db.collection(collectionName).doc(section.id);
      batch.set(docRef, {
        icon: section.icon,
        title: section.title,
        manager: section.manager,
        email: section.email,
        linkId: section.linkId
      });
    }
    
    await batch.commit();
    return { collection: collectionName, count: sections.length, status: 'success' };
  } catch (error) {
    return { collection: collectionName, count: 0, status: 'error', message: String(error) };
  }
}

async function seedImages(): Promise<SeedResult> {
  const collectionName = 'placeholder-images';
  try {
    const isEmpty = await checkCollectionEmpty(collectionName);
    if (!isEmpty) {
      return { collection: collectionName, count: 0, status: 'skipped', message: 'Collection already has data' };
    }

    const batch = db.batch();
    const images = placeholderImagesData.placeholderImages;
    
    for (const image of images) {
      const docRef = db.collection(collectionName).doc(image.id);
      batch.set(docRef, {
        ...image,
        originalUrl: image.imageUrl,
        updatedAt: new Date().toISOString()
      });
    }

    await batch.commit();
    return { collection: collectionName, count: images.length, status: 'success' };
  } catch (error) {
    console.error(`Error seeding ${collectionName}:`, error);
    return { collection: collectionName, count: 0, status: 'error', message: String(error) };
  }
}

async function main() {
  console.log('🔥 Firebase Seed Script (Admin SDK)');
  console.log('====================================\n');
  console.log('Pushing existing JSON data to Firebase Firestore...\n');

  const results: SeedResult[] = [];

  // Seed all collections
  console.log('📅 Seeding events...');
  results.push(await seedEvents());

  console.log('📢 Seeding announcements...');
  results.push(await seedAnnouncements());

  console.log('👥 Seeding staff...');
  results.push(await seedStaff());

  console.log('🏛️ Seeding board...');
  results.push(await seedBoard());

  console.log('🔗 Seeding links...');
  results.push(await seedLinks());

  console.log('🔘 Seeding buttons...');
  results.push(await seedButtons());

  console.log('📁 Seeding internal sections...');
  results.push(await seedInternalSections());

  console.log('🖼️ Seeding images...');
  results.push(await seedImages());

  // Print summary
  console.log('\n====================================');
  console.log('📊 Seed Results Summary');
  console.log('====================================\n');

  for (const result of results) {
    const icon = result.status === 'success' ? '✅' : result.status === 'skipped' ? '⏭️' : '❌';
    const message = result.message ? ` - ${result.message}` : '';
    console.log(`${icon} ${result.collection}: ${result.count} documents${message}`);
  }

  const successCount = results.filter(r => r.status === 'success').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  console.log('\n------------------------------------');
  console.log(`Total: ${successCount} succeeded, ${skippedCount} skipped, ${errorCount} failed`);
  console.log('------------------------------------\n');

  // Terminate the app
  await admin.app().delete();

  if (errorCount > 0) {
    console.log('⚠️ Some collections failed to seed. Check the errors above.');
    process.exit(1);
  } else {
    console.log('🎉 Seeding complete!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
