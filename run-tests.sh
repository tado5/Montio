#!/bin/bash

# MONTIO Testing Suite
# Run all backend + E2E tests

echo "🧪 MONTIO - Complete Testing Suite"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track test results
BACKEND_PASS=0
E2E_PASS=0

# ==================== BACKEND TESTS ====================
echo -e "${YELLOW}📦 Running Backend API Tests...${NC}"
echo ""

cd backend
npm test -- --verbose

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend tests PASSED${NC}"
  BACKEND_PASS=1
else
  echo -e "${RED}❌ Backend tests FAILED${NC}"
fi

cd ..
echo ""
echo "===================================="
echo ""

# ==================== E2E TESTS ====================
echo -e "${YELLOW}🌐 Running E2E Tests (Playwright)...${NC}"
echo ""

cd frontend
npx playwright test

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ E2E tests PASSED${NC}"
  E2E_PASS=1
else
  echo -e "${RED}❌ E2E tests FAILED${NC}"
fi

cd ..
echo ""
echo "===================================="
echo ""

# ==================== SUMMARY ====================
echo "📊 Test Summary:"
echo ""

if [ $BACKEND_PASS -eq 1 ]; then
  echo -e "  ${GREEN}✅ Backend API Tests${NC}"
else
  echo -e "  ${RED}❌ Backend API Tests${NC}"
fi

if [ $E2E_PASS -eq 1 ]; then
  echo -e "  ${GREEN}✅ E2E Tests${NC}"
else
  echo -e "  ${RED}❌ E2E Tests${NC}"
fi

echo ""

if [ $BACKEND_PASS -eq 1 ] && [ $E2E_PASS -eq 1 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
  exit 1
fi
