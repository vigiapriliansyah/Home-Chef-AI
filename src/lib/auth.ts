import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { compare, hash } from "bcrypt";

// Extend the Session type to include user.id
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your own logic here to validate credentials
        // This is where you would typically verify against your database
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // If no user was found or no password (could be a social login)
        if (!user || !user.password) {
          return null;
        }

        // Check if password matches
        const passwordMatch = await compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user'
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Persist the user id to the token
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // Handle sign-in event, e.g., for Google sign-ins
      if (account?.provider === 'google' && profile?.email) {
        // User already exists in the database because of the adapter
        // We don't need to do anything special here
      }
    },
  },
}; 