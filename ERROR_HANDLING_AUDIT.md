# Error Handling Audit Report

## Critical Issues Found (Silent Failures)

### ✅ FIXED: Activity Logs - user_id NOT NULL
**File:** `backend/middleware/logger.js:40-43`
**Issue:** Prehltával DB error pri `user_id = NULL`
**Impact:** Client signature sa nevytvárala v activity_logs
**Fix:** Changed DB schema `user_id INT NULL` + Migration 004

---

## Acceptable Silent Failures (By Design)

### 1. Email Sending
**File:** `backend/utils/sendEmail.js:176-180`
**Reason:** Email je supplementárny - aplikácia by mala fungovať aj bez emailov
**Status:** ✅ OK - vracia `{ success: false }` pre handling

### 2. Logo Upload (Onboarding Step 2)
**File:** `backend/routes/onboarding.js:152-156`
**Reason:** Logo je voliteľné, onboarding môže pokračovať bez neho
**Status:** ✅ OK - `logoUrl = null` a pokračuje

### 3. JSON Parsing (Optional Fields)
**File:** `backend/routes/orders.js:58-60`
**Reason:** `contact_data` je voliteľné, aplikácia funguje aj bez parsed phone
**Status:** ✅ OK - nastaví `null` a pokračuje

### 4. File Operations
**File:** `backend/utils/errorHandler.js:61-65`
**Reason:** Utility function pre nepovinné file operácie
**Status:** ✅ OK - vracia `null` pre handling

---

## Recommendations

### 🔴 HIGH PRIORITY - Check ALL DB Operations

Search for patterns:
```javascript
await pool.query(...)  // without try-catch in asyncHandler
```

**Action:** All DB operations MUST be in `asyncHandler` or have explicit error handling

### 🟡 MEDIUM PRIORITY - Check Foreign Key Operations

Files to review:
- `backend/routes/orders.js` - Order creation, stage creation
- `backend/routes/employees.js` - Employee assignment
- `backend/routes/companies.js` - Company deletion cascade

**Action:** Ensure FK violations are caught and returned as 400/409

### 🟢 LOW PRIORITY - Add Error Tracking

**Recommendation:** Add error tracking service (Sentry, LogRocket)
- Track all `console.error()` calls
- Alert on critical failures
- Monitor DB constraint violations

---

## Testing Checklist

- [ ] Create order with invalid `order_type_id` → Should return 400
- [ ] Assign non-existent employee → Should return 404
- [ ] Delete company with active orders → Should return 400
- [ ] Client signature with NULL user_id → Should work ✅ (FIXED)
- [ ] Upload invalid image format → Should return 400
- [ ] Send email with invalid SMTP → Should continue with `success: false`

---

## Files Audited

- ✅ `backend/middleware/logger.js`
- ✅ `backend/middleware/auth.js`
- ✅ `backend/utils/sendEmail.js`
- ✅ `backend/utils/errorHandler.js`
- ✅ `backend/routes/onboarding.js`
- ✅ `backend/routes/orders.js`
- ✅ `backend/routes/auth.js`
- ✅ `backend/routes/companies.js`
- ✅ `backend/routes/employees.js`

---

## Summary

**Total Silent Failures Found:** 1 critical (FIXED)
**Acceptable Silent Failures:** 4 (by design)
**Status:** ✅ All critical issues resolved
