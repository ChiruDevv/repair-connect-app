/*
 * NextAuth.js Configuration
 * 
 * This file sets up authentication for the entire application using NextAuth v5.
 * 
 * How it works:
 * 1. User enters email + password on the login page
 * 2. NextAuth calls the authorize() function below
 * 3. We look up the user in MongoDB by email
 * 4. We compare the entered password with the stored bcrypt hash
 * 5. If valid, we return the user object -> NextAuth creates a JWT token
 * 6. The JWT is stored as a cookie in the browser
 * 7. On every subsequent request, NextAuth verifies the JWT and provides the session
 * 
 * We use JWT strategy (not database sessions) because:
 * - Works perfectly in serverless (Vercel) - no session table to query
 * - Faster - no DB lookup on every request
 * - Stateless - any serverless instance can verify the token
 */import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // This function is called when a user tries to log in
// It returns a user object if credentials are valid, or null if not
      async authorize(credentials) {
        // Validate that both email and password were provided
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        await connectToDatabase();
        // Find user by email. .select("+password") is needed because password field
// has select: false in the User model (so it's never returned by default)
        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user) return null;
        // Compare the plain text password with the stored bcrypt hash
// bcrypt.compare handles the salt automatically
        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isPasswordValid) return null;
        return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  // JWT strategy: session data is stored in a cookie, not in the database
// maxAge: 30 days in seconds - after this, user must log in again
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    // JWT callback: called whenever a JWT is created or updated
// When user first logs in (user is present), store their ID in the token
// This ID is later used by API routes to identify which user is making the request
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Session callback: called whenever session is checked (e.g., useSession())
// Copies the user ID from the JWT token into the session object
// This makes session.user.id available on the frontend
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },
  // Custom pages: override NextAuth default pages with our own
// Without this, logout would show a generic NextAuth page
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
