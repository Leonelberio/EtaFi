#!/bin/bash

# Database Restore Test Script
# Use this script to test restoring the database backup

echo "Database Restore Test Script"
echo "============================"
echo ""
echo "This script will help you restore the database backup."
echo "IMPORTANT: This will overwrite the current database!"
echo ""
echo "Available backup files:"
ls -la *.dump *.sql
echo ""
echo "To restore using custom format (.dump):"
echo "pg_restore --verbose --no-password --dbname=\"\$DATABASE_URL\" compta_projet_backup_TIMESTAMP.dump"
echo ""
echo "To restore using SQL format (.sql):"
echo "psql \"\$DATABASE_URL\" < compta_projet_backup_TIMESTAMP.sql"
echo ""
echo "To restore schema only:"
echo "psql \"\$DATABASE_URL\" < compta_projet_schema_TIMESTAMP.sql"
echo ""
echo "⚠️  WARNING: Always test on a development database first!"
echo "⚠️  Make sure you have a current backup before restoring!"
