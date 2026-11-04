# EchoTwins AI — Cognitive Learning Platform

EchoTwins AI is an intelligent question-solving assistant that guides learners through complex academic problems with step-by-step cognitive reasoning. Rather than returning a single opaque output, it presents three distinct analytical approaches, derives the verified exact solution, and reads it aloud with voice synthesis. Built for learners seeking conceptual mastery across mathematics, science, engineering, and logic.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Responsive Vanilla HTML5, CSS3, JavaScript (Light & Dark themes, Web Speech API, Mobile-ready 375px+) |
| **Backend** | Python `ThreadingHTTPServer` + SQLAlchemy (`pg8000` driver, connection pooling) |
| **AI Providers** | Groq (`openai/gpt-oss-120b`), Google Gemini (`gemini-2.0-flash`), OpenRouter via unified `openai` client |
| **Sessions** | Cryptographic HMAC-SHA256 session tokens stored in `HttpOnly; SameSite=Lax` cookies |
| **Database** | Supabase PostgreSQL (transaction pooler port 6543) with verified SSL via `supabase-ca.crt` |

---

## Local Development Setup

### 1. Prerequisites
- Python 3.10+
- Pip package manager

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration (`.env`)
Create `.env` by copying `.env.example`:
```bash
copy .env.example .env
```

Configure `.env` with your credentials (all values remain private and are ignored by Git):
```ini
# Supabase PostgreSQL (transaction pooler port 6543)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Allow local SQLite fallback (set to true only for local testing without internet)
ALLOW_SQLITE=false

# Optional custom CA file (defaults to supabase-ca.crt in project root)
SSL_CA_FILE=supabase-ca.crt

# HMAC Session Signing Key (must be at least 32 characters)
SECRET_KEY=change_this_to_at_least_32_random_characters_in_production

# Admin API header secret
ADMIN_SECRET=change_this_to_at_least_32_random_hex_characters_in_production

# Cookie Security (set to true in production with HTTPS)
COOKIE_SECURE=false

# Port & Server Binding
PORT=3000

# AI Provider Configuration
PROVIDER=groq
MODEL=openai/gpt-oss-120b

# AI Provider Keys
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=
OPENROUTER_API_KEY=
```

### 4. Run the Server
```bash
python server.py
```
Open `http://localhost:3000` in your browser.

---

## Deploying on Render

To deploy EchoTwins AI on [Render](https://render.com) as a Web Service:

1. **Create a New Web Service:**
   - Link your GitHub repository (`https://github.com/Aman7644/meta.git`).
   - **Environment:** `Python 3`
   - **Region:** Choose a region close to your Supabase instance (e.g. Frankfurt / EU Central).
   - **Build Command:**
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     python server.py
     ```

2. **Configure Environment Variables in Render Dashboard:**
   Under **Environment Variables**, add the following keys:
   - `DATABASE_URL`: Your Supabase pooler string (e.g. `postgresql://postgres.[ref]:[password]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`)
   - `SECRET_KEY`: A random 32+ character string
   - `ADMIN_SECRET`: A random 32+ character hex string
   - `COOKIE_SECURE`: `true` (Render provides automatic HTTPS)
   - `PROVIDER`: `groq`
   - `MODEL`: `openai/gpt-oss-120b`
   - `GROQ_API_KEY`: Your Groq API key
   - `ALLOW_SQLITE`: `false`

3. **SSL Certificate (`supabase-ca.crt`):**
   - `supabase-ca.crt` is committed to the repository and tracked by Git.
   - `db.py` automatically detects and loads `supabase-ca.crt` from its directory to verify the SSL connection to Supabase pooler.

4. **Health Check Path:**
   - Render Health Check Endpoint: `/health` (returns `{"ok": true}` without touching the database).

---

## Managing Administrative Access

To promote an account to Admin:
1. Register your student account via `http://localhost:3000/login.html` (or your Render live URL).
2. Open your **Supabase Dashboard** &rarr; **SQL Editor**.
3. Run the following parameterized query:
   ```sql
   UPDATE students
   SET role = 'admin'
   WHERE email = 'YOUR_EMAIL_HERE';
   ```
4. Sign out and sign back in. The Admin Panel at `/admin.html` will automatically unlock with full student metrics and export options.

---

## Security Architecture Highlights

- **Zero Client-Side Credentials:** API keys, database URLs, and cryptographic secrets live exclusively in `.env` and `server.py`. No client file ever has access to credentials.
- **Strict Static File Allowlist:** The static handler only serves public UI assets (`.html`, `.css`, `.js`, images, audio). Any request for `.env`, `server.py`, `db.py`, `students.json`, `.git`, or dotfiles returns `404 Not Found`.
- **Database Connection Security:** Strict SSL certificate verification with hostname verification enabled using the root CA bundle (`supabase-ca.crt`).
- **Rate Limiting:** Protects `/api/solve` with an in-memory sliding window limiter (10 requests per minute per user).
