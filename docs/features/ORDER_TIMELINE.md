# Order Timeline / Logging System 📝

**Účel:** Transparentná história zákazky viditeľná pre všetkých zainteresovaných.

**Verzia:** Plánované pre FÁZU 5  
**Status:** 🔲 Nie je implementované

---

## 🎯 Cieľ

Každá zákazka má svoju **timeline** - históriu všetkých akcií, ktoré sa na nej udiali.

**Princíp: KTO? ČO? KEDY?**

- **KTO** - Ktorý používateľ vykonal akciu (alebo systém)
- **ČO** - Aká akcia sa vykonala (obhliadka, ponuka, montáž...)
- **KEDY** - Presný dátum a čas

---

## 🗄️ Databázová tabuľka

```sql
CREATE TABLE `order_timeline` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `user_id` INT NULL,                    -- Kto vykonal akciu (NULL ak systém)
  `action_type` VARCHAR(50) NOT NULL,    -- Typ akcie (survey_created, quote_sent, ...)
  `action_title` VARCHAR(255) NOT NULL,  -- Názov akcie pre zobrazenie
  `action_details` JSON NULL,            -- Detaily akcie (ceny, fotky, PDFs)
  `visible_to_client` BOOLEAN DEFAULT TRUE,  -- Viditeľné klientovi?
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 📋 Typy akcií (action_type)

### Základné akcie
- `order_created` - Zákazka vytvorená
- `order_updated` - Zákazka upravená
- `order_cancelled` - Zákazka zrušená
- `status_changed` - Zmena statusu

### Obhliadka
- `survey_scheduled` - Obhliadka naplánovaná
- `survey_started` - Obhliadka začala
- `survey_completed` - Obhliadka dokončená
- `survey_photos_uploaded` - Fotky nahrané

### Cenová ponuka
- `quote_generated` - Ponuka vygenerovaná
- `quote_sent` - Ponuka odoslaná klientovi
- `quote_viewed` - Ponuka zobrazená klientom
- `quote_accepted` - Ponuka akceptovaná
- `quote_rejected` - Ponuka zamietnutá
- `quote_expired` - Ponuka expirovala

### Priradenie a plánovanie
- `employee_assigned` - Priradený zamestnanec
- `employee_changed` - Zmena zamestnanca
- `installation_scheduled` - Montáž naplánovaná
- `installation_rescheduled` - Montáž preložená

### Montáž
- `installation_started` - Montáž začala
- `installation_in_progress` - Montáž prebieha
- `installation_paused` - Montáž pozastavená
- `installation_completed` - Montáž dokončená
- `installation_photos_uploaded` - Fotky z montáže
- `checklist_completed` - Checklist dokončený

### Dokumenty a faktúry
- `document_generated` - Dokument vygenerovaný
- `document_signed` - Dokument podpísaný
- `invoice_generated` - Faktúra vytvorená
- `invoice_sent` - Faktúra odoslaná
- `payment_received` - Platba prijatá
- `payment_reminder_sent` - Upomienka odoslaná

### Komunikácia
- `note_added` - Pridaná poznámka
- `comment_added` - Pridaný komentár
- `email_sent` - Email odoslaný
- `sms_sent` - SMS odoslaná
- `client_contacted` - Klient kontaktovaný

---

## 📊 Čo sa loguje (action_details JSON)

```json
{
  "user_name": "Ján Novák",
  "user_role": "employee",
  "user_email": "jan.novak@firma.sk",
  "changes": {
    "status": {
      "from": "assigned",
      "to": "in_progress"
    },
    "price": {
      "materials": 850.00,
      "labor": 300.00,
      "total": 1150.00,
      "vat": 230.00,
      "total_with_vat": 1380.00
    },
    "scheduled_date": {
      "from": "2024-04-15",
      "to": "2024-04-16"
    }
  },
  "photos": [
    "/uploads/orders/123/before_1.jpg",
    "/uploads/orders/123/before_2.jpg"
  ],
  "documents": [
    "/uploads/orders/123/protokol_obhliadka.pdf"
  ],
  "notes": "Klient požaduje nástenné umiestnenie klimatizácie",
  "location": {
    "ip_address": "192.168.1.100",
    "gps": "48.1486, 17.1077"
  },
  "metadata": {
    "device": "mobile",
    "app_version": "1.10.0"
  }
}
```

---

## 👥 Kto čo vidí?

| Akcia | Klient 👤 | Zamestnanec 👷 | Company Admin 🏢 | Super Admin 👑 |
|-------|-----------|----------------|------------------|----------------|
| **Základné** ||||
| Zákazka vytvorená | ✅ | ✅ | ✅ | ✅ |
| Status zmenený | ✅ | ✅ | ✅ | ✅ |
| **Obhliadka** ||||
| Obhliadka naplánovaná | ✅ | ✅ | ✅ | ✅ |
| Fotky nahrané | ✅ | ✅ | ✅ | ✅ |
| Protokol PDF | ✅ | ✅ | ✅ | ✅ |
| **Ponuka** ||||
| Ponuka odoslaná | ✅ | ❌ | ✅ | ✅ |
| Cena (celková) | ✅ | ❌ | ✅ | ✅ |
| Cena (detaily materiálu) | ❌ | ❌ | ✅ | ✅ |
| Marža a náklady | ❌ | ❌ | ✅ | ✅ |
| **Priradenie** ||||
| Priradený zamestnanec (meno) | ✅ | ✅ | ✅ | ✅ |
| Priradený zamestnanec (kontakt) | ❌ | ✅ | ✅ | ✅ |
| Termín montáže | ✅ | ✅ | ✅ | ✅ |
| **Montáž** ||||
| Montáž začala | ✅ | ✅ | ✅ | ✅ |
| Before/After fotky | ✅ | ✅ | ✅ | ✅ |
| Checklist položky | ✅ | ✅ | ✅ | ✅ |
| Interné poznámky | ❌ | ✅ | ✅ | ✅ |
| **Faktúra** ||||
| Faktúra vygenerovaná | ✅ | ❌ | ✅ | ✅ |
| Platba prijatá | ✅ | ❌ | ✅ | ✅ |
| Upomienka odoslaná | ❌ | ❌ | ✅ | ✅ |

**Legenda:**
- ✅ **Vidí** - Užívateľ vidí túto akciu
- ❌ **Nevidí** - Akcia je skrytá

---

## 🔗 Klientský prístup (Public Link)

Každá zákazka má unikátny public link:

```
https://montio.tsdigital.sk/order/status/abc123def456
```

**Vlastnosti:**
- **Bez prihlásenia** - Klient nemusí mať účet
- **Unikátny token** - UUID vygenerovaný pri vytvorení zákazky
- **Bezpečné** - Token je náhodný, nemôže sa uhádnuť
- **Trvalé** - Link je platný počas celého životného cyklu zákazky
- **Read-only** - Klient môže len čítať, nemôže meniť
- **Filtrované** - Vidí len `visible_to_client = TRUE` záznamy

**Zobrazenie pre klienta:**
```
┌─────────────────────────────────────────┐
│  MONTIO - Status Vašej Zákazky          │
│  Číslo: MONT-2024-001                   │
│  Klient: Ján Novák                      │
└─────────────────────────────────────────┘

📅 HISTÓRIA ZÁKAZKY

✅ 13.4.2024 10:00
   Zákazka vytvorená
   Typ: Montáž klimatizácie

✅ 13.4.2024 14:30
   Obhliadka dokončená
   Technik: Ján Novák
   📎 protokol_obhliadka.pdf
   🖼️ 3 fotky

✅ 13.4.2024 15:00
   Cenová ponuka odoslaná
   Cena: 1 250,00 € (s DPH)
   ⏳ Čaká sa na odpoveď

🔵 13.4.2024 16:00
   Ponuka akceptovaná

✅ 14.4.2024 09:00
   Priradený technik: Peter Kováč
   Termín montáže: 16.4.2024 8:00

⏳ 16.4.2024
   Montáž naplánovaná
```

---

## 🔧 Backend API

### GET /api/orders/:id/timeline
Načítanie timeline pre autorizovaných používateľov.

**Params:**
- `id` - ID zákazky

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "order": {
    "id": 123,
    "order_number": "MONT-2024-001",
    "client_name": "Ján Novák",
    "status": "in_progress"
  },
  "timeline": [
    {
      "id": 1,
      "action_type": "order_created",
      "action_title": "Zákazka vytvorená",
      "user_name": "Admin",
      "user_role": "companyadmin",
      "created_at": "2024-04-13T10:00:00Z",
      "details": { ... },
      "visible_to_client": true
    },
    { ... }
  ]
}
```

---

### GET /api/orders/client/:token/timeline
Načítanie timeline pre klienta cez public link.

**Params:**
- `token` - Unikátny UUID token zákazky

**Response:**
```json
{
  "order": {
    "order_number": "MONT-2024-001",
    "client_name": "Ján Novák",
    "status": "in_progress",
    "status_label": "Montáž prebieha"
  },
  "timeline": [
    // Iba visible_to_client = TRUE záznamy
    {
      "action_title": "Zákazka vytvorená",
      "created_at": "2024-04-13T10:00:00Z",
      "details": { ... }
    }
  ]
}
```

---

### POST /api/orders/:id/timeline
Manuálne pridanie záznamu do timeline.

**Body:**
```json
{
  "action_type": "note_added",
  "action_title": "Pridaná poznámka",
  "action_details": {
    "note": "Klient požiadal o preloženie termínu"
  },
  "visible_to_client": false
}
```

---

## 🎨 Frontend Components

### OrderTimeline.jsx
Hlavný komponent pre zobrazenie timeline.

```jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CheckCircle,
  Clock,
  FileText,
  User,
  Image,
  DollarSign
} from 'lucide-react'

const OrderTimeline = ({ orderId, clientToken = null }) => {
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTimeline()
  }, [orderId, clientToken])

  const fetchTimeline = async () => {
    const url = clientToken
      ? `/api/orders/client/${clientToken}/timeline`
      : `/api/orders/${orderId}/timeline`

    const response = await axios.get(url, {
      headers: clientToken ? {} : { Authorization: `Bearer ${token}` }
    })

    setTimeline(response.data.timeline)
    setLoading(false)
  }

  const getIcon = (actionType) => {
    const icons = {
      order_created: CheckCircle,
      survey_completed: Image,
      quote_sent: DollarSign,
      employee_assigned: User,
      // ...
    }
    return icons[actionType] || Clock
  }

  return (
    <div className="space-y-4">
      {timeline.map((item, index) => {
        const Icon = getIcon(item.action_type)
        return (
          <TimelineItem
            key={item.id}
            icon={<Icon />}
            title={item.action_title}
            userName={item.user_name}
            date={formatDate(item.created_at)}
            details={item.details}
            isLast={index === timeline.length - 1}
          />
        )
      })}
    </div>
  )
}
```

---

## 🔄 Automatické logovanie

Každá zmena na zákazke sa automaticky zaloguje cez middleware:

```javascript
// backend/middleware/orderLogger.js
import pool from '../config/db.js';

export const logOrderAction = async (
  orderId,
  userId,
  actionType,
  actionTitle,
  actionDetails = {},
  visibleToClient = true
) => {
  try {
    await pool.query(
      `INSERT INTO order_timeline
       (order_id, user_id, action_type, action_title, action_details, visible_to_client)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, userId, actionType, actionTitle, JSON.stringify(actionDetails), visibleToClient]
    );
  } catch (error) {
    console.error('Order logging error:', error);
  }
};

// Použitie:
await logOrderAction(
  123,                          // order_id
  45,                           // user_id
  'survey_completed',           // action_type
  'Obhliadka dokončená',        // action_title
  {                             // action_details
    photos: ['photo1.jpg', 'photo2.jpg'],
    notes: 'Klient požaduje nástenné umiestnenie'
  },
  true                          // visible_to_client
);
```

---

## 📧 Real-time notifikácie

Pri každej akcii sa odošle notifikácia:

```javascript
// backend/utils/orderNotifications.js

export const notifyOrderAction = async (orderId, actionType) => {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  const order = orders[0];

  // Email klientovi
  if (shouldNotifyClient(actionType)) {
    await sendEmail({
      to: order.client_email,
      subject: `MONTIO - ${getActionTitle(actionType)}`,
      template: 'order_update',
      data: {
        orderNumber: order.order_number,
        actionType,
        trackingLink: `https://montio.tsdigital.sk/order/status/${order.public_token}`
      }
    });
  }

  // Push notifikácia zamestnancovi
  if (order.assigned_employee_id) {
    await sendPushNotification(order.assigned_employee_id, {
      title: 'Aktualizácia zákazky',
      body: `${order.order_number}: ${getActionTitle(actionType)}`
    });
  }
};
```

---

## 📱 Mobilná aplikácia (budúcnosť)

Timeline bude ideálny pre mobilnú app:
- Push notifikácie pri každej zmene
- Offline mode - timeline sa syncne pri pripojení
- Fotky priamo z fotoaparátu
- GPS logovanie polohy pri akcii

---

## 🎯 Use Cases

### 1. Klient sleduje stav zákazky
```
Klient dostane SMS/Email s linkom:
"Vaša zákazka MONT-2024-001 bola vytvorená.
Sledujte stav: https://montio.tsdigital.sk/order/status/abc123"

Klikne → Vidí timeline → Vie presne čo sa deje
```

### 2. Zamestnanec kontroluje históriu
```
Zamestnanec príde na montáž:
Otvorí appku → Vidí timeline →
"Aha, obhliadka bola 13.4., klient chce nástenné umiestnenie"
```

### 3. Company admin overuje proces
```
Admin dostane sťažnosť od klienta:
Otvorí zákazku → Timeline →
Vidí presne kto, čo a kedy robil → Môže rýchlo reagovať
```

### 4. Audit trail pre spory
```
Klient tvrdí: "Nikto mi nepovedal že to bude toľko stáť"
Admin: *otvorí timeline*
"13.4.2024 15:00 - Cenová ponuka odoslaná na email
 13.4.2024 15:15 - Ponuka zobrazená klientom
 13.4.2024 16:00 - Ponuka akceptovaná (IP: xxx, podpis)"
```

---

## ✅ Implementačný checklist

### Backend
- [ ] Vytvoriť `order_timeline` tabuľku
- [ ] Implementovať `orderLogger.js` middleware
- [ ] API endpoint: `GET /api/orders/:id/timeline`
- [ ] API endpoint: `GET /api/orders/client/:token/timeline`
- [ ] API endpoint: `POST /api/orders/:id/timeline`
- [ ] Integrovať logging do všetkých order endpoints
- [ ] Email/SMS notifikácie pri akciách

### Frontend
- [ ] `OrderTimeline.jsx` komponent
- [ ] `TimelineItem.jsx` komponent
- [ ] Public client view stránka
- [ ] Integrácia do OrderDetail page
- [ ] Real-time updates (polling alebo WebSocket)
- [ ] Export timeline do PDF

### Testing
- [ ] Unit testy pre logging middleware
- [ ] E2E testy pre timeline zobrazenie
- [ ] Test public link funkcionality
- [ ] Test permissions (kto čo vidí)

---

## 🚀 Ďalšie vylepšenia (budúcnosť)

- **WebSocket real-time updates** - Timeline sa aktualizuje automaticky
- **Export do PDF** - Klient si môže stiahnuť kompletnú históriu
- **Filtrovanie** - Filter podľa typu akcie, dátumu
- **Search** - Vyhľadávanie v timeline
- **Attachments** - Prikladanie súborov priamo do záznamu
- **Reactions** - Klient môže reagovať na záznamy (👍 videl som, ✅ súhlasím)
- **Chat** - Komunikácia klient ↔ firma priamo v timeline

---

**Status:** 🔲 Plánované pre FÁZU 5  
**Priority:** ⭐⭐⭐⭐⭐ HIGH (kľúčová feature)  
**Estimated time:** ~15-20 hodín implementácie
