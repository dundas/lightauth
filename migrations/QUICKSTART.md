# Database Migration Quick Start

**5-minute setup guide for running mech-auth database migrations**

## Prerequisites

- PostgreSQL connection string (DATABASE_URL)
- `psql` client installed

## Step 1: Get Database URL

From your PostgreSQL provider (Neon, Supabase, etc.):

```bash
export DATABASE_URL="postgresql://user:password@host.region.provider.com:5432/database"
```

## Step 2: Run Migrations

```bash
cd /Users/kefentse/dev_env/mech/mech-auth

# Run all migrations in order (copy-paste this entire block)
psql $DATABASE_URL -f migrations/001_create_users_table.sql && \
psql $DATABASE_URL -f migrations/002_create_sessions_table.sql && \
psql $DATABASE_URL -f migrations/003_create_verification_tokens.sql && \
psql $DATABASE_URL -f migrations/004_create_reset_tokens.sql && \
echo "✅ All migrations completed successfully!"
```

## Step 3: Verify

```bash
psql $DATABASE_URL -c "\dt"
```

Expected output:
```
                    List of relations
 Schema |            Name             | Type  |  Owner
--------+-----------------------------+-------+---------
 public | email_verification_tokens   | table | user
 public | password_reset_tokens       | table | user
 public | sessions                    | table | user
 public | users                       | table | user
```

## Step 4: Test Connection

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

Expected output:
```
 count
-------
     0
(1 row)
```

## Troubleshooting

### Error: psql: command not found

**macOS**:
```bash
brew install postgresql
```

**Ubuntu/Debian**:
```bash
sudo apt-get install postgresql-client
```

### Error: connection refused

- Check DATABASE_URL is correct
- Check database is accessible from your network
- Add `?sslmode=require` if provider requires SSL

### Error: permission denied

Your user needs these permissions:
- CREATE TABLE
- CREATE INDEX
- CREATE FUNCTION
- CREATE TRIGGER

## Rollback (if needed)

```bash
# Rollback all migrations
psql $DATABASE_URL -f migrations/rollback_004.sql && \
psql $DATABASE_URL -f migrations/rollback_003.sql && \
psql $DATABASE_URL -f migrations/rollback_002.sql && \
psql $DATABASE_URL -f migrations/rollback_001.sql && \
echo "✅ All migrations rolled back"
```

## Next Steps

1. Update your app's DATABASE_URL environment variable
2. Review `/src/database/schema.ts` for TypeScript types
3. See `/DATABASE_SCHEMA.md` for complete documentation
4. See `/migrations/README.md` for detailed instructions

## Need Help?

- Full migration guide: `/migrations/README.md`
- Schema documentation: `/DATABASE_SCHEMA.md`
- TypeScript types: `/src/database/schema.ts`
- Project overview: `/REFACTOR_PLAN.md`
