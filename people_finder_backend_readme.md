# 🧠 People Finder Backend – Texnik Vazifa (NestJS + Prisma)

## 📌 Loyiha g‘oyasi

Foydalanuvchi matnli ta’rif (prompt) kiritadi. AI (GPT-4) bu so‘rovni strukturaga ajratadi, so‘ngra mos odamlarni internet (LinkedIn, GitHub, Google) orqali topadi. Har bir so‘rov tarixi saqlanadi va chat-style ko‘rinishda qayta ko‘rsatiladi.

---

## 📁 1. Texnologiyalar

- **NestJS** – Backend framework
- **Prisma ORM** – PostgreSQL bilan ORM
- **PostgreSQL** – Ma’lumotlar bazasi
- **OpenAI GPT-4** – So‘rov tahlili uchun
- **Google Search / LinkedIn API / GitHub API** – Profil topish uchun
- **Redis** – Kesh va rate limit
- **JWT** – Avtorizatsiya
- **Swagger** – API hujjatlash
- **Docker** – Deployment

---

## 🔐 2. Autentifikatsiya

| Endpoint                  | Description       |
| ------------------------- | ----------------- |
| `POST /api/auth/register` | Ro‘yxatdan o‘tish |
| `POST /api/auth/login`    | Tizimga kirish    |
| `GET /api/auth/me`        | Profilni olish    |
| `POST /api/auth/logout`   | Tizimdan chiqish  |

**Auth**:

- JWT access (1 soat)
- JWT refresh (30 kun)
- Bcrypt bilan parol hashing

---

## 📥 3. Qidiruv (AI asosida)

| Endpoint                  | Description                     |
| ------------------------- | ------------------------------- |
| `POST /api/search`        | Yangi qidiruv (prompt asosida)  |
| `GET /api/search/history` | Foydalanuvchi qidiruvlar tarixi |
| `GET /api/search/:id`     | Qidiruvga oid natijalar         |
| `DELETE /api/search/:id`  | Qidiruvni o‘chirish             |

- AI (`OpenAI GPT-4`) `originalQuery` ni `parsedQuery` ga ajratadi
- Keyin `Google / LinkedIn / GitHub` orqali mos odamlar topiladi
- Profil ma’lumotlari `SearchResult` jadvalida saqlanadi

---

## 🧑‍💼 4. Profillar

| Endpoint                         | Description                   |
| -------------------------------- | ----------------------------- |
| `GET /api/profiles/:id`          | Profil ma’lumotlarini ko‘rish |
| `POST /api/profiles/:id/contact` | Aloqa so‘rovi yuborish        |
| `POST /api/profiles/:id/save`    | Profilni saqlash              |
| `GET /api/profiles/saved`        | Saqlangan profillar ro‘yxati  |
| `DELETE /api/profiles/:id/save`  | Saqlangan profilni o‘chirish  |

---

## 💬 5. AI Chat tarixi

| Endpoint                | Description                     |
| ----------------------- | ------------------------------- |
| `GET /api/chat/history` | User ↔ AI chat loglarini olish |

- Foydalanuvchi yozgan har bir prompt va AI javobi `InteractionLog` da saqlanadi
- Frontend `ChatGPT` uslubida chiqaradi

---

## 📡 6. Ma’lumotlar bazasi sxemasi (Prisma)

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String?
  name        String
  avatar      String?
  bio         String?
  location    String?
  skills      String[]
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  searches    Search[]
  saved       SavedProfile[]
  chats       InteractionLog[]
  contactRequests ContactRequest[]

  @@map("users")
}

model Search {
  id           String   @id @default(cuid())
  userId       String
  originalQuery String
  parsedQuery  Json
  filters      Json?
  resultsCount Int      @default(0)
  status       SearchStatus @default(PENDING)
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id])

  results      SearchResult[]

  @@map("searchs")
}

model SearchResult {
  id         String @id @default(cuid())
  searchId   String
  externalId String
  platform   Platform
  name       String
  title      String?
  location   String?
  avatar     String?
  skills     String[]
  profileUrl String
  matchScore Float  @default(0)
  rawData    Json
  search     Search @relation(fields: [searchId], references: [id])

  @@map("search_results")
}

model SavedProfile {
  id        String @id @default(cuid())
  userId    String
  profileId String
  notes     String?
  tags      String[]
  createdAt DateTime @default(now())
  user      User @relation(fields: [userId], references: [id])

  @@map("saved_profiles")
}

model InteractionLog {
  id        String   @id @default(cuid())
  userId    String
  role      LogRole
  message   String
  createdAt DateTime @default(now())
  user      User @relation(fields: [userId], references: [id])

  @@map("interaction_log")
}

model ContactRequest {
  id        String   @id @default(cuid())
  userId    String
  profileId String
  message   String?
  status    RequestStatus @default(PENDING)
  createdAt DateTime @default(now())
  user      User @relation(fields: [userId], references: [id])

  @@map("contact_requests")
}

model ErrorLog {
  id         String   @id @default(cuid())
  message    String
  stackTrace String?
  context    Json?
  createdAt  DateTime @default(now())

  @@map("error_logs")
}


enum Platform {
  LINKEDIN
  GITHUB
  GOOGLE
}

enum SearchStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum LogRole {
  USER
  AI
}

enum RequestStatus {
  PENDING
  SENT
  FAILED
}
```

---

## 🗏️ 7. Middleware & Xavfsizlik

- **JWT middleware** – access + refresh
- **Rate Limiter (Redis)** – search va login uchun
- **Auth Guard (NestJS)** – endpointlarga kirishni cheklash
- **CORS Middleware** – frontend bilan aloqa uchun
- **Error Filter** – global xatoliklarni tutish

---

## 🧠 8. AI xizmati

- `search.service.ts` – OpenAI bilan so‘rovni analiz qilish
- `scraper.service.ts` – LinkedIn/GitHub’dan profillarni olish
- `ranking.service.ts` – relevance score hisoblash

---

## 🚀 9. Deployment

- `Dockerfile`
- `docker-compose.yml`
- `.env.example`
- `Prisma Migrate` bilan db yaratish
- PM2 yoki GitHub Actions bilan CI/CD

---

## 🔪 10. Testlar

- `jest` bilan unit test
- `supertest` bilan e2e test
- `Swagger` – http://localhost:3000/api/docs

---

## ✅ UX oqimi

1. Foydalanuvchi ro‘yxatdan o‘tadi / kiradi
2. Prompt yozadi: `Masalan: 5 yillik frontendchi, React, Berlinda yashasin`
3. GPT so‘rovni strukturaga ajratadi
4. Platformalardan profillar to‘planadi
5. Relevance bo‘yicha tartiblab foydalanuvchiga ko‘rsatiladi
6. Qidiruv tarixi `ChatGPT` uslubida saqlanadi
7. Foydalanuvchi profiling saqlaydi yoki aloqa so‘rov yuboradi
