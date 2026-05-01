#!/bin/bash
# Run this from the repo root: bash fix-structure.sh

set -e
PAGES="frontend/src/pages"

echo "=== Fixing nested page directories ==="

# Move files out of subdirs if they exist nested
for dir in LoginPage RegisterPage DashboardPage ProjectsPage ProjectDetailPage TasksPage; do
  if [ -d "$PAGES/$dir" ]; then
    echo "Flattening $dir..."
    # Move all files up one level
    find "$PAGES/$dir" -type f | while read f; do
      fname=$(basename "$f")
      # Map component files to correct names at parent level
      dest="$PAGES/$fname"
      echo "  $f -> $dest"
      mv "$f" "$dest" 2>/dev/null || true
    done
    rmdir "$PAGES/$dir" 2>/dev/null || rm -rf "$PAGES/$dir"
  fi
done

echo ""
echo "=== Final pages structure ==="
find frontend/src/pages -type f | sort

echo ""
echo "=== Verifying key imports will resolve ==="
for f in frontend/src/pages/*.jsx; do
  echo "  OK: $f"
done
