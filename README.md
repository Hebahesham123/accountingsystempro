# Accounting System Pro

A comprehensive double-entry accounting system built with Next.js, TypeScript, and Supabase.

## Features

- 📊 **Chart of Accounts** - Hierarchical account management
- 📝 **Journal Entries** - Double-entry bookkeeping
- 📈 **Financial Reports** - Balance Sheet, Income Statement, Cash Flow Statement
- 👥 **User Management** - Role-based access control (Admin, Accountant, User)
- 🔐 **Authentication** - Email and PIN-based login
- 📄 **Export & Print** - CSV export and print functionality for all reports
- 🌳 **Hierarchical Data** - Tree structure for accounts with parent-child relationships

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **UI**: Radix UI + Tailwind CSS
- **Deployment**: Vercel

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Hebahesham123/accountingsystempro.git
cd accountingsystempro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

Run these SQL scripts in your Supabase SQL Editor (in order):

1. `scripts/01-create-tables.sql` - Creates all tables
2. `scripts/17-add-pin-to-users.sql` - Adds PIN column to users
3. `scripts/19-reset-and-create-users.sql` - Creates default users

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Users

After running the SQL scripts, you can login with:

- **Admin**: `admin@gmail.com` / `1234` (Full access)
- **Accountant**: `accountant@gmail.com` / `5678` (Can edit accounting data)
- **User**: `user@gmail.com` / `9012` (View only)

## Deployment

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Project Structure

```
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/                    # Utilities and services
│   ├── accounting-utils.ts # Core accounting logic
│   ├── auth-utils.ts       # Authentication utilities
│   └── supabase.ts         # Supabase client
├── scripts/                # SQL migration scripts
└── public/                 # Static assets
```

## Features Documentation

- [Permissions Summary](./PERMISSIONS_SUMMARY.md) - User roles and permissions
- [Chart of Accounts](./CHART_OF_ACCOUNTS_README.md) - Account management
- [Account Reports](./ACCOUNT_REPORTS_README.md) - Detailed account reports

## License

This project is private and proprietary.

## Support

For issues or questions, please check the documentation files or create an issue in the repository.

