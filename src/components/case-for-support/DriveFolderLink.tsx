'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
// NOTE: adjust this import to match your actual Firebase client init path.
import { auth } from '@/lib/firebase';

export function DriveFolderLink({ driveFolderUrl, className }: { driveFolderUrl: string | null, className?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);

  // Render nothing while auth state is still resolving, and nothing at all
  // if there's no folder or the visitor isn't signed in. Signed-out visitors
  // should see no trace that internal materials exist.
  if (!authResolved || !user || !driveFolderUrl) {
    return null;
  }

  return (
    <a
      href={driveFolderUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className || "inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 underline"}
    >
      View grant folder in Google Drive
    </a>
  );
}
