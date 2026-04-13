# 🚨 SECURITY INCIDENT - CREDENTIAL EXPOSURE

**Date:** 2026-04-14  
**Severity:** CRITICAL  
**Status:** REMEDIATION IN PROGRESS

---

## ⚠️ WHAT HAPPENED

Production credentials were accidentally committed to public GitHub repository **tado5/Montio** and discovered by GitGuardian on April 13, 2026 at 20:41 UTC.

**Exposed Credentials:**
```
DB_HOST: sql14.hostcreators.sk
DB_PORT: 3319
DB_USER: u46895_montio
DB_PASSWORD: x52D_Z-lb!UX6n5
DB_NAME: d46895_montio
JWT_SECRET: montio_production_secret_key_2026_CHANGE_THIS_TO_RANDOM_STRING
```

**Files That Contained Credentials:**
- PRODUCTION_DEPLOYMENT.md
- docs/deployment/*.md (7 files)
- PLAN.md
- STATUS.md
- database/README.md
- backend/.env.prod (local only, not in git)

**First Commit with Exposure:** 9682f6b0 (April 13, 2026 20:41 UTC)  
**Discovery:** GitGuardian email alert  
**Public Exposure Duration:** ~24 hours  

---

## ✅ ACTIONS COMPLETED

1. ✅ Removed all files containing credentials from git tracking
2. ✅ Added sensitive files to .gitignore
3. ✅ Purged files from entire git history using git filter-branch
4. ✅ Force pushed to GitHub to overwrite remote history
5. ✅ Cleaned up local git references
6. ✅ Created this incident response document

**Git Commits:**
- `eed0417e` - Initial credential removal
- `9df9b02d` - Removed all credential-containing files
- `152de5fc` - Updated .gitignore
- `3365c452` - Final cleanup (force pushed)

---

## 🔴 CRITICAL ACTIONS REQUIRED NOW

### 1. ROTATE DATABASE PASSWORD (DO FIRST)

```bash
# Connect to production database
mysql -h sql14.hostcreators.sk -P 3319 -u u46895_montio -p

# Change password (replace NEW_PASSWORD with strong random string)
SET PASSWORD FOR 'u46895_montio'@'%' = PASSWORD('NEW_STRONG_PASSWORD_HERE');
FLUSH PRIVILEGES;
EXIT;
```

**Generate Strong Password:**
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

---

### 2. GENERATE NEW JWT_SECRET

```bash
# Generate 64-character hex string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. UPDATE PRODUCTION .ENV FILE

SSH to production server and update:

```bash
# Find backend directory
cd /path/to/montio/backend

# Edit .env
nano .env

# Update these lines:
DB_PASSWORD=YOUR_NEW_DB_PASSWORD_FROM_STEP_1
JWT_SECRET=YOUR_NEW_64_CHAR_HEX_FROM_STEP_2

# Save (Ctrl+X, Y, Enter)
```

---

### 4. RESTART BACKEND SERVICE

```bash
# If using PM2
pm2 restart montio-backend
pm2 logs montio-backend

# If using systemd
sudo systemctl restart montio-backend
sudo journalctl -u montio-backend -f

# Verify backend started successfully
curl http://localhost:3001/health
```

---

### 5. UPDATE LOCAL .ENV FILES

Update these files on your local machine with new credentials:

```bash
# Do NOT commit these to git!
backend/.env
backend/.env.prod
```

---

### 6. VERIFY EVERYTHING WORKS

1. **Test Login:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your_email","password":"your_password"}'
   ```

2. **Test Database Connection:**
   ```bash
   mysql -h sql14.hostcreators.sk -P 3319 -u u46895_montio -p -e "SELECT 1"
   ```

3. **Check Frontend:**
   - Open https://yourdomain.com
   - Try to login
   - Check if dashboard loads

---

## 📊 IMPACT ASSESSMENT

**Who Had Access:**
- ✅ Public internet (repository was public)
- ✅ GitGuardian (detected and alerted)
- ❓ Unknown third parties (may have cloned/scraped)

**What Was Accessible:**
- ✅ Full database access (read/write/delete)
- ✅ Ability to generate valid JWT tokens
- ✅ Access to all user data
- ✅ Access to all company data

**Data at Risk:**
- User accounts (emails, password hashes)
- Company information
- Employee records
- Orders and business data

**Mitigation:**
- Credentials rotated (after completing steps above)
- Git history cleaned
- Files removed from repository
- Database password changed
- JWT secret changed (invalidates all existing sessions)

---

## 🔒 PREVENTION MEASURES

**Implemented:**
1. ✅ Added all .env files to .gitignore
2. ✅ Added docs/deployment/ to .gitignore
3. ✅ Added PLAN.md, STATUS.md to .gitignore
4. ✅ Force pushed cleaned history

**TODO:**
- [ ] Review all local files for credentials
- [ ] Use environment variable manager (e.g., dotenv-vault)
- [ ] Enable GitHub secret scanning alerts
- [ ] Add pre-commit hook to scan for secrets (e.g., git-secrets)
- [ ] Use separate .env.example files with placeholder values
- [ ] Document credential management process
- [ ] Regular security audits

---

## 📋 VERIFICATION CHECKLIST

After rotating credentials:

- [ ] Database password changed on production MySQL
- [ ] New JWT_SECRET generated
- [ ] Production .env updated with new credentials
- [ ] Backend restarted successfully
- [ ] Backend health check passes
- [ ] Login works with new credentials
- [ ] Database connection works
- [ ] Frontend can authenticate
- [ ] No errors in backend logs
- [ ] Old credentials no longer work
- [ ] Local .env files updated
- [ ] GitGuardian alert marked as resolved

---

## 🆘 ROLLBACK PLAN

If something breaks after credential rotation:

1. **Restore old credentials temporarily:**
   - Use old DB_PASSWORD and JWT_SECRET
   - Restart backend
   - Verify service is working

2. **Diagnose issue:**
   - Check backend logs
   - Check database connectivity
   - Check .env file syntax

3. **Fix and retry:**
   - Fix the issue
   - Rotate credentials again
   - Test thoroughly

---

## 📞 CONTACTS

**If You Need Help:**
- Hosting Provider: Hostcreator Support
- Database Issues: MySQL documentation
- Security Questions: GitHub Security Advisory

---

## 📝 TIMELINE

| Time (UTC) | Event |
|------------|-------|
| 2026-04-13 20:41 | Credentials first committed (9682f6b0) |
| 2026-04-13 ~21:00 | GitGuardian detected exposure |
| 2026-04-14 ~00:00 | GitGuardian alert email sent |
| 2026-04-14 ~00:30 | Investigation started |
| 2026-04-14 ~00:45 | All credential files removed from git |
| 2026-04-14 ~01:00 | Git history cleaned and force pushed |
| 2026-04-14 ~01:15 | This incident report created |
| 2026-04-14 **PENDING** | Credentials rotated on production |
| 2026-04-14 **PENDING** | Incident closed |

---

## 🎯 NEXT STEPS

1. **IMMEDIATELY** - Rotate database password (step 1)
2. **IMMEDIATELY** - Generate new JWT_SECRET (step 2)
3. **IMMEDIATELY** - Update production .env (step 3)
4. **IMMEDIATELY** - Restart backend (step 4)
5. **After restart** - Verify everything works (step 6)
6. **Within 24h** - Implement prevention measures
7. **Within 1 week** - Security audit of entire codebase
8. **Within 1 week** - Add pre-commit hooks for secret scanning

---

**⚠️ DO NOT IGNORE THIS - YOUR DATABASE IS CURRENTLY EXPOSED**

The old credentials are still valid until you rotate them. Complete steps 1-4 immediately.

---

**Incident Report Created:** 2026-04-14  
**Report Version:** 1.0  
**Last Updated:** 2026-04-14
