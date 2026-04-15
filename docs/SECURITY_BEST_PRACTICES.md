# 🔐 Security Best Practices - MONTIO

**Ako chrániť credentials a predchádzať security incidentom**

---

## 🚨 ČO NIKDY NECOMMITOVAŤ

### ❌ Zakázané súbory:
```
ENV_FILE_PRODUCTION.txt
*_PRODUCTION.txt
*_PROD.txt
credentials.txt
secrets.txt
passwords.txt
.env.production
.env.prod
*.pem
*.key (private keys)
```

### ❌ Zakázaný obsah:
```bash
# Heslá
password=moje-heslo
DB_PASSWORD=secretpass123

# API kľúče
API_KEY=sk_live_abc123xyz
STRIPE_SECRET_KEY=rk_live_...

# Tokeny
AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GITHUB_TOKEN=ghp_abc123xyz...

# Private keys
-----BEGIN RSA PRIVATE KEY-----
-----BEGIN PRIVATE KEY-----
```

---

## ✅ SPRÁVNY POSTUP

### 1. Environment Variables (Lokálny vývoj)

**backend/.env** (NIKDY NEcommituj!)
```env
PORT=3001
DB_HOST=localhost
DB_USER=u46895_montio
DB_PASSWORD=your-secret-password
JWT_SECRET=your-jwt-secret
SMTP_PASSWORD=your-smtp-password
```

**backend/.env.example** (Commitni ako template)
```env
PORT=3001
DB_HOST=localhost
DB_USER=your-db-user
DB_PASSWORD=your-db-password-here
JWT_SECRET=your-jwt-secret-here
SMTP_PASSWORD=your-smtp-password-here
```

### 2. Production Deployment (Hostcreator)

**Nikdy necommituj production credentials!**

Namiesto toho:
1. Prihlás sa do Hostcreator
2. Docker Containers → Tvoj kontajner → Settings
3. ENV_FILE variable (priamo v UI)
4. Vlož credentials tam

```env
# Toto daj do Hostcreator ENV_FILE (nie do GitHubu!)
PORT=3001
DB_HOST=sql14.hostcreators.sk
DB_PASSWORD=production-secret-here
SMTP_PASSWORD=production-smtp-here
```

### 3. Dokumentácia (Bezpečne)

**docs/SMTP_SETUP.md** - Dokumentuj POSTUP, nie HESLÁ
```markdown
## SMTP Configuration

1. Login to Hostcreator email admin
2. Create email: montio@tsdigital.sk
3. Generate strong password (20+ chars)
4. Add to Hostcreator ENV_FILE:
   - SMTP_USER=montio@tsdigital.sk
   - SMTP_PASSWORD=your-generated-password
```

**NIKDY:**
```markdown
❌ SMTP_PASSWORD=actual-real-password-12345
❌ DB_PASSWORD=my-secret-database-password
```

---

## 🛡️ Pre-commit Hook (Automatická ochrana)

**Čo robí:**
- ✅ Skenuje všetky súbory pred commitom
- ✅ Hľadá vzory: password=, secret=, api_key=, token=
- ✅ Blokuje commity so zakazanými súbormi
- ✅ Upozorní ťa kde presne je problém
- ✅ Maskuje heslá v outpute

**Už je nainštalovaný:** `.git/hooks/pre-commit`

**Test:**
```bash
# Vyskúšaj commitnúť súbor s heslom
echo "DB_PASSWORD=secret123" > test_secret.txt
git add test_secret.txt
git commit -m "test"

# Output:
# ❌ BLOCKED: Potential secret found in: test_secret.txt
# Pattern matched: DB_PASSWORD\s*=\s*[^[:space:]]+
```

**Bypass (iba v núdzi):**
```bash
git commit --no-verify
# ⚠️ Použiť iba ak si 100% istý!
```

---

## 🔄 Ako zdieľať credentials v tíme

### ❌ NEPOUŽÍVAŤ:
- Email
- Slack
- GitHub commits
- Shared documents

### ✅ POUŽIŤ:
1. **Password Manager:**
   - 1Password
   - Bitwarden
   - LastPass

2. **Secure sharing services:**
   - https://onetimesecret.com/
   - https://privnote.com/

3. **Encrypted files:**
   - GPG encrypted .env
   - Vault (HashiCorp)

---

## 🚨 Incident Response Plan

### Ak omylom commitneš secrets:

1. **STOP - nepushuj na GitHub**
   ```bash
   git reset --soft HEAD~1  # Vráť posledný commit
   ```

2. **Už pushnuté? OKAMŽITE:**
   - Zmeň všetky exponované credentials
   - Aktualizuj production ENV_FILE
   - Reštartuj services
   - Vymaž súbor: `git rm --cached sensitive_file.txt`
   - Commit a push

3. **Git história obsahuje secrets:**
   - Zmeň credentials (staré nebudú fungovať)
   - Dokumentuj incident (SECURITY_INCIDENT.md)
   - Zvážiť BFG Repo-Cleaner (iba ak kritické)

4. **Notifikuj tím:**
   - Čo sa stalo
   - Aké credentials boli exponované
   - Že boli zmenené
   - Lessons learned

---

## 📋 Security Checklist

**Pred každým commitom:**
- [ ] Žiadne .env súbory (okrem .env.example)
- [ ] Žiadne *_PRODUCTION.txt súbory
- [ ] Žiadne hardcoded passwords v kóde
- [ ] Žiadne API keys v kóde
- [ ] Žiadne DB credentials v kóde
- [ ] Pre-commit hook je aktívny

**Pri deploy na production:**
- [ ] Credentials iba v Hostcreator ENV_FILE
- [ ] Silné heslá (20+ chars)
- [ ] Rôzne heslá pre dev/staging/prod
- [ ] HTTPS pre všetky API calls
- [ ] JWT secret je náhodný a silný

**Pravidelne (raz za 3 mesiace):**
- [ ] Rotate all production passwords
- [ ] Audit .gitignore
- [ ] Check pre nové dependencie s vulnerabilities
- [ ] Review access logs

---

## 🎓 Tipy pre bezpečnosť

1. **Silné heslá:**
   ```bash
   # Generovanie náhodného hesla
   openssl rand -base64 32
   # Output: kR9mN2vL8pQ7tS3wX6yZ1aB4cD5eF0gH1iJ2kL3mN4o=
   ```

2. **JWT Secret:**
   ```bash
   # Použiť minimum 256-bit random string
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Environment detection:**
   ```javascript
   // V kóde detekuj prostredie
   const isProduction = process.env.NODE_ENV === 'production'
   
   if (isProduction) {
     // Use production SMTP
   } else {
     // Console.log only
   }
   ```

4. **Git secrets scan:**
   ```bash
   # Pred pushom skenuj celý repo
   git secrets --scan -r
   ```

---

## 📚 Resources

- **git-secrets:** https://github.com/awslabs/git-secrets
- **BFG Repo-Cleaner:** https://rtyley.github.io/bfg-repo-cleaner/
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **GitHub Security:** https://docs.github.com/en/code-security

---

## 💡 Remember

> **"The best way to keep a secret is to never have it in the first place."**
> - Use environment variables
> - Never commit credentials
> - Rotate passwords regularly
> - Trust but verify (pre-commit hooks)

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-15  
**Author:** MONTIO Security Team
