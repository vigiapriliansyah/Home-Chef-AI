# Home Chef AI - Authentication Setup

This project uses Next.js v15 with the App Router and includes a complete authentication system with NextAuth.js, Prisma, and SQLite.

## Features

- 🔐 Authentication with NextAuth.js
- 📝 User registration with email/password
- 🔑 Login with credentials (email/password)
- 🌐 Social login with Google
- 🗄️ Database integration with Prisma and SQLite
- 🔒 Protected routes with middleware
- 🧩 TypeScript support

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- Yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Generate a secret key: `openssl rand -base64 32`
   - Add your Google OAuth credentials (Client ID and Client Secret)

```
# .env.local
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL="file:./dev.db"
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
yarn dev
```

## Authentication Flow

### Email/Password Registration

1. User navigates to `/auth/register`
2. User fills out the registration form
3. On submission, the form data is sent to `/api/auth/register`
4. The password is hashed and the user is created in the database
5. The user is automatically signed in and redirected to the home page

### Email/Password Login

1. User navigates to `/auth/signin`
2. User enters their email and password
3. On submission, NextAuth.js verifies the credentials
4. If valid, the user is signed in and redirected to the home page

### Google Authentication

1. User clicks "Sign in with Google" on the sign-in or register page
2. User is redirected to Google's authentication page
3. After authenticating with Google, the user is redirected back to the application
4. NextAuth.js creates or updates the user record in the database
5. The user is signed in and redirected to the home page

## Project Structure

- `/prisma` - Prisma schema and migrations
- `/src/app/api/auth` - NextAuth.js API routes
- `/src/app/auth` - Authentication pages (sign in, register)
- `/src/components/auth` - Authentication components
- `/src/lib` - Utility functions and configuration

## Protected Routes

Routes under `/protected` are protected by middleware and require authentication. If a user tries to access a protected route without being authenticated, they will be redirected to the sign-in page.

## Database Schema

The database schema includes the following models:

- `User` - User information
- `Account` - OAuth accounts linked to a user
- `Session` - User sessions
- `VerificationToken` - Tokens for email verification

## License

This project is licensed under the MIT License.
