#!/usr/bin/env bash
# Clean, repeatable database setup for an ISOLATED STAGING backend only.
# Usage: STAGING_DB_URL=postgres://... scripts/staging-setup.sh
# Refuses to run without STAGING_DB_URL; never point this at production.
set -euo pipefail
: "${STAGING_DB_URL:?Set STAGING_DB_URL to the isolated staging database}"
case "$STAGING_DB_URL" in *bvdvagmfbshvbhmrvlpi*) echo "Refusing: this is the shared production backend." >&2; exit 1;; esac

# Step 1: base table (not tracked by the journal). Applied once; skipped when present.
if [ "$(psql "$STAGING_DB_URL" -tAc "select to_regclass('public.discovery_call_submissions') is not null")" = "t" ]; then
  echo "Step 1: discovery_call_submissions exists, skipping."
else
  psql "$STAGING_DB_URL" -v ON_ERROR_STOP=1 -1 -f supabase/migrations/20260529163005_f63843f2-8932-4bf5-b444-3e8188138f02.sql
fi

# Step 2: journal migrations 0000-0059 (60 entries). drizzle-kit records applied entries
# in drizzle.__drizzle_migrations, so a repeated run applies nothing new.
LOVABLE_DB_MIGRATION_URL="$STAGING_DB_URL" bunx drizzle-kit migrate

# Step 3: verification (read-only).
psql "$STAGING_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
select count(*) as journal_entries_applied from drizzle.__drizzle_migrations;
select count(*) filter (where not c.relrowsecurity) as public_tables_without_rls
  from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r';
select count(*) as auth_users from auth.users;
SQL
echo "Done. Expected: 60 journal entries, 0 tables without row security, 0 users before TEST accounts are created."
