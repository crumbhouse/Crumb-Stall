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
    async jwt({ token }) {
      if (token.email) {
        const sessionUser = await getSessionUser(token.email);

        if (sessionUser) {
          token.id = sessionUser.id;
          token.name = sessionUser.name;
          token.picture = sessionUser.imageUrl;
          token.role = sessionUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
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

async function getSessionUser(email: string) {
  const syncSecret = process.env.AUTH_SYNC_SECRET;

  try {
    const response = await fetch(`${apiUrl}/auth/session`, {
      headers: {
        "x-customer-email": email,
        ...(syncSecret ? { "x-auth-sync-secret": syncSecret } : {}),
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      user?: {
        id: string;
        name: string | null;
        imageUrl: string | null;
        role: "CUSTOMER" | "ADMIN";
      };
    };

    return payload.user ?? null;
  } catch (error) {
    console.warn("Session user lookup failed.", error);
    return null;
  }
}
