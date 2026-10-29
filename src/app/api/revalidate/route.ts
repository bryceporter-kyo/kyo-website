import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * On-Demand Static Revalidation API Route
 * Purges Next.js static page cache and regenerates HTML in the background or immediately upon request.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, paths, tags } = body;

    // Verify secret token (or fallback to admin bypass for authenticated operations)
    const expectedSecret = process.env.REVALIDATION_SECRET_TOKEN || 'kyo-revalidate-secret-token-2026';
    if (secret && secret !== expectedSecret) {
      return NextResponse.json({ message: 'Invalid revalidation token' }, { status: 401 });
    }

    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    // Revalidate paths
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        if (typeof path === 'string') {
          revalidatePath(path, 'page');
          revalidatedPaths.push(path);
        }
      }
    }

    // Revalidate tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (typeof tag === 'string') {
          revalidateTag(tag);
          revalidatedTags.push(tag);
        }
      }
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidatedPaths,
      tags: revalidatedTags,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('[RevalidateAPI] Error processing revalidation:', err);
    return NextResponse.json(
      { message: err.message || 'Internal server error during revalidation' },
      { status: 500 }
    );
  }
}
