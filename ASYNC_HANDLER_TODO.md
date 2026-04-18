# AsyncHandler Migration TODO

## Priority: HIGH - Security & Stability

All routes MUST use `asyncHandler` to properly catch and handle database errors.

---

## ✅ COMPLETED

### backend/routes/orders.js
- ✅ All routes already use asyncHandler

### backend/routes/auth.js  
- ✅ `/register` - Fixed (added asyncHandler, kept ER_DUP_ENTRY handling)
- ✅ `/login` - Already had asyncHandler

---

## 🔴 TODO - backend/routes/auth.js (6 routes remaining)

```javascript
// Line 200
router.get('/companies', verifyToken, requireRole('superadmin'), async (req, res) => {
// ❌ Change to:
router.get('/companies', verifyToken, requireRole('superadmin'), asyncHandler(async (req, res) => {
// Remove try-catch, change }); to }));

// Line 215
router.put('/theme', verifyToken, async (req, res) => {
// ❌ Same pattern

// Line 252
router.get('/profile', verifyToken, async (req, res) => {
// ❌ Same pattern

// Line 291
router.put('/profile', verifyToken, async (req, res) => {
// ❌ Same pattern

// Line 351
router.put('/profile/password', verifyToken, async (req, res) => {
// ❌ Same pattern

// Line 414
router.put('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
// ❌ Same pattern

// Line 497
router.delete('/avatar', verifyToken, async (req, res) => {
// ❌ Same pattern
```

---

## 🔴 TODO - backend/routes/companies.js (All routes)

```bash
grep -n "^router\." backend/routes/companies.js | grep -v "asyncHandler"
```

Estimated: ~8-10 routes

---

## 🔴 TODO - backend/routes/jobPositions.js (All routes)

```bash
grep -n "^router\." backend/routes/jobPositions.js | grep -v "asyncHandler"
```

Estimated: ~5 routes

---

## 🔴 TODO - backend/routes/notifications.js (All routes)

```bash
grep -n "^router\." backend/routes/notifications.js | grep -v "asyncHandler"
```

Estimated: ~5 routes

---

## 🔴 TODO - backend/routes/onboarding.js (All routes)

```bash
grep -n "^router\." backend/routes/onboarding.js | grep -v "asyncHandler"
```

Estimated: ~5 routes

---

## Migration Pattern

### Before:
```javascript
router.post('/path', middleware, async (req, res) => {
  try {
    const [result] = await pool.query('...');
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});
```

### After:
```javascript
router.post('/path', middleware, asyncHandler(async (req, res) => {
  const [result] = await pool.query('...');
  res.json({ success: true });
  // asyncHandler catches errors automatically
}));
```

### Special Cases (keep try-catch for specific error codes):
```javascript
router.post('/register', asyncHandler(async (req, res) => {
  try {
    const [result] = await pool.query('INSERT ...');
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email už existuje.' });
    }
    throw error; // Re-throw to asyncHandler
  }
}));
```

---

## Testing After Migration

```bash
# Run all tests
npm run test

# Check for unhandled rejections
grep -r "UnhandledPromiseRejection" backend/logs/

# Test specific scenarios:
# 1. DB connection lost → Should return 500
# 2. Invalid FK → Should return 400/404
# 3. Duplicate key → Should return 400
# 4. Permission denied → Should return 403
```

---

## Estimated Time: 2-3 hours
## Risk: Low (improves error handling)
## Impact: HIGH (prevents silent failures + server crashes)
