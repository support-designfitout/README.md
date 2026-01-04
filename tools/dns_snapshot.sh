#!/usr/bin/env bash
set -euo pipefail

DOMAINS=("designfitout.com" "fitoutlab.app")
OUT_DIR="${OUT_DIR:-Studio36OS/_reports/DFOL}"
mkdir -p "$OUT_DIR"

STAMP="$(date -u +'%Y-%m-%dT%H-%M-%SZ')"
OUT_FILE="$OUT_DIR/dns_snapshot_$STAMP.txt"

{
  echo "DFOL DNS Snapshot – $STAMP"
  echo "======================================"
  for d in "${DOMAINS[@]}"; do
    echo
    echo "### $d"
    echo "NS:"
    dig +short NS "$d" @1.1.1.1 || true
    echo
    echo "A / AAAA:"
    dig +short A    "$d" @1.1.1.1 || true
    dig +short AAAA "$d" @1.1.1.1 || true
    echo
    echo "CNAME www:"
    dig +short CNAME "www.$d" @1.1.1.1 || true
    echo
    echo "MX:"
    dig +short MX "$d" @1.1.1.1 || true
    echo
    echo "TXT:"
    dig +short TXT "$d" @1.1.1.1 || true
    echo
    echo "DS:"
    dig +short DS "$d" @1.1.1.1 || true
    echo "--------------------------------------"
  done
} >"$OUT_FILE"

echo "Written: $OUT_FILE"