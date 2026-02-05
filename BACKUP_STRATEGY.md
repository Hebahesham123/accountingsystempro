# 🔒 Data Backup & Recovery Strategy

This guide ensures your accounting data is safely backed up and can be recovered if needed.

## 📋 Backup Methods

### 1. **Supabase Automated Backups** (Recommended - Easiest)

Supabase provides automatic daily backups for paid plans:

- **Free Plan**: Manual backups only
- **Pro Plan ($25/month)**: 7 days of point-in-time recovery
- **Team Plan**: 14 days of point-in-time recovery

**How to Enable:**
1. Go to Supabase Dashboard → Settings → Database
2. Enable "Point-in-time Recovery" (if on Pro/Team plan)
3. Backups run automatically daily

**How to Restore:**
1. Go to Supabase Dashboard → Database → Backups
2. Select a backup point
3. Click "Restore" (creates new database) or "Restore to current" (overwrites)

### 2. **Manual SQL Dumps** (Free - Recommended for all plans)

Create regular SQL backups of your entire database.

## 🛠️ Backup Scripts

### Quick Backup (All Data)

Run this in Supabase SQL Editor to export all your data:

```sql
-- This creates a backup script you can save
-- Copy the output and save as .sql file
```

**Better Method**: Use Supabase CLI or pg_dump (see below)

### Automated Backup Scripts

I've created comprehensive backup scripts for you:

1. **`scripts/32-backup-all-data.sql`** - Exports all data as INSERT statements
2. **`scripts/33-restore-from-backup.sql`** - Template for restoring from backup
3. **`scripts/34-quick-backup-verification.sql`** - Verify data before/after backup

**How to Use:**
1. Run `scripts/32-backup-all-data.sql` in Supabase SQL Editor
2. Copy all output (INSERT statements)
3. Save to file: `backup-YYYY-MM-DD.sql`
4. Store in cloud storage (Google Drive, Dropbox, etc.)

## 📅 Backup Schedule Recommendations

- **Daily**: Full database backup (automated via Supabase)
- **Weekly**: Manual SQL dump (save to cloud storage)
- **Monthly**: Full backup + test restore procedure
- **Before Major Changes**: Always backup before:
  - Running migration scripts
  - Deleting users
  - Bulk data updates

## 💾 Where to Store Backups

1. **Cloud Storage** (Recommended):
   - Google Drive
   - Dropbox
   - OneDrive
   - AWS S3

2. **Local Storage** (Secondary):
   - External hard drive
   - USB drive
   - Network drive

3. **Version Control** (For SQL scripts only - NOT data):
   - Git repository (scripts only, never commit actual data)

## 🚀 Quick Start Backup Process

### Weekly Backup (Recommended)

1. **Run Backup Script:**
   ```sql
   -- In Supabase SQL Editor, run:
   -- scripts/32-backup-all-data.sql
   ```

2. **Save Output:**
   - Copy all INSERT statements from output
   - Save as: `backup-2024-01-15.sql` (use current date)
   - File size: Usually 1-10 MB depending on data

3. **Store Backup:**
   - Upload to Google Drive / Dropbox / OneDrive
   - Create folder: "Accounting System Backups"
   - Keep last 4-8 weeks of backups

4. **Verify Backup:**
   ```sql
   -- Run before backup:
   -- scripts/34-quick-backup-verification.sql
   ```
   - Note the record counts
   - After restore, verify counts match

### Monthly Archive Backup

- Keep monthly backups for 12 months
- Store in separate "Monthly Archives" folder
- These are your long-term recovery points

## 🔄 Restore Process

If you need to restore data:

1. **Open Backup File:**
   - Find your backup file (e.g., `backup-2024-01-15.sql`)

2. **Review Restore Options:**
   - See `scripts/33-restore-from-backup.sql` for options
   - Choose: Restore to new DB or overwrite existing

3. **Run Restore:**
   - Copy INSERT statements from backup file
   - Paste into Supabase SQL Editor
   - Run the script

4. **Verify Restore:**
   - Run `scripts/34-quick-backup-verification.sql`
   - Compare record counts with original backup

## ⚠️ Important Notes

- **Never commit actual data to Git** - Only SQL scripts
- **Encrypt sensitive backups** - Use password protection for .sql files
- **Test restore procedures** - Verify backups work by testing restore
- **Keep multiple backup copies** - 3-2-1 rule:
  - 3 copies of your data
  - 2 different storage media (cloud + local)
  - 1 offsite backup (cloud storage)
- **Regular Schedule** - Set calendar reminder for weekly backups
- **Before Major Changes** - Always backup before:
  - Running migration scripts
  - Deleting users or data
  - Bulk updates
  - System upgrades

## 📊 Backup Checklist

- [ ] Weekly backup scheduled (every Monday?)
- [ ] Monthly archive created (first of month?)
- [ ] Backups stored in cloud storage
- [ ] Backup verification tested
- [ ] Restore procedure tested
- [ ] Backup location documented
- [ ] Team knows where backups are stored

