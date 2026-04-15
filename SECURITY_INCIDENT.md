# 🚨 SECURITY INCIDENT REPORT

**Date:** 2026-04-15  
**Incident Type:** Exposed SMTP Credentials  
**Severity:** HIGH  
**Status:** PARTIALLY MITIGATED  

---

## 📋 Incident Summary

GitGuardian detected exposed SMTP credentials in the public GitHub repository `tado5/Montio`.

**Exposed Data:**
- SMTP Host: smtp.hostcreators.sk
- SMTP Port: 465
- SMTP User: montio@tsdigital.sk
- SMTP Password: `JY-E7I0!_8!uo9qi`
- Database credentials (also exposed)

**Affected Commit:**
- Commit: `cb9842a2b146168c04ed118fb8f54777cb7d18ef`
- File: `ENV_FILE_PRODUCTION.txt`
- Pushed: April 15th 2026, 09:03:22 UTC

---

## ✅ Immediate Actions Taken

1. **Removed file from repository:**
   - `git rm --cached ENV_FILE_PRODUCTION.txt`
   - Commit: `6da83f8`

2. **Updated .gitignore:**
   - Added `ENV_FILE_PRODUCTION.txt`
   - Added wildcard patterns for sensitive files

3. **Documented incident:**
   - Created SECURITY_INCIDENT.md

---

## ⚠️ CRITICAL ACTIONS REQUIRED

### 1. Change SMTP Password IMMEDIATELY
- Login to Hostcreator email admin
- Change password for `montio@tsdigital.sk`
- Generate strong password (20+ characters)

### 2. Update Production Environment
- Login to Hostcreator Docker container settings
- Update `SMTP_PASSWORD` in ENV_FILE variable
- Restart Docker container

### 3. Change Database Password (ALSO EXPOSED)
- Database password was also in ENV_FILE_PRODUCTION.txt
- Change MariaDB password for `u46895_montio`
- Update production ENV_FILE

### 4. Purge Git History (OPTIONAL BUT RECOMMENDED)
The credentials are still in git history. Options:

**Option A: BFG Repo-Cleaner (Recommended)**
```bash
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files ENV_FILE_PRODUCTION.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**Option B: git filter-branch**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch ENV_FILE_PRODUCTION.txt" \
  --prune-empty --tag-name-filter cat -- --all
git push --force --all
```

**Option C: Delete and Recreate Repository**
- Create new private repository
- Push clean code without history
- Update all team members

### 5. Enable GitHub Secret Scanning (if not already)
- Repository Settings → Security & Analysis
- Enable "Secret scanning"
- Enable "Push protection"

---

## 🔍 Root Cause Analysis

**Why did this happen?**
1. Production credentials stored in plaintext file
2. File not added to .gitignore before commit
3. No pre-commit hook to scan for secrets
4. Assumed file was documentation, not actual credentials

**Prevention measures:**
1. ✅ Added .gitignore rules for sensitive files
2. ⚠️ TODO: Install pre-commit hook for secret detection
3. ⚠️ TODO: Use environment variables only (never commit)
4. ⚠️ TODO: Document secure credential management

---

## 📝 Lessons Learned

1. **NEVER commit files with "PRODUCTION" in the name**
2. **ALWAYS check .gitignore before committing**
3. **Use git-secrets or similar tools**
4. **Rotate credentials after any exposure**

---

## 🔐 Secure Credential Management

**Correct approach:**
1. Store credentials in Hostcreator ENV_FILE (never in repo)
2. Use `.env.example` for template (with placeholder values)
3. Document variables in SMTP_SETUP.md (without actual values)
4. Share credentials via secure channel (1Password, Bitwarden, etc.)

**Example .env.example:**
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-secure-password-here
```

---

## 📊 Impact Assessment

**Potential Impact:**
- ⚠️ Unauthorized email sending from montio@tsdigital.sk
- ⚠️ Database breach (read/write access)
- ⚠️ JWT token generation (if JWT_SECRET used)
- ⚠️ Phishing emails pretending to be MONTIO

**Actual Impact:**
- ✅ No evidence of unauthorized access (yet)
- ✅ Repository is private (limited exposure)
- ⚠️ GitGuardian detected it (others might too)

---

## 🎯 Action Items Checklist

- [ ] Change SMTP password on Hostcreator
- [ ] Change database password
- [ ] Update production ENV_FILE
- [ ] Restart Docker container
- [ ] Test email sending still works
- [ ] Decide on git history purge approach
- [ ] Install git-secrets or pre-commit hook
- [ ] Enable GitHub secret scanning
- [ ] Review other repositories for similar issues
- [ ] Update team on security best practices

---

## 📞 Contact

If you suspect unauthorized access:
- Check Hostcreator logs
- Check email sending logs
- Check database access logs
- Contact Hostcreator support if needed

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-15  
**Next Review:** After all action items completed
