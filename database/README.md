# Databáza Setup

## Pripojenie k MariaDB

### Cez terminál (lokálne):
```bash
mysql -u u46895_montio -p -h localhost d46895_montio
```

Heslo: `QH4!d!9F!0cL6mt.`

### Cez phpMyAdmin (ak máš na hostingu):
1. Prihlás sa do phpMyAdmin
2. Vyber databázu `d46895_montio`
3. Klikni na "Import" alebo "SQL" tab

## Spustenie schémy

### Možnosť 1: Import súboru (odporúčané)
```bash
mysql -u u46895_montio -p -h localhost d46895_montio < database/schema.sql
```

### Možnosť 2: Cez MySQL klienta
```bash
# Pripoj sa k databáze
mysql -u u46895_montio -p -h localhost d46895_montio

# V MySQL konzole spusti
source /Users/A62284823/Desktop/TSDigital/Montio/Montio/database/schema.sql
```

### Možnosť 3: Cez phpMyAdmin
1. Otvor `database/schema.sql` v textovom editore
2. Skopíruj celý obsah
3. Vlož do SQL tabu v phpMyAdmin
4. Klikni "Vykonať" / "Execute"

## Overenie

Po spustení schémy over, či sa všetko vytvorilo:

```sql
-- Zobrazenie všetkých tabuliek
SHOW TABLES;

-- Overenie štruktúry
DESCRIBE users;
DESCRIBE companies;
DESCRIBE orders;
DESCRIBE invoices;

-- Overenie super admin účtu
SELECT * FROM users WHERE role = 'superadmin';
```

## Super Admin prihlásenie

Po vytvorení databázy sa môžeš prihlásiť:

- **Email:** `admin@montio.sk`
- **Heslo:** `admin123`

⚠️ **DÔLEŽITÉ:** Po prvom prihlásení si zmeň heslo!

## Testovacia firma

V databáze je vytvorená testovacia firma:
- **Názov:** Test Montáže s.r.o.
- **Invite token:** `test-invite-token-12345`
- **Status:** pending (čaká na registráciu)

Tento token môžeš použiť na testovanie registrácie novej firmy.

## Čo obsahuje init.sql?

✅ 8 tabuliek:
- `companies` - Firmy
- `users` - Používatelia
- `order_types` - Typy montáží
- `employees` - Zamestnanci
- `orders` - Zákazky
- `order_stages` - Etapy zákaziek (obhliadka, ponuka, montáž)
- `invoices` - Faktúry
- **`activity_logs`** - **Audit trail (logging všetkých akcií)**

✅ Super admin účet
✅ Testovacia firma pre vývoj
✅ Testovacie účty (superadmin, companyadmin, employee)
✅ Foreign keys a indexy
✅ UTF-8 encoding

---

## 📋 Activity Logging System

### Účel
- **Debugging:** Sledovanie chýb a problémov
- **Bezpečnosť:** Audit používateľských akcií
- **Compliance:** Právne požiadavky na evidenciu
- **Analytika:** Analýza správania používateľov

### Logované akcie
| Akcia | Popis |
|-------|-------|
| `user.login` | Prihlásenie používateľa |
| `user.logout` | Odhlásenie používateľa |
| `company.create` | Vytvorenie firmy |
| `company.update` | Úprava firmy |
| `order.create` | Vytvorenie zákazky |
| `order.update` | Úprava zákazky |
| `order.complete` | Dokončenie zákazky |
| `invoice.create` | Vytvorenie faktúry |
| `invoice.paid` | Zaplatenie faktúry |
| `employee.create` | Pridanie zamestnanca |
| `employee.update` | Úprava zamestnanca |
| `settings.update` | Zmena nastavení |

### Kde to vidím?
- Super Admin: `/superadmin/company/:id` - Detail firmy zobrazuje posledných 50 logov
- Activity log tabuľka s IP adresou, časom, používateľom a akciou

### Štruktúra logu
```json
{
  "user_id": 1,
  "company_id": 5,
  "action": "order.create",
  "entity_type": "order",
  "entity_id": 42,
  "details": {"order_number": "MONTIO-2026-001"},
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2026-03-15 14:30:00"
}
```

## Problémy?

### Chyba: "Access denied"
- Over prihlasovacie údaje
- Over, že máš prístup k databáze

### Chyba: "Database does not exist"
- Over názov databázy: `d46895_montio`
- Možno potrebuješ vytvoriť databázu najprv

### Chyba: "Table already exists"
- Schéma má DROP TABLE príkazy, ale ak zlyhajú:
```sql
DROP DATABASE IF EXISTS d46895_montio;
CREATE DATABASE d46895_montio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Ďalší krok

Po úspešnom vytvorení databázy:
1. Spusti backend: `cd backend && npm install && npm run dev`
2. Spusti frontend: `cd frontend && npm install && npm run dev`
3. Prihlás sa ako super admin: `admin@montio.sk` / `admin123`
