import type { Account, AuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email || !account.providerAccountId) {
        return false;
      }

      await syncGoogleUser(user, account);
      return true;
    },
  },
};

async function syncGoogleUser(user: User, account: Account) {
  const syncSecret = process.env.AUTH_SYNC_SECRET;

  try {
    const response = await fetch(`${apiUrl}/auth/google/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(syncSecret ? { "x-auth-sync-secret": syncSecret } : {}),
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        imageUrl: user.image,
        providerId: account.providerAccountId,
      }),
    });

    if (!response.ok) {
      console.warn(`Google user sync failed with status ${response.status}.`);
    }
  } catch (error) {
    console.warn("Google user sync failed.", error);
  }
}
