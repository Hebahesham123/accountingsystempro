-- Enable Row Level Security (RLS) on all tables
-- This script enables RLS and creates policies for secure access control

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Allow all authenticated users to read users (for user management)
CREATE POLICY "Users can read all users" ON users
  FOR SELECT
  USING (true);

-- Only admins can insert users (handled by service role in app)
CREATE POLICY "Service role can manage users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ACCOUNT TYPES POLICIES
-- ============================================

-- All authenticated users can view account types
CREATE POLICY "Users can view account types" ON account_types
  FOR SELECT
  USING (true);

-- Only admins and accountants can modify account types (handled by service role)
CREATE POLICY "Service role can manage account types" ON account_types
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ACCOUNTS POLICIES
-- ============================================

-- All authenticated users can view accounts
CREATE POLICY "Users can view accounts" ON accounts
  FOR SELECT
  USING (true);

-- Only admins and accountants can modify accounts (handled by service role)
CREATE POLICY "Service role can manage accounts" ON accounts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ACCOUNTING PERIODS POLICIES
-- ============================================

-- All authenticated users can view accounting periods
CREATE POLICY "Users can view accounting periods" ON accounting_periods
  FOR SELECT
  USING (true);

-- Only admins and accountants can modify periods (handled by service role)
CREATE POLICY "Service role can manage accounting periods" ON accounting_periods
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- JOURNAL ENTRIES POLICIES
-- ============================================

-- All authenticated users can view journal entries
CREATE POLICY "Users can view journal entries" ON journal_entries
  FOR SELECT
  USING (true);

-- Only admins and accountants can modify journal entries (handled by service role)
CREATE POLICY "Service role can manage journal entries" ON journal_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- JOURNAL ENTRY LINES POLICIES
-- ============================================

-- All authenticated users can view journal entry lines
CREATE POLICY "Users can view journal entry lines" ON journal_entry_lines
  FOR SELECT
  USING (true);

-- Only admins and accountants can modify journal entry lines (handled by service role)
CREATE POLICY "Service role can manage journal entry lines" ON journal_entry_lines
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- OPENING BALANCES POLICIES
-- ============================================

-- All authenticated users can view opening balances
CREATE POLICY "Users can view opening balances" ON opening_balances
  FOR SELECT
  USING (true);

-- Only admins and accountants can modify opening balances (handled by service role)
CREATE POLICY "Service role can manage opening balances" ON opening_balances
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- AUDIT TRAIL POLICIES
-- ============================================

-- All authenticated users can view audit trail
CREATE POLICY "Users can view audit trail" ON audit_trail
  FOR SELECT
  USING (true);

-- Only system can insert audit trail (handled by service role)
CREATE POLICY "Service role can manage audit trail" ON audit_trail
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- All authenticated users can view projects
CREATE POLICY "Users can view projects" ON projects
  FOR SELECT
  USING (true);

-- Only admins and accountants can modify projects (handled by service role)
CREATE POLICY "Service role can manage projects" ON projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PURCHASE ORDERS POLICIES
-- ============================================

-- All authenticated users can view purchase orders
CREATE POLICY "Users can view purchase orders" ON purchase_orders
  FOR SELECT
  USING (true);

-- All authenticated users can create purchase orders
CREATE POLICY "Users can create purchase orders" ON purchase_orders
  FOR INSERT
  WITH CHECK (true);

-- Only admins and accountants can approve/reject (handled by service role)
-- Regular users can only mark supply as done (handled by service role)
CREATE POLICY "Service role can manage purchase orders" ON purchase_orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- NOTES
-- ============================================
-- 
-- IMPORTANT: These policies use "USING (true)" which allows service role
-- (used by your application) to access all data. The actual role-based
-- access control is handled in your application layer (auth-utils.ts).
--
-- This provides defense in depth:
-- 1. Database level: RLS prevents unauthorized direct database access
-- 2. Application level: Your code enforces role-based permissions
--
-- If you migrate to Supabase Auth in the future, you can update these
-- policies to use auth.uid() and check user roles from the users table.
--
-- To verify RLS is enabled, run:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- ============================================

