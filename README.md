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

## 2. Peran Cloud dalam Sistem

Supabase memiliki peran kritis sebagai **backbone infrastruktur aplikasi** dengan tanggung jawab:

- **Single Source of Truth** — Semua data aplikasi (user profile, nutrition data, images) terpusat di Supabase
- **Security Layer** — Authentication, authorization, dan Row Level Security untuk melindungi data sensitif (health data)
- **Scalable Infrastructure** — Dapat menangani pertumbuhan pengguna tanpa redesign aplikasi atau pemeliharaan operasional
- **Real-time Gateway** — Data synchronization across users dalam ekosistem platform

### 2.1 Arsitektur Sistem

**GiziKita** menggunakan three-tier architecture dengan cloud sebagai core:

```
┌──────────────────────────┐
│   Next.js Frontend       │
│   (Client-side Logic)    │
│   @ Vercel               │
└────────────┬─────────────┘
             │
             │ HTTP/REST API
             │
┌────────────▼─────────────┐
│   Supabase Cloud         │
│  (Backend Services)      │
│  - PostgreSQL Database   │
│  - Auth Service          │
│  - Object Storage        │
└────────────┬─────────────┘
             │
             │ API Calls
             │
┌────────────▼─────────────┐
│   AI Engine Backend      │
│   (Processing Layer)     │
│   - YOLO v11 Model       │
│   - Gemini Analysis      │
│   - Express.js Server    │
└──────────────────────────┘
```

### 2.2 Alur Interaksi Web ↔ Cloud

**Skenario: User Upload Foto Menu**

1. **User Action di Frontend** — Orang tua atau staff sekolah upload foto menu di aplikasi web
2. **Frontend Processing** — Next.js menangani file upload, validasi ukuran/format
3. **Kirim ke Cloud** — File dikirim ke Supabase Storage dengan user context (JWT token)
4. **Cloud Storage** — Supabase menyimpan file dengan RLS enforcement (hanya user dapat akses file mereka)
5. **Database Record** — Frontend merekam metadata (image_url, scan_date) ke Supabase PostgreSQL
6. **AI Processing** — Image URL dikirim ke AI Backend untuk analisis
7. **Result Persisten** — Hasil analisis (nutrition_facts JSON) diupdate di database Supabase
8. **Frontend Display** — Data diambil dari cloud dengan RLS filter, ditampilkan ke user
9. **Real-time Sync** — Jika ada user lain (staff/admin), data terupdate secara otomatis

**Interaksi Key:**

- Frontend = stateless client, semua state management ada di cloud
- Cloud = central authority untuk data integrity dan security
- AI Backend = microservice yang hanya konsumsi dari cloud, tidak store data

### 2.3 Komponen Utama Cloud

| Layer           | Teknologi                | Fungsi                                          |
| --------------- | ------------------------ | ----------------------------------------------- |
| **Persistence** | PostgreSQL Database      | Menyimpan semua data terstruktur (users, scans) |
| **Auth**        | Supabase Auth (JWT)      | Verify user identity, session management        |
| **Access**      | Row Level Security (RLS) | Control data access per user, per role          |
| **Storage**     | Object Storage (S3-like) | Simpan file images dengan access control        |
| **API Gateway** | Supabase PostgREST       | REST API auto-generated dari database schema    |

---

## 3. Desain Cloud Backend (Supabase)

### 3.1 Database (PostgreSQL Supabase) — Penyimpanan Data Terstruktur

**Peran Database dalam Sistem:**

Database PostgreSQL di Supabase adalah **persistent layer** yang menyimpan semua data aplikasi dengan struktur relasional:

#### **Tabel Utama & Fungsinya**

**Tabel `users`** — Data Pengguna Aplikasi

- Menyimpan informasi orang tua, staff sekolah, dan admin
- Terhubung langsung ke Supabase Auth (JWT token)
- Setiap user memiliki role (parent, staff, admin) untuk kontrol akses
- Field penting: email, full_name, phone_number, school_category, role

**Tabel `children`** — Data Anak yang Dipantau

- Satu parent dapat memiliki multiple children
- Relasi parent-child dikelola via foreign key parent_id
- Field penting: name, age, school_name, school_category
- Cascading delete: jika parent dihapus, children juga terhapus otomatis

**Tabel `nutrition_scans`** — Hasil Analisis Menu

- Menyimpan setiap scan menu yang dilakukan (1 foto = 1 record)
- Field nutrition_facts berisi JSON (struktur makanan + kalori/protein/lemak/karbohidrat)
- image_url menunjuk ke file di Supabase Storage
- Relasi ke child untuk tracking anak mana yang di-scan
- Indexed by scan_date untuk query riwayat yang efisien

**Tabel `nutrition_summary`** — Ringkasan Gizi Harian/Mingguan

- Agregasi dari nutrition_scans (diupdate setiap hari/minggu)
- Menyimpan total kalori, protein, lemak, karbohidrat per hari
- Digunakan untuk dashboard & analytics
- UNIQUE constraint pada (child_id, summary_date) untuk prevent duplicate

**Integrasi Prisma ORM:**

- Prisma mengelola schema definition dan migrations
- Provides type-safe queries dari Next.js
- Auto-generates TypeScript types dari database schema
- Relation handling (parent-child-scans) menjadi simple dan type-checked

#### **Keuntungan Menggunakan PostgreSQL Cloud**

- **ACID Compliance** — Data consistency terjamin (penting untuk health data)
- **Relational Integrity** — Foreign keys & constraints dipenegakkan database layer
- **Indexing** — Automatic query optimization, tidak perlu manual tuning
- **Scalability** — Supabase handle connection pooling, vertical scaling otomatis
- **Backup** — Automated daily backups by Supabase, recovery point guarantee

---

### 3.2 Authentication (Supabase Auth) — Verifikasi & Identitas User

**Peran Auth dalam Sistem:**

Supabase Auth adalah **gatekeeper** yang memverifikasi siapa user, mengelola session, dan membuat context untuk RLS.

#### **Mekanisme Autentikasi**

**Flow Umum:**

1. User login di frontend dengan email + password
2. Frontend mengirim kredensial ke Supabase Auth endpoint
3. Supabase verifikasi, generate JWT token (Access Token + Refresh Token)
4. Frontend menyimpan token di secure storage (localStorage / cookie)
5. Setiap API request include JWT token di Authorization header
6. Supabase PostgREST endpoint verifikasi JWT, extract user context
7. Database RLS policies menggunakan user context untuk filter data

**JWT Token Structure:**

- Access Token: 1 jam validity (short-lived untuk security)
- Refresh Token: 7 hari validity (untuk auto-renewal)
- Token berisi: user UUID, email, custom claims (role, school_category)

#### **Role-Based Access Control**

**User Roles dalam Sistem:**

- **Parent** — Orang tua murid, hanya bisa akses data anak mereka sendiri
- **Staff** — Staff sekolah, bisa akses semua anak di sekolah mereka
- **Admin** — Administrator platform, full access

**Role ditentukan saat:**

- User registration (default parent)
- Admin assign role ke users
- User metadata menyimpan role untuk digunakan RLS policies

#### **Session Management**

- Supabase client otomatis refresh token saat mendekati expiry
- User logout menghapus token dari storage
- Re-authentication required jika refresh token expired
- No session server-side needed (stateless auth)

**Keuntungan Approach Ini:**

- Scalable (tidak perlu session store)
- Secure (token terbatas waktu)
- User dapat login dari multiple devices
- API-friendly (untuk future mobile app)

---

### 3.3 Storage (Supabase Storage) — Penyimpanan File

**Peran Storage dalam Sistem:**

Supabase Storage adalah **file management layer** untuk menyimpan gambar menu dengan kontrol akses per-user.

#### **Struktur & Organisasi Storage**

**Bucket Structure:**

- **nutrition-scans/** — Folder utama untuk gambar menu
  - `{user_id}/{scan_id}/menu.jpg` — Struktur path berbasis user ownership
  - Memudahkan identifikasi file owner di RLS policies
- **profile-pictures/** — Foto profil user (optional)
- **reports/** — PDF reports generated (optional future feature)

**Naming Convention:**

- Folder hierarchy: user_id → scan_id → filename
- Memudahkan cleanup jika user/scan dihapus
- Direct relationship dengan database records

#### **Akses & RLS untuk Storage**

**Storage policies mengontrol:**

1. **Upload Control** — User hanya bisa upload ke folder mereka sendiri
   - `{user_id}/...` path hanya modifiable oleh user tersebut
   - Prevent user A upload ke folder user B

2. **Download Control** — User hanya bisa download file mereka
   - RLS policy filter berdasarkan path prefix
   - File owner atau admin dapat access

3. **Public vs Private** — Gambar menu bisa public read (tidak perlu auth untuk view), tapi create/update hanya owner
   - Parent sharing link foto menu ke keluarga
   - Admin viewing analytics tidak perlu authenticated

#### **Signaturan URL & Access Control**

- **Signed URLs** — Temporary download links dengan expiry time
  - Contoh: Parent download menu report → generate signed URL → send via email
  - Link valid 1 jam, auto-expire untuk security
- **Public URLs** — Permanent link untuk assets yang boleh public
  - Gambar menu dalam dashboard (read-only untuk authenticated users)

#### **CDN & Caching**

- Supabase Storage di-backed oleh CloudFlare CDN
- Images auto-cached globally untuk fast delivery
- Regional endpoints untuk latency optimization

**Benefit:**

- User di mana saja dapat fast access gambar
- Bandwidth tidak overload single server
- Automatic compression/resizing available

---

### 3.4 API & Data Access — Komunikasi Frontend ↔ Cloud

**Bagaimana Frontend Berkomunikasi dengan Cloud:**

Frontend mengakses cloud melalui **Supabase Client** yang abstraction layer ke multiple services (Database, Auth, Storage).

#### **Supabase Client Architecture**

**Supabase Client di Frontend:**

- Automatically injected JWT token di setiap request
- Handles auth state management
- Provides simple API untuk database queries, file uploads, auth
- Client-side (tidak perlu backend intermediary untuk sederhana queries)

**Jenis Request yang Dilakukan Frontend:**

1. **Authentication Requests**
   - Login/Signup → Supabase Auth service
   - Password reset → Supabase Auth service
   - Logout → Clear local token

2. **Database Queries**
   - Fetch nutrition scans → SELECT dari nutrition_scans table
   - Filter by child → WHERE child_id = ... (dengan RLS enforcement)
   - Insert new scan metadata → INSERT ke nutrition_scans (after AI processing)
   - Update nutrition_summary → INSERT/UPDATE untuk daily aggregate

3. **Storage Operations**
   - Upload image → PUT to nutrition-scans bucket
   - Get image URL → Retrieve signed URL
   - Delete image → DELETE from storage (cascade database record)

4. **Real-time Subscriptions**
   - Listen nutrition_scans changes → Notify parent jika ada scan baru
   - Listen users table → Update staff list jika ada new enrollment

#### **Row Level Security (RLS) — Data Access Control**

RLS adalah mekanisme **database-level** yang memastikan security enforcement di lapisan terendah.

**Bagaimana RLS Bekerja:**

1. Frontend send request dengan JWT token
2. Supabase PostgREST verify JWT → extract user UUID
3. Before query execution, RLS policies dievaluasi
4. Policy check: "Apakah user ini punya hak akses row ini?"
5. Jika TRUE → query execute, return data
6. Jika FALSE → return empty set (user tidak tahu row exists)

**RLS Policies yang Diterapkan:**

**Untuk nutrition_scans:**

- Parent dapat SELECT scan dari anak mereka saja (WHERE child_id IN (children where parent_id = auth.uid()))
- Staff dapat SELECT scan dari sekolah mereka saja (WHERE school_category = user_school)
- Admin dapat SELECT semua scan

**Untuk children:**

- Parent dapat SELECT anak mereka saja (WHERE parent_id = auth.uid())
- Staff dapat SELECT semua anak di sekolah mereka
- Tidak ada UPDATE untuk anak (immutable after creation)

**Untuk users (profiles):**

- User dapat SELECT profile mereka saja (WHERE id = auth.uid())
- Admin dapat SELECT semua users
- Password field tidak pernah returned (handled by Supabase Auth)

**Keuntungan RLS:**

- **Security at Database Layer** — Bahkan jika API route salah config, RLS tetap protect data
- **No Need for App-level Validation** — Tidak perlu double-check di setiap endpoint
- **Guaranteed Protection** — Impossible untuk developer accidentally expose data via RLS bypass
- **Audit Trail** — Supabase logs semua access attempts
- **Performance** — Filtering dilakukan di database sebelum network transfer

#### **API Access Pattern**

**Typical Flow untuk "Lihat Scan Anak":**

1. Frontend call: `supabase.from('nutrition_scans').select('*').eq('child_id', childId)`
2. Supabase client add JWT to request header
3. PostgREST endpoint receive request
4. Verify JWT → Extract user UUID
5. Evaluate RLS: "Apakah user ini parent dari child ini?"
6. If YES → SELECT \* FROM nutrition_scans WHERE child_id = childId (filtered by RLS)
7. If NO → Return 401 Unauthorized or empty set
8. Response sent to frontend
9. Frontend render data

**Tidak Ada Code di Frontend untuk Access Control** — RLS enforce di database.

---

### 3.5 Skema Database & Relasi

**Entity Relationship Diagram:**

```
users (id, email, role, school_category)
  ↓ 1:N
children (id, parent_id, name, school_name)
  ↓ 1:N
nutrition_scans (id, child_id, image_url, nutrition_facts JSON, scan_date)
  ↓ 1:N
nutrition_summary (id, child_id, summary_date, total_calories, ...)
```

**Key Relationships:**

- users → children: Parent has many children (parent_id FK)
- children → nutrition_scans: Child has many scans (child_id FK)
- children → nutrition_summary: Child has one summary per day (child_id FK + UNIQUE date)

**Cascade Behavior:**

- Delete user → Auto-delete children + scans (ON DELETE CASCADE)
- Delete child → Auto-delete scans + summaries (ON DELETE CASCADE)
- Prevent orphan records (data integrity guaranteed)

## 4. Environment & Konfigurasi Cloud

### 4.1 Konfigurasi Environment Variables

**Environment variables mengontrol koneksi aplikasi ke cloud services:**

**Public Keys (dapat expose di frontend):**

- `NEXT_PUBLIC_SUPABASE_URL` — URL endpoint Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anonymous key untuk client-side auth & queries (limited permissions by RLS)
- `NEXT_PUBLIC_AI_BACKEND_URL` — URL AI processing server
- `NEXT_PUBLIC_STORAGE_URL` — URL base untuk file access

**Secret Keys (only di backend/server-side):**

- `SUPABASE_SERVICE_ROLE_KEY` — Full access key, hanya untuk privileged operations (admin operations, cron jobs)
- `GEMINI_API_KEY` — Untuk AI nutrition analysis

**Keamanan Environment:**

- Never expose service role key di frontend
- Never commit .env.local ke version control
- Use Vercel Environment Secrets untuk production

### 4.2 Development vs Production Configuration

**Development Environment:**

- **Supabase Project** — Staging/dev project terpisah dari production
- **Database** — Real database dengan test data, RLS relaxed untuk ease testing
- **Auth** — Testing dengan magic links, tidak perlu setup OAuth
- **Storage** — Test bucket tanpa CDN caching
- **RLS Policies** — Relaxed enforcement (easier debugging)
- **Data** — Dapat reset/cleanup dengan mudah

**Production Environment:**

- **Supabase Project** — Dedicated production project dengan strict access control
- **Database** — Live database, backup otomatis setiap hari
- **Auth** — Production OAuth providers configured (Google, GitHub)
- **Storage** — Optimized bucket dengan CDN caching enabled
- **RLS Policies** — Strict enforcement, setiap query di-validate
- **Data** — Real user data, audit logging enabled
- **Monitoring** — Error tracking, performance monitoring active
- **Backups** — Daily snapshots, point-in-time recovery available

**Perbedaan Key:**

| Aspek          | Development     | Production               |
| -------------- | --------------- | ------------------------ |
| **Supabase**   | Staging project | Production project       |
| **URL/Key**    | Dev credentials | Production credentials   |
| **Data**       | Test data only  | Real user data           |
| **RLS**        | Relaxed         | Strict enforcement       |
| **Backups**    | Manual          | Automated daily          |
| **Monitoring** | Local logs      | Sentry/LogRocket/Datadog |

### 4.3 Database Migrations & Schema Management

**Bagaimana Cloud Database Schema Dikelola:**

Database schema di Supabase di-manage melalui **Prisma migrations**:

- **Local Development** — Developer modify Prisma schema → run `prisma migrate dev` → test locally
- **Migration Files** — Each change di-generate sebagai SQL migration file (tracked in git)
- **Production Deploy** — Run `prisma migrate deploy` untuk apply migrations ke production database
- **Rollback** — Migration history tracked, dapat rollback jika diperlukan

**Migration Workflow:**

1. Dev modify schema (add table, add column, create index)
2. Run `prisma migrate dev --name descriptive_change` → generate SQL migration
3. Test locally → ensure no breaking changes
4. Commit migration files ke git
5. Deploy to production → migrations auto-applied
6. Verify schema updated correctly

**Versioning:**

- Each migration named by timestamp (20231215_add_nutrition_summary.sql)
- Prevents conflicts dalam team development
- Clear audit trail of schema changes

---

## 5. Keamanan Sistem — Multi-Layer Protection

### 5.1 Authentication & Authorization Flow

**Sistem keamanan GiziKita menggunakan multiple security layers:**

**Layer 1: Supabase Auth (Identity Verification)**

- User login dengan email/password atau OAuth
- Supabase verify credentials → generate JWT token
- JWT berisi: user UUID, email, role
- Token di-validate di setiap request

**Layer 2: JWT Token Validation (Request Authorization)**

- Frontend include JWT di Authorization header
- Supabase PostgREST verify token signature & validity
- Extract user context (UUID, role, claims)
- Reject jika token expired atau invalid signature

**Layer 3: Row Level Security (Data Access Control)**

- RLS policies dievaluasi sebelum query execution
- Check: "Does this user have permission to access this row?"
- Enforce berbasis user role + data ownership
- Return empty set jika access denied (tidak expose row exists)

**Layer 4: API Route Protection (Application Level)**

- Next.js API routes verify JWT sebelum business logic
- Additional validation: role check, ownership verification
- Return 403 Forbidden jika user tidak authorized
- Log attempted unauthorized access untuk audit

**Contoh: User Access Pattern**

Ketika user (Parent) melihat scan anak:

1. Frontend attach JWT token
2. Auth layer verify token valid & not expired
3. RLS evaluate: "Is parent_id dari token = parent_id anak ini?" → YES
4. API layer optional verify ownership lagi
5. Data returned ke frontend
6. User lihat nutrition info

Jika user (Parent B) coba akses anak dari Parent A:

1. Frontend attach Parent B JWT
2. Auth layer verify token valid
3. RLS evaluate: "Is parent_id Parent B = parent_id anak Parent A?" → NO
4. RLS return empty set
5. User tidak lihat data
6. No error message (tidak reveal anak exists)

### 5.2 Row Level Security (RLS) — Database-Level Protection

**RLS adalah "gatekeeper" di database layer**, memastikan **setiap query dievaluasi untuk access control.**

**RLS Policies yang Diterapkan di GiziKita:**

**Untuk tabel `nutrition_scans` (Scan Menu Data):**

- **Parent Access Policy** — SELECT hanya scan dari anak mereka sendiri
  - Check: child_id in (children where parent_id = auth.uid())
- **Staff Access Policy** — SELECT hanya scan dari anak di sekolah mereka
  - Check: school_category = current_user.school_category
- **Admin Access Policy** — SELECT semua scan (no filter)

- **Insert Policy** — Hanya after AI processing memverifikasi ownership
  - Prevent user insert fake scan data

**Untuk tabel `children` (Data Anak):**

- **Parent Access Policy** — SELECT & UPDATE hanya anak mereka
  - Check: parent_id = auth.uid()
- **Staff Access Policy** — SELECT hanya anak di sekolah mereka (read-only)
  - Check: school_category = current_user.school_category
- **No Delete** — Anak tidak pernah dihapus (audit trail, soft delete saja)

**Untuk tabel `users` (Profile):**

- **Self-View Policy** — User hanya bisa SELECT profile mereka sendiri
  - Check: id = auth.uid()
- **Admin Override** — Admin dapat lihat semua users
- **Password Protection** — Password field never returned oleh SELECT

**Untuk Storage (`nutrition-scans` bucket):**

- **Upload Policy** — User hanya upload ke folder mereka: `{user_id}/*`
  - Prevent path traversal attack
- **Download Policy** — User hanya download dari folder mereka
  - Support signed URLs dengan expiry
- **Admin Override** — Admin atau AI backend dapat akses semua

### 5.3 Proteksi Akses Storage

**File di Supabase Storage dilindungi melalui:**

**Access Control via RLS:**

- Every storage operation go through RLS policies
- User tidak bisa bypass ke file lain dengan direct path
- Attempt access forbidden file → 403 error

**Signed URLs (Temporary Access):**

- When sharing file (e.g., parent email report) → generate signed URL
- Signed URL valid 1 jam saja → auto-expire untuk security
- Recipient tidak perlu auth untuk download, tapi hanya limited time

**Public vs Private:**

- Public URL — Permanent, readable oleh siapa saja (default read-only)
  - Useful untuk dashboard (no auth needed)
- Private URL — Hanya accessible oleh owner atau authenticated user
  - Default untuk upload file

**CDN Caching:**

- Images cached globally di CloudFlare CDN
- Reduce load on server
- Tidak affect security (RLS still enforced at origin)

### 5.4 Best Practices Keamanan yang Diterapkan

**1. Never Expose Service Role Key**

- Service role key = super-admin access, hanya untuk backend-only operations
- Should stored in environment secrets, not in code/frontend

**2. CORS Configuration**

- Supabase CORS strictness control which domains dapat akses API
- GiziKita frontend (Vercel URL) di-whitelist, external sites denied

**3. API Rate Limiting**

- Prevent abuse dan DDoS attacks
- Supabase provides default rate limits
- Custom limits dapat set untuk sensitive endpoints

**4. Data Encryption**

- Sensitive fields (PII) dapat encrypted di database
- Supabase supports column-level encryption
- Keys managed separately dari data

**5. Audit Logging**

- Supabase logs semua auth attempts
- Track login failures, suspicious access
- Useful untuk security investigation

**6. Two-Factor Authentication (2FA)**

- Optional untuk users (especially admin/staff)
- Supabase Auth supports TOTP
- Can mandate untuk admin accounts

**7. Password Policy**

- Minimum length & complexity enforced
- Frequent password change recommended untuk staff
- Password reset via email verification

---

## 6. Scalability & Maintainability — Keuntungan Cloud

### 6.1 Skalabilitas yang Ditangani Supabase

**GiziKita dapat scale tanpa perlu refactor atau operational overhead:**

**Database Scaling:**

- **Automatic Vertical Scaling** — Supabase automatically upgrade resources jika CPU/memory usage tinggi
- **Connection Pooling** — Supabase manage connection pool, prevent "too many connections" error
- **Read Replicas** — Production databases dapat punya read-only replica untuk high-traffic queries
- **Indexing Optimization** — Database automatically suggest indexes untuk slow queries

**Concurrent User Scaling:**

- **Stateless Auth** — JWT token tidak perlu server-side session store
  - 100 users, 1000 users, 10,000 users → No session management overhead
- **Load Balancing** — Supabase endpoint auto-distribute requests across multiple servers
- **Query Optimization** — Slow queries dapat di-identify via monitoring, add indexes

**Storage Scaling:**

- **Object Storage Unlimited** — Supabase storage bucket dapat menampung unlimited files
- **CDN Distribution** — Files cached globally, reduce latency untuk worldwide users
- **Bandwidth Management** — Supabase track bandwidth usage, auto-optimize transfers

**Real-time Scaling:**

- **WebSocket Pooling** — Real-time subscriptions scaled via connection pooling
- **Broadcast Optimization** — Only notify users affected oleh change (not all users)

### 6.2 Pengurangan Kompleksitas Operasional

**Tanpa Cloud Backend (Custom Server):**

**Tim harus manage:**

- Setup & deploy server (Node.js/Python/Go)
- Database administration (backup, tuning, recovery)
- Authentication infrastructure (JWT secret management, refresh token rotation)
- File storage infrastructure (S3 setup, CDN, bucket management)
- Database migrations & schema versioning
- Security patches & dependency updates
- Monitoring & alerting
- Disaster recovery & data backup
- Scaling decisions (when to upgrade)

**Perkiraan effort:** 60% dari development time untuk infrastructure

**Dengan Supabase (BaaS):**

**Tim focus pada:**

- Business logic & feature development
- AI integration & model improvement
- User experience optimization
- Data analytics & reporting

**Supabase handle:**

- Database setup, backup, recovery ✅
- Auth infrastructure ✅
- File storage ✅
- Migrations ✅
- Security patches ✅
- Monitoring ✅
- Scaling ✅

**Perkiraan effort:** 10% dari development time untuk infrastructure

**Benefit:**

- Faster time-to-market (MVP quicker)
- Smaller ops team (no DevOps needed)
- Lower maintenance burden
- Focus on domain expertise (nutrition, AI)

### 6.3 Maintainability dengan Prisma

**Prisma meningkatkan code quality & maintainability:**

**Type Safety:**

- Database schema auto-generate TypeScript types
- Intellisense pada queries → catch errors compile-time
- Prevent "undefined is not a function" runtime errors

**Schema Evolution:**

- Modify schema via Prisma schema file (not raw SQL)
- `prisma migrate` auto-generate SQL migrations
- Clear audit trail of changes

**Relation Handling:**

- Complex queries (parent → children → scans) simplified
- `include` & `select` make relationships explicit
- Less boilerplate compared to raw SQL

**Query Performance:**

- Prisma generates optimized SQL queries
- No N+1 queries if use `include` correctly
- Can analyze generated SQL for optimization

**Team Collaboration:**

- Schema is single source of truth
- Clear migration history
- Easy onboard new developers (schema explains itself)

---

## 7. Keterbatasan Cloud & Mitigasi Risiko

### 7.1 Potential Risks

**Vendor Lock-in (Dependensi pada Supabase):**

- Semua data & operations tied ke Supabase ecosystem
- Mitigasi:
  - Supabase berbasis open-source tools (PostgreSQL, PostgREST, GoTrue)
  - Data export feature tersedia
  - Can migrate to self-hosted Supabase atau postgres provider lain
  - Use standard SQL & Prisma (portability)

**Service Downtime:**

- Jika Supabase down → aplikasi tidak dapat akses data
- Mitigasi:
  - Supabase SLA 99.9% uptime (≈ 8 jam downtime per tahun)
  - Implement fallback UI untuk offline mode (cached data)
  - Retry logic untuk failed requests
  - Monitor Supabase status page

**Cost Escalation:**

- Usage-based pricing → cost dapat meningkat unexpected
- Mitigasi:
  - Monitor usage di Supabase dashboard
  - Set budget alerts & rate limits
  - Optimize queries (prevent N+1, add indexes)
  - Archive old data jika tidak needed

**API Rate Limits:**

- Supabase has rate limits untuk prevent abuse
- Mitigasi:
  - Implement frontend request debouncing
  - Cache query results locally
  - Use Supabase cache headers
  - Request higher limits jika needed (paid plan)

### 7.2 Data Security Risks

**Data Breach:**

- Unauthorized access ke cloud database
- Mitigasi:
  - RLS policies enforce access control
  - Encryption at rest (Supabase default)
  - Regular security audits
  - Audit logging enable

**Data Loss:**

- Accidental deletion, corruption
- Mitigasi:
  - Automated daily backups by Supabase
  - Point-in-time recovery available
  - Test restore procedures regularly
  - Write-protect important tables

**Privacy Violation:**

- Store health data (nutrition) on cloud
- Mitigasi:
  - GDPR compliance (Supabase certified)
  - Data residency options (choose EU/US/Asia region)
  - Data anonymization untuk analytics
  - User consent for data collection

---

## 8. Cloud Usage Summary

### 8.1 Ringkasan Penggunaan Cloud di GiziKita

GiziKita memanfaatkan Supabase sebagai **complete backend infrastructure** bukan hanya host server:

| Aspek              | Penggunaan Cloud                           | Manfaat                               |
| ------------------ | ------------------------------------------ | ------------------------------------- |
| **Data Storage**   | PostgreSQL untuk semua data terstruktur    | ACID compliance, relational integrity |
| **User Auth**      | Supabase Auth dengan JWT & RLS             | Secure, scalable, stateless           |
| **File Storage**   | Object storage dengan CDN & signed URLs    | Fast global delivery, secure access   |
| **Access Control** | RLS policies di database layer             | Security guaranteed, performance good |
| **API Gateway**    | PostgREST auto-generated REST API          | No backend code needed, type-safe     |
| **Real-time**      | WebSocket subscriptions untuk live updates | Instant data sync across users        |
| **Backups**        | Automated daily backups dengan recovery    | Data safety, disaster recovery        |

### 8.2 Alasan Cloud Cocok untuk GiziKita

1. **Compliance** — Health data memerlukan security tinggi (RLS enforcement)
2. **Speed** — MVP dapat build cepat tanpa backend infrastructure
3. **Team Size** — Kecil tim tidak butuh DevOps full-time
4. **Growth** — Dapat scale dari ratusan ke jutaan users tanpa architectural change
5. **Focus** — Team bisa fokus AI/nutrition expertise, bukan infrastructure

### 8.3 Interaksi Web ↔ Cloud Summary

**Typical User Journey:**

```
User di Frontend (Web)
     ↓
    (HTTP Request + JWT Token)
     ↓
Supabase Cloud
     ├─ Auth Layer (verify JWT)
     ├─ RLS Layer (check access)
     ├─ Database Layer (execute query)
     ├─ Storage Layer (serve file)
     └─ Real-time Layer (broadcast changes)
     ↓
   (JSON Response)
     ↓
Frontend Render & Display
```

**Poin Kunci:**

- Frontend **stateless** (semua state di cloud)
- Cloud adalah **single source of truth**
- Security **enforced at database layer** (RLS)
- **API-first architecture** (tanpa custom backend code)
- **Scalability automatic** (no operational overhead)

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
