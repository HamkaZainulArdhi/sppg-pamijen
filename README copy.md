# 🥗 GiziKita — AI-Based Nutrition Scanner

**GiziKita** adalah platform berbasis **AI Scanner** yang membantu orang tua memantau menu dan kandungan gizi anak setiap hari, memastikan asupan mereka bergizi dan sesuai standar program **Makan Bergizi Gratis (MBG)**.

Dengan dukungan teknologi **AI**, setiap menu MBG dapat **diverifikasi kandungan gizinya**, memastikan **transparansi penyaluran** dan **kualitas asupan** anak-anak Indonesia.

---

## 🚀 Fitur Utama

- 🤖 **AI Scanner Gizi** — Menganalisis kandungan gizi dari foto menu secara otomatis.
- 🍽️ **Pantauan Menu Harian** — Orang tua dapat melihat menu dan asupan anak setiap hari.
- 📊 **Data Gizi Transparan** — Menampilkan hasil analisis gizi yang mudah dipahami.
- 🧶 **Riwayat Analisis** — Simpan dan pantau perkembangan gizi anak dari waktu ke waktu.
- 🧠 **Dukungan Program MBG** — Terintegrasi dengan sistem Makan Bergizi Gratis untuk sekolah.

---

## 🧩 Teknologi yang Digunakan

| Stack                    | Teknologi                                                                |
| ------------------------ | ------------------------------------------------------------------------ |
| **Framework**            | [Next.js 15](https://nextjs.org/)                                        |
| **Library UI**           | [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/) |
| **Animation**            | [Framer Motion](https://www.framer.com/motion/)                          |
| **Backend & Cloud**      | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)            |
| **ORM**                  | [Prisma](https://www.prisma.io/)                                         |
| **Deployment**           | [Vercel](https://vercel.com/)                                            |
| **AI/Model Integration** | Python YOLO v11, Gemini AI, Express.js, Node.js                          |

---

## 🤠 Arsitektur Singkat

```
┌──────────────────────────────────────┐
│    Next.js Frontend (Vercel)         │
│    - Landing Page                    │
│    - Dashboard & Auth                │
│    - Menu Scanner & History          │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│    Supabase (Cloud Backend)          │
│    ├─ PostgreSQL Database            │
│    ├─ Auth & RLS                     │
│    └─ Storage (Images)               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│    AI Scanner Backend                │
│    - Python YOLO v11 Model           │
│    - Gemini API (Nutrition Analysis) │
│    - Express.js Server               │
└──────────────────────────────────────┘
```

---

# 📖 Dokumentasi Perancangan Cloud Architecture

## 1. Pendahuluan

### 1.1 Latar Belakang Pemilihan Supabase

Supabase dipilih sebagai Backend-as-a-Service (BaaS) untuk **GiziKita** karena beberapa pertimbangan strategis:

1. **Open Source & Transparansi** — Supabase berbasis PostgreSQL open-source, memberikan transparansi penuh tanpa vendor lock-in yang ketat.
2. **PostgreSQL yang Powerful** — Database relasional dengan fitur Row Level Security (RLS) bawaan untuk kontrol akses data berbasis user.
3. **Authentication Terintegrasi** — Supabase Auth menyediakan sistem otentikasi yang aman dengan JWT token dan OAuth support.
4. **Cloud Storage Managed** — Penyimpanan file (gambar menu) dapat dikelola langsung dalam satu ekosistem.
5. **Real-time Capabilities** — Dukungan real-time subscriptions untuk notifikasi data update.
6. **Cost-Effective** — Model pricing yang fleksibel sesuai dengan fase development.

### 1.2 Mengapa Backend-as-a-Service?

Menggunakan BaaS mengurangi kompleksitas pemeliharaan infrastruktur backend custom. Tim dapat fokus pada:

- Pengembangan fitur aplikasi
- Integrasi AI Scanner
- User experience improvement

Alih-alih mengelola server, database tuning, dan security hardening secara manual.

### 1.3 Tujuan Dokumentasi

Dokumentasi ini menjelaskan **pemanfaatan cloud dalam GiziKita** dengan fokus pada:

- Bagaimana Supabase digunakan secara efektif
- Desain data dan akses berbasis cloud
- Praktik keamanan dalam lingkungan managed service
- Scalability yang didapatkan tanpa kompleksitas operasional

---

## 2. Gambaran Umum Arsitektur Sistem

### 2.1 Komponen Utama

**GiziKita** terdiri dari tiga lapisan utama:

| Lapisan           | Komponen                               | Deskripsi                                 |
| ----------------- | -------------------------------------- | ----------------------------------------- |
| **Presentation**  | Next.js (Frontend) @ Vercel            | UI/UX untuk user, dashboard, scanner page |
| **Cloud Backend** | Supabase (PostgreSQL + Auth + Storage) | Database, authentication, file storage    |
| **AI Engine**     | Python YOLO + Gemini + Express         | Model processing & nutrition analysis     |

### 2.2 Alur Data User

```
1. User Upload Foto Menu
   ↓
2. Next.js Frontend kirim ke AI Backend
   ↓
3. AI Scanner (YOLO) deteksi item makanan
   ↓
4. Gemini API analisis kandungan gizi
   ↓
5. Hasil disimpan ke Supabase PostgreSQL
   ↓
6. Image disimpan ke Supabase Storage
   ↓
7. Frontend menampilkan hasil dengan RLS protection
```

### 2.3 Peran Cloud dalam Sistem

Supabase memiliki peran kritis sebagai:

- **Single Source of Truth** untuk semua data aplikasi
- **Security Layer** dengan authentication dan RLS
- **Scalable Infrastructure** yang dapat menangani growth tanpa downtime
- **Real-time Gateway** untuk update data across users

---

## 3. Desain Cloud Backend (Supabase)

### 3.1 Database Design (PostgreSQL Supabase)

#### **Tabel: `users`**

Menyimpan data user (orang tua & staff sekolah)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  school_category VARCHAR(50),
  role VARCHAR(50) DEFAULT 'parent', -- 'parent', 'staff', 'admin'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Field:** `id`, `email`, `full_name`, `phone_number`, `school_category`, `role`, `created_at`, `updated_at`

#### **Tabel: `children`**

Data anak-anak yang dipantau

```sql
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INT,
  school_name VARCHAR(255),
  school_category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Field:** `id`, `parent_id`, `name`, `age`, `school_name`, `school_category`, `created_at`, `updated_at`

#### **Tabel: `nutrition_scans`**

Hasil analisis gizi dari setiap menu scan

```sql
CREATE TABLE nutrition_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  school_id UUID,
  school_category VARCHAR(50),
  image_url TEXT NOT NULL,
  scan_date TIMESTAMP DEFAULT NOW(),
  nutrition_facts JSONB, -- { items: [...], nutrition_summary: {...} }
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Field:** `id`, `child_id`, `school_id`, `school_category`, `image_url`, `scan_date`, `nutrition_facts`, `created_at`, `updated_at`

#### **Tabel: `nutrition_summary`**

Ringkasan gizi harian/bulanan

```sql
CREATE TABLE nutrition_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_calories DECIMAL(10, 2),
  total_protein DECIMAL(10, 2),
  total_fat DECIMAL(10, 2),
  total_carbs DECIMAL(10, 2),
  total_sodium DECIMAL(10, 2),
  total_fiber DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(child_id, summary_date)
);
```

**Field:** `id`, `child_id`, `summary_date`, `total_calories`, `total_protein`, `total_fat`, `total_carbs`, `total_sodium`, `total_fiber`, `created_at`

#### **Integrasi Prisma ORM**

Prisma digunakan sebagai ORM untuk type-safety dan query building:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  fullName      String?
  phoneNumber   String?
  schoolCategory String?
  role          String    @default("parent")
  children      Child[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model NutritionScan {
  id              String    @id @default(cuid())
  child_id        String?
  imageUrl        String
  scanDate        DateTime  @default(now())
  nutritionFacts  Json?
  createdAt       DateTime  @default(now())
}
```

**Keuntungan Prisma:**

- Type-safe queries di TypeScript
- Auto-migration management
- Query optimization
- Relation handling yang seamless

### 3.2 Authentication (Supabase Auth)

#### **Mekanisme Autentikasi**

Supabase Auth menggunakan JWT (JSON Web Token) untuk session management:

```
User Login
   ↓
Supabase Auth verifikasi email/password
   ↓
Generate JWT token + Refresh token
   ↓
Client menyimpan token di localStorage/cookie
   ↓
Setiap request include JWT header: Authorization: Bearer {token}
   ↓
Supabase RLS validates user context dari JWT
```

#### **Role-Based Access Control**

```sql
-- Supabase Auth user memiliki custom claims
-- user.user_metadata.role = 'parent' | 'staff' | 'admin'

-- Contoh query dengan RLS:
SELECT * FROM children
WHERE parent_id = auth.uid()
  AND role = 'parent';
```

#### **Session Management**

- Token expiry: 1 jam (access token)
- Refresh token: 7 hari
- Auto refresh di background via Supabase client

### 3.3 Storage (Supabase Storage)

#### **Bucket Structure**

```
supabase-bucket/
├─ nutrition-scans/
│  ├─ {user_id}/{scan_id}/{filename}.jpg
│  └─ {user_id}/{scan_id}/{filename}.png
├─ profile-pictures/
│  └─ {user_id}/{filename}
└─ reports/
   └─ {user_id}/{report_id}.pdf
```

#### **RLS Policy untuk Storage**

```sql
-- User hanya bisa upload ke folder mereka sendiri
CREATE POLICY "Users upload own scan images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'nutrition-scans'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- User hanya bisa download file mereka
CREATE POLICY "Users view own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'nutrition-scans'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Pengelolaan File**

Konfigurasi storage di Next.js:

```typescript
const supabase = createClient(url, key);

// Upload file
const { data, error } = await supabase.storage
  .from('nutrition-scans')
  .upload(`${userId}/${scanId}/menu.jpg`, file);

// Generate public URL
const { data: urlData } = supabase.storage
  .from('nutrition-scans')
  .getPublicUrl(`${userId}/${scanId}/menu.jpg`);
```

### 3.4 API & Data Access

#### **Supabase Client dalam Next.js**

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// Penggunaan
const { data, error } = await supabase
  .from('nutrition_scans')
  .select('*')
  .eq('child_id', childId);
```

#### **Row Level Security (RLS)**

RLS adalah fitur PostgreSQL yang memastikan user hanya dapat mengakses data mereka:

```sql
-- Enable RLS pada table nutrition_scans
ALTER TABLE nutrition_scans ENABLE ROW LEVEL SECURITY;

-- Policy: Parent hanya bisa lihat scan anak mereka
CREATE POLICY "Parents view own children scans"
ON nutrition_scans
FOR SELECT
USING (
  child_id IN (
    SELECT id FROM children
    WHERE parent_id = auth.uid()
  )
);

-- Policy: Staff sekolah bisa lihat semua scan anak di sekolahnya
CREATE POLICY "Staff view school scans"
ON nutrition_scans
FOR SELECT
USING (
  school_category = (
    SELECT school_category FROM users
    WHERE id = auth.uid()
  )
  AND role = 'staff'
);
```

#### **Advantage dari RLS**

- **Security at Database Layer** — Tidak perlu validasi aplikasi untuk setiap query
- **Guaranteed Protection** — Bahkan jika API compromised, database tetap aman
- **Performance** — RLS filtering dilakukan di database sebelum data dikirim

---

## 4. Environment & Konfigurasi

### 4.1 Environment Variables

```env
# .env.local (Development)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# AI Backend
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8000
GEMINI_API_KEY=[gemini-key]

# Storage
NEXT_PUBLIC_STORAGE_URL=https://[project].supabase.co/storage/v1/object
```

### 4.2 Konfigurasi Production vs Development

| Aspek                | Development                  | Production                      |
| -------------------- | ---------------------------- | ------------------------------- |
| **Supabase Project** | Staging project              | Production project (separate)   |
| **Database**         | Real database with test data | Live database with RLS strict   |
| **Auth**             | Testing OAuth, email magic   | Production OAuth providers      |
| **Storage**          | Test bucket dengan lifecycle | Optimized bucket dengan CDN     |
| **API Keys**         | Anon key only (public)       | Service role key (backend only) |
| **RLS Policies**     | Relaxed for testing          | Strict enforcement              |

### 4.3 Database Migrations dengan Prisma

```bash
# Create new migration
npx prisma migrate dev --name add_nutrition_summary

# Deploy migration ke production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## 5. Keamanan Sistem

### 5.1 Authentication & Authorization

**Multi-layer authentication:**

1. Supabase Auth (JWT-based)
2. User role validation (parent, staff, admin)
3. RLS policies di database
4. API route protection di Next.js

```typescript
// pages/api/scans.ts
import { createServerClient } from '@supabase/ssr';

export default async function handler(req, res) {
  const supabase = createServerClient(req, res);

  // Verify auth
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  // Query with RLS enforcement
  const { data, error } = await supabase.from('nutrition_scans').select('*');
  // RLS automatically filters by user

  return res.json(data);
}
```

### 5.2 Row Level Security (RLS)

Semua tabel yang sensitive memiliki RLS policies:

- `users` — User hanya bisa lihat profile sendiri
- `children` — Parent hanya bisa lihat anak mereka
- `nutrition_scans` — Akses berbasis child ownership
- Storage — File hanya accessible oleh owner

### 5.3 Proteksi Akses Storage

```typescript
// Generate signed URL untuk akses terbatas
const { data } = await supabase.storage
  .from('nutrition-scans')
  .createSignedUrl(filePath, 3600); // 1 jam expiry

// Hanya authorized user yang bisa download
```

### 5.4 Praktik Keamanan Tambahan

1. **Never expose Service Role Key** di frontend
2. **API Route** menggunakan server-side client dengan service role key
3. **CORS** dikonfigurasi ketat di Supabase
4. **Rate Limiting** di API routes untuk prevent abuse
5. **Data Encryption** untuk field sensitif (PII)

---

## 6. Scalability & Maintainability

### 6.1 Scalability yang Ditangani Supabase

Supabase secara otomatis menangani:

| Aspek                | Cara Supabase Handle                        |
| -------------------- | ------------------------------------------- |
| **Database Growth**  | Auto-scaling PostgreSQL, connection pooling |
| **Concurrent Users** | Load balancing, read replicas               |
| **Storage**          | CDN distribution, object versioning         |
| **Auth Scale**       | Stateless JWT, no session server needed     |
| **Real-time**        | WebSocket scaling, broadcast optimization   |

### 6.2 Pengurangan Kompleksitas Backend

**Tanpa Supabase (Custom Backend):**

- Setup server (Node.js, Python)
- Manage database (PostgreSQL tuning, backups)
- Implement auth (JWT, refresh tokens, logout)
- Handle file storage (S3, CDN setup)
- Database migrations, versioning
- Security patches, dependency updates

**Dengan Supabase:**

- Langsung gunakan PostgreSQL via API
- Auth sudah built-in & managed
- Storage terintegrasi
- Backups otomatis
- Security updates by Supabase team
- Time saving: **~60% backend development effort**

### 6.3 Maintainability dengan Prisma

Prisma meningkatkan maintainability:

- Type-safe queries (TypeScript)
- Self-documenting schema
- Auto migrations
- Relation simplification
- Easy schema evolution

Contoh:

```typescript
// Type-safe query dengan intellisense
const scans = await prisma.nutritionScan.findMany({
  where: { child: { parent_id: userId } },
  include: { child: true },
  orderBy: { scanDate: 'desc' },
});
// Type inference: scans adalah NutritionScan[]
```

---

## 7. Keterbatasan dan Pertimbangan

### 7.1 Ketergantungan pada Layanan Pihak Ketiga

| Risiko                | Mitigasi                                        |
| --------------------- | ----------------------------------------------- |
| **Supabase downtime** | SLA 99.9% uptime, fallback UI mode, cached data |
| **Vendor lock-in**    | Open-source tools, data export built-in         |
| **Cost increase**     | Monitor usage, implement rate limits            |
| **Gemini API quota**  | Local backup model, fallback to manual input    |

### 7.2 Batasan Kontrol Infrastruktur

Dengan managed service, **tidak bisa:**

- Optimize di level OS/kernel
- Custom networking rules
- Bare-metal performance tuning

**Trade-off:** Lebih simple vs total control

### 7.3 Strategi Mitigasi Risiko

1. **Data Backup** — Download database export bulanan
2. **Monitoring** — Alert setup untuk error spikes
3. **Rate Limiting** — Prevent runaway costs
4. **Local Testing** — Test database schema locally sebelum production
5. **Documentation** — Clear recovery procedures

---

## 8. Kesimpulan

### 8.1 Alasan Supabase Cocok untuk GiziKita

1. **Fase Development** — Cepat build MVP tanpa backend boilerplate
2. **Security Requirements** — RLS built-in untuk data privacy (crucial untuk health data)
3. **Cost Model** — Pay-as-you-grow sesuai usage actual
4. **Team Size** — Tim kecil, tidak perlu DevOps engineer
5. **Open Technology** — PostgreSQL open-source, bukan proprietary

### 8.2 Dampak Cloud terhadap Efisiensi Pengembangan

| Metrik               | Impact                                     |
| -------------------- | ------------------------------------------ |
| **Time to MVP**      | ⬆️ 40% faster (no backend setup)           |
| **Maintenance Cost** | ⬇️ 60% lower (managed infrastructure)      |
| **Security Effort**  | ⬇️ Handled by Supabase, RLS policies only  |
| **Scalability**      | ✅ Automatic, no refactoring needed        |
| **Developer Focus**  | ✅ Concentrate on feature & AI integration |

### 8.3 Ringkasan Nilai Teknis

**GiziKita** memanfaatkan cloud (Supabase) bukan hanya sebagai hosting, tetapi sebagai **arsitektur strategis** yang:

✅ **Mempercepat development** dengan API-first approach  
✅ **Meningkatkan security** dengan RLS di database layer  
✅ **Menurunkan operational overhead** dengan managed service  
✅ **Memungkinkan scaling** tanpa redesign aplikasi  
✅ **Membebaskan tim** untuk fokus pada domain knowledge (AI, nutrition)

---

## 9. Database Schema Summary

### Schema Overview

```
┌─────────────────┐
│     users       │ (auth.uid)
├─────────────────┤
│ id (PK)         │
│ email           │
│ full_name       │
│ phone_number    │
│ school_category │
│ role            │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌──────────────────┐
│    children     │◄──────│ nutrition_scans  │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │ 1:N   │ id (PK)          │
│ parent_id (FK)  │       │ child_id (FK)    │
│ name            │       │ image_url        │
│ age             │       │ scan_date        │
│ school_name     │       │ nutrition_facts  │
│ school_category │       │ created_at       │
│ created_at      │       └──────────────────┘
└─────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐
│ nutrition_summary    │
├──────────────────────┤
│ id (PK)              │
│ child_id (FK)        │
│ summary_date         │
│ total_calories       │
│ total_protein        │
│ total_fat            │
│ total_carbs          │
│ total_sodium         │
│ total_fiber          │
│ created_at           │
└──────────────────────┘
```

### Key Constraints & Indexes

- **Primary Keys:** Unique identification per record
- **Foreign Keys:** Relational integrity (parent_id → users.id, child_id → children.id)
- **Unique Constraints:** Email di users, child_id + summary_date di nutrition_summary
- **Indexes:** scan_date, child_id, parent_id untuk query performance
- **RLS Enabled:** Semua tabel dengan data user-specific

---

## 🌱 Kontribusi

Kontribusi sangat terbuka!
Silakan buat **pull request** atau **laporkan issue** bila menemukan bug atau ide pengembangan baru.

---

## 🧑‍💻 Tim Pengembang

| Nama                                             | Peran                               |
| ------------------------------------------------ | ----------------------------------- |
| [Hamka Zainul Ardhi](https://hamkacv.vercel.app) | Backend Developer & AI Integration  |
| [Habib Rafi'i](https://github.com/username)      | Frontend Developer & UI/UX Designer |
| [Avril Nur Adi P](https://github.com/username)   | Product Manager & Quality assurance |

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah lisensi **MIT** — bebas digunakan dan dikembangkan lebih lanjut dengan atribusi yang sesuai.

---

## ✨ Cuplikan

> "Orang tua memantau menu dan gizi anak yang di salur kan pihak SPPG dengan analisis otomatis dan data yang transparan."
