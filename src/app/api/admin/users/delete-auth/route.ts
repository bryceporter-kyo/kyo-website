import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    try {
      const user = await adminAuth.getUserByEmail(email.trim().toLowerCase());
      if (user && user.uid) {
        await adminAuth.deleteUser(user.uid);
        console.log(`[admin/users/delete-auth] Successfully deleted Firebase Auth user with uid ${user.uid} (${email})`);
        return NextResponse.json({ success: true, message: "User deleted from Firebase Auth" });
      }
    } catch (authError: any) {
      if (authError.code === "auth/user-not-found") {
        // User had no Firebase Auth account, which is fine
        return NextResponse.json({ success: true, message: "No Firebase Auth user existed for this email" });
      }
      console.error("[admin/users/delete-auth] Auth error:", authError);
      return NextResponse.json({ error: authError.message || "Failed to delete user from Firebase Auth" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin/users/delete-auth] Server error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
