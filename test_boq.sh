#!/bin/bash

# test_boq.sh - Validation script for BOQ-related API endpoints
# This script validates the structure and presence of the Pages Function API stubs

echo "🧪 Testing BOQ API endpoint structure..."

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASSED=0
TOTAL=0

# Test 1: Check if pages/next-app/functions/api directory exists
echo -n "Testing directory structure... "
TOTAL=$((TOTAL + 1))
if [ -d "pages/next-app/functions/api" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 2: Check if materials.ts exists
echo -n "Testing materials.ts exists... "
TOTAL=$((TOTAL + 1))
if [ -f "pages/next-app/functions/api/materials.ts" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 3: Check if boq.ts exists
echo -n "Testing boq.ts exists... "
TOTAL=$((TOTAL + 1))
if [ -f "pages/next-app/functions/api/boq.ts" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 4: Check if quotes.ts exists
echo -n "Testing quotes.ts exists... "
TOTAL=$((TOTAL + 1))
if [ -f "pages/next-app/functions/api/quotes.ts" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 5: Validate materials.ts contains required function signature
echo -n "Testing materials.ts function signature... "
TOTAL=$((TOTAL + 1))
if grep -q "export const onRequest: PagesFunction" pages/next-app/functions/api/materials.ts; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 6: Validate materials.ts queries v_materials_search
echo -n "Testing materials.ts queries v_materials_search... "
TOTAL=$((TOTAL + 1))
if grep -q "v_materials_search" pages/next-app/functions/api/materials.ts; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 7: Validate materials.ts has search parameter handling
echo -n "Testing materials.ts search parameter handling... "
TOTAL=$((TOTAL + 1))
if grep -q 'searchParams.get("search")' pages/next-app/functions/api/materials.ts; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 8: Validate boq.ts joins boq_items table
echo -n "Testing boq.ts queries boq_items... "
TOTAL=$((TOTAL + 1))
if grep -q "boq_items" pages/next-app/functions/api/boq.ts; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 9: Validate boq.ts has project parameter handling
echo -n "Testing boq.ts project parameter handling... "
TOTAL=$((TOTAL + 1))
if grep -q 'searchParams.get("project")' pages/next-app/functions/api/boq.ts; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 10: Validate boq.ts calculates line_total
echo -n "Testing boq.ts line_total calculation... "
TOTAL=$((TOTAL + 1))
if grep -q "line_total" pages/next-app/functions/api/boq.ts; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 11: Validate quotes.ts queries quotes table
echo -n "Testing quotes.ts queries quotes table... "
TOTAL=$((TOTAL + 1))
if grep -q "FROM quotes" pages/next-app/functions/api/quotes.ts; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 12: Validate quotes.ts has project parameter handling
echo -n "Testing quotes.ts project parameter handling... "
TOTAL=$((TOTAL + 1))
if grep -q 'searchParams.get("project")' pages/next-app/functions/api/quotes.ts; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 13: Validate quotes.ts orders by version DESC
echo -n "Testing quotes.ts version ordering... "
TOTAL=$((TOTAL + 1))
if grep -q "ORDER BY.*version DESC" pages/next-app/functions/api/quotes.ts; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 14: Validate all files have error handling
echo -n "Testing error handling in all files... "
TOTAL=$((TOTAL + 1))
ERRORS=0
for file in pages/next-app/functions/api/*.ts; do
  if ! grep -q "catch.*err" "$file"; then
    ERRORS=$((ERRORS + 1))
  fi
done
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 15: Validate all files return JSON responses
echo -n "Testing JSON response format in all files... "
TOTAL=$((TOTAL + 1))
ERRORS=0
for file in pages/next-app/functions/api/*.ts; do
  if ! grep -q "application/json" "$file"; then
    ERRORS=$((ERRORS + 1))
  fi
done
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Summary
echo ""
echo "========================================="
echo "Test Results: ${PASSED}/${TOTAL} passed"
echo "========================================="

if [ $PASSED -eq $TOTAL ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  echo ""
  echo "API endpoints created successfully:"
  echo "  • /api/materials - Materials search endpoint"
  echo "  • /api/boq - BOQ retrieval endpoint"
  echo "  • /api/quotes - Quote retrieval endpoint"
  exit 0
else
  echo -e "${RED}❌ Some tests failed.${NC}"
  exit 1
fi
