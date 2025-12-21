# Vercel Deployment Guide

This guide will help you deploy your Accounting System to Vercel.

## Prerequisites

1. A GitHub account with your repository
2. A Vercel account (sign up at [vercel.com](https://vercel.com))
3. Your Supabase project URL and anon key

## Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `Hebahesham123/accountingsystempro`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
   
   **Important**: 
   - Replace `your_supabase_url_here` with your actual Supabase project URL
   - Replace `your_supabase_anon_key_here` with your actual Supabase anon key
   - Make sure to add these for all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? No (first time)
   - Project name: accountingsystempro (or your choice)
   - Directory: ./
   - Override settings? No

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   
   Enter the values when prompted.

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Supabase for Production

1. **Update Supabase CORS Settings**
   - Go to your Supabase Dashboard
   - Navigate to Settings → API
   - Add your Vercel domain to allowed origins:
     ```
     https://your-project.vercel.app
     ```

2. **Update Row Level Security (RLS)**
   - Make sure your RLS policies allow access from your Vercel domain
   - Or disable RLS for development (not recommended for production)

## Step 4: Verify Deployment

1. **Check Build Logs**
   - Go to your Vercel project dashboard
   - Click on the latest deployment
   - Check the build logs for any errors

2. **Test Your Application**
   - Visit your Vercel URL: `https://your-project.vercel.app`
   - Test login with: `admin@gmail.com` / `1234`
   - Verify all features work correctly

## Step 5: Set Up Database (If Not Done)

Before deploying, make sure you've run all SQL scripts in Supabase:

1. **Run in Supabase SQL Editor** (in order):
   - `scripts/01-create-tables.sql`
   - `scripts/17-add-pin-to-users.sql` (adds PIN column)
   - `scripts/19-reset-and-create-users.sql` (creates users)

2. **Verify Users Created**:
   ```sql
   SELECT name, email, role FROM users;
   ```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGci...` |

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)

### Environment Variables Not Working
- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check Supabase CORS settings
- Ensure RLS policies allow access

### Login Not Working
- Verify users exist in Supabase database
- Check that PIN column exists
- Run `scripts/19-reset-and-create-users.sql` if needed

## Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 24 hours)

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- Every push to `main` = Production deployment
- Pull requests = Preview deployments

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify Supabase connection
4. Review environment variables

---

**Your deployed app will be available at**: `https://your-project.vercel.app`

