# Production Readiness Checklist

Use this checklist to ensure your app is ready for real users.

## 🔒 Security (CRITICAL)

### Database Security
- [ ] **Enable RLS on all tables** - Run `scripts/26-enable-rls-policies.sql` in Supabase SQL Editor
- [ ] **Verify RLS is enabled** - Check Supabase Security Advisor (should show 0 errors)
- [ ] **Remove default test users** - Delete or change passwords for:
  - `admin@gmail.com` / `1234`
  - `accountant@gmail.com` / `5678`
  - `user@gmail.com` / `9012`
- [ ] **Create production admin user** - Create a secure admin account with strong PIN
- [ ] **Review service role key** - Ensure it's only used server-side, never exposed to client

### Environment Variables
- [ ] **Use production Supabase project** - Don't use development/test database
- [ ] **Secure environment variables** - Never commit `.env.local` to git
- [ ] **Verify Supabase keys** - Use production anon key (not service role key in client)
- [ ] **Set up CORS** - Configure Supabase to allow only your production domain

### Application Security
- [ ] **Remove console.log statements** - Clean up debug logs
- [ ] **Remove test data** - Clear any sample/test purchase orders, journal entries
- [ ] **Verify authentication** - Test login/logout flow
- [ ] **Check role-based access** - Verify permissions work correctly

## 📊 Database Setup

### Required SQL Scripts (Run in Order)
1. [ ] `scripts/01-create-tables.sql` - Core tables
2. [ ] `scripts/16-chart-of-accounts-schema.sql` - Chart of accounts structure
3. [ ] `scripts/17-add-pin-to-users.sql` - Add PIN authentication
4. [ ] `scripts/20-create-projects-table.sql` - Projects table
5. [ ] `scripts/21-create-purchase-orders-table.sql` - Purchase orders
6. [ ] `scripts/22-update-purchase-orders-two-approvals.sql` - Two-step approval
7. [ ] `scripts/23-add-rejection-reason-to-purchase-orders.sql` - Rejection reason
8. [ ] `scripts/25-add-supply-done-status.sql` - Supply done status
9. [ ] `scripts/26-enable-rls-policies.sql` - **Enable RLS (CRITICAL)**

### Database Verification
- [ ] **Verify all tables exist** - Check Supabase Table Editor
- [ ] **Check foreign key constraints** - Ensure relationships are correct
- [ ] **Verify indexes** - Check that indexes are created for performance
- [ ] **Test database connections** - Ensure app can connect to production DB

## 🚀 Deployment

### Pre-Deployment
- [ ] **Build test** - Run `npm run build` locally (should succeed)
- [ ] **Lint check** - Run `npm run lint` (fix any errors)
- [ ] **TypeScript check** - Run `npx tsc --noEmit` (fix any type errors)
- [ ] **Test all features** - Manual testing of critical paths:
  - [ ] Login/Logout
  - [ ] Create/Edit/Delete Journal Entries
  - [ ] Create/Edit/Delete Accounts
  - [ ] Purchase Order workflow (create, approve, reject, supply done)
  - [ ] Financial Reports generation
  - [ ] Export/Print functionality

### Vercel Deployment
- [ ] **Environment variables set**:
  - `NEXT_PUBLIC_SUPABASE_URL` (production URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production anon key)
- [ ] **Deploy to Vercel** - Follow [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- [ ] **Verify deployment** - Check build logs for errors
- [ ] **Test production URL** - Verify app works on production domain

### Post-Deployment
- [ ] **Update Supabase CORS** - Add production domain to allowed origins
- [ ] **Test production login** - Verify authentication works
- [ ] **Monitor error logs** - Check Vercel logs for any runtime errors
- [ ] **Set up error tracking** - Consider adding error monitoring (Sentry, etc.)

## 👥 User Management

### Initial Setup
- [ ] **Create production admin account**:
  ```sql
  INSERT INTO users (email, name, role, pin) 
  VALUES ('your-admin@company.com', 'Admin Name', 'admin', 'secure-pin-here');
  ```
- [ ] **Create accountant accounts** (if needed)
- [ ] **Create regular user accounts** (if needed)
- [ ] **Document user roles** - Share role permissions with team

### User Security
- [ ] **Enforce strong PINs** - Consider minimum length (4+ digits)
- [ ] **Document password reset process** - How to reset if user forgets PIN
- [ ] **Set up user management** - Admin should be able to create/manage users

## 📝 Data & Configuration

### Initial Data
- [ ] **Set up chart of accounts** - Create initial account structure
- [ ] **Configure accounting periods** - Set up current fiscal year/period
- [ ] **Clear test data** - Remove any sample journal entries, purchase orders
- [ ] **Set opening balances** - If needed, enter opening balances

### Configuration
- [ ] **Review language settings** - Ensure Arabic/English translations are correct
- [ ] **Check date formats** - Verify date display matches your region
- [ ] **Verify currency formatting** - Check currency symbols and formats

## 🧪 Testing

### Functional Testing
- [ ] **Test all user roles**:
  - Admin: Full access to all features
  - Accountant: Can edit accounting data, cannot manage users
  - User: View only, can create purchase orders and mark supply done
- [ ] **Test purchase order workflow**:
  - Create purchase order
  - Admin/Accountant approval (first approval)
  - Accountant/Admin approval (second approval)
  - User marks supply done
  - Verify status updates correctly
- [ ] **Test journal entries**:
  - Create entry
  - Edit entry
  - Delete entry
  - Reverse entry
- [ ] **Test reports**:
  - Balance Sheet
  - Income Statement
  - Trial Balance
  - Account Reports
  - Export to CSV

### Performance Testing
- [ ] **Test with realistic data volume** - Add sample data to test performance
- [ ] **Check page load times** - Should be < 3 seconds
- [ ] **Test on mobile devices** - Verify responsive design works
- [ ] **Test on different browsers** - Chrome, Firefox, Safari, Edge

## 📚 Documentation

- [ ] **Update README.md** - Ensure setup instructions are current
- [ ] **Document user guide** - Create guide for end users
- [ ] **Document admin procedures** - How to manage users, accounts, etc.
- [ ] **Create support contact** - Who to contact for issues

## 🔍 Final Checks

- [ ] **Remove all console.log** - Clean up debug statements
- [ ] **Remove test/example data** - Clear any sample data
- [ ] **Verify no hardcoded credentials** - Check for any hardcoded passwords/keys
- [ ] **Check for TODO comments** - Review and complete any TODOs
- [ ] **Verify error handling** - Test error scenarios (network failures, etc.)
- [ ] **Check backup strategy** - How will you backup Supabase data?

## ✅ Sign-Off

Once all items are checked:
- [ ] **Final review** - Have someone else review the checklist
- [ ] **Backup database** - Create backup before going live
- [ ] **Go live** - Deploy to production and notify users

---

## Quick Start Commands

```bash
# 1. Build test
npm run build

# 2. Type check
npx tsc --noEmit

# 3. Lint check
npm run lint

# 4. Test locally
npm run dev
```

## Critical SQL Scripts (Run in Supabase SQL Editor)

```sql
-- 1. Enable RLS (MOST IMPORTANT)
-- Run: scripts/26-enable-rls-policies.sql

-- 2. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. Create production admin (replace with your details)
INSERT INTO users (email, name, role, pin) 
VALUES ('admin@yourcompany.com', 'Admin Name', 'admin', 'your-secure-pin')
ON CONFLICT (email) DO NOTHING;

-- 4. Remove test users (optional, but recommended)
DELETE FROM users WHERE email IN (
  'admin@gmail.com',
  'accountant@gmail.com', 
  'user@gmail.com'
);
```

---

**Remember**: Security is the #1 priority. Never skip the RLS setup!

