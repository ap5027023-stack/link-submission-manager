# Link Submission Manager

A full-stack web application for managing user link submissions with Google Sheets as the database. Built with Next.js 14, TypeScript, and Tailwind CSS.

---

## Features

- **Admin Panel** — Create/edit/delete users, set submission limits, manage all submitted links
- **User Panel** — Submit links, view history, track remaining quota
- **Google Sheets Storage** — All data stored in two sheets (Users, Links)
- **JWT Authentication** — Secure, cookie-based auth for both admin and users
- **Responsive UI** — Works on desktop and mobile

---

## Project Structure

```
link-submission-manager/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts          # User login
│   │   │   │   ├── admin-login/route.ts    # Admin login
│   │   │   │   ├── logout/route.ts         # Logout
│   │   │   │   └── setup/route.ts          # First-run setup
│   │   │   ├── admin/
│   │   │   │   ├── users/route.ts          # GET all users, POST create user
│   │   │   │   ├── users/[id]/route.ts     # PUT update, DELETE user
│   │   │   │   ├── links/route.ts          # GET all links
│   │   │   │   └── links/[id]/route.ts     # DELETE link
│   │   │   └── user/
│   │   │       ├── submit/route.ts         # POST submit link
│   │   │       └── links/route.ts          # GET user's links + stats
│   │   ├── admin/
│   │   │   ├── login/page.tsx              # Admin login page
│   │   │   ├── users/page.tsx              # User management
│   │   │   └── links/page.tsx              # Link management
│   │   ├── user/
│   │   │   ├── dashboard/page.tsx          # User dashboard
│   │   │   ├── submit/page.tsx             # Submit link form
│   │   │   └── history/page.tsx            # Submission history
│   │   ├── login/page.tsx                  # User login page
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # Redirect logic
│   │   └── globals.css
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── DashboardShell.tsx
│   ├── lib/
│   │   ├── sheets.ts                       # Google Sheets CRUD
│   │   └── auth.ts                         # JWT + bcrypt helpers
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts                       # Route protection
├── .env.local.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Setup Guide

### Step 1: Clone and Install

```bash
git clone <repo-url>
cd link-submission-manager
npm install
```

### Step 2: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it "Link Submission Manager" (or anything you like)
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_ID]/edit
   ```

### Step 3: Set Up Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" → "Library"
   - Search "Google Sheets API" → Enable
4. Create a Service Account:
   - "APIs & Services" → "Credentials" → "Create Credentials" → "Service Account"
   - Name it anything (e.g., "link-manager")
   - Click "Done"
5. Create a JSON key:
   - Click on the service account → "Keys" tab → "Add Key" → "Create new key" → JSON
   - Download the JSON file
6. Share your Google Sheet with the service account email:
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (looks like: `name@project.iam.gserviceaccount.com`)
   - Give it **Editor** access

### Step 4: Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# From step 2 — the ID in your Google Sheets URL
GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# From your service account JSON ("client_email" field)
GOOGLE_SERVICE_ACCOUNT_EMAIL=link-manager@my-project.iam.gserviceaccount.com

# From your service account JSON ("private_key" field) — keep the quotes and \n characters
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCA...\n-----END RSA PRIVATE KEY-----\n"

# A long random string for JWT signing — use: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin account credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecureAdminPass123!
```

> **Tip for GOOGLE_PRIVATE_KEY**: Open your downloaded JSON file, find the `private_key` field, and paste its entire value (including the `-----BEGIN...` and `-----END...` lines) into the `.env.local` file, wrapped in double quotes.

### Step 5: Run First-Time Setup

Start the dev server:

```bash
npm run dev
```

Then run the setup endpoint to initialize the Google Sheets and create the admin account:

```bash
curl -X POST http://localhost:3000/api/auth/setup
```

Or open in browser: `http://localhost:3000/api/auth/setup` with a POST request tool.

You should see: `{"success":true,"message":"Admin account created successfully."}`

### Step 6: Log In

- **Admin login**: http://localhost:3000/admin/login
- **User login**: http://localhost:3000/login

---

## Google Sheets Schema

### Sheet 1: Users
| Column | Description |
|--------|-------------|
| User ID | UUID |
| Name | Display name |
| Email | Login email |
| Password Hash | bcrypt hash |
| Submission Limit | Max links allowed |
| Status | `active` or `disabled` |
| Created Date | ISO timestamp |
| Role | `admin` or `user` |

### Sheet 2: Links
| Column | Description |
|--------|-------------|
| Submission ID | UUID |
| User ID | Linked user UUID |
| User Email | Email at time of submission |
| Link | The submitted URL |
| Timestamp | ISO timestamp |

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy!
5. After deploying, run setup: `POST https://your-domain.vercel.app/api/auth/setup`

### Important for Vercel / Production

For `GOOGLE_PRIVATE_KEY` in Vercel's environment variables:
- Paste the key **without** outer quotes
- Vercel handles the escaping automatically

---

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 7 days
- Admin routes are protected both by middleware and API-level checks
- Users can only access their own data
- Disabled accounts cannot log in

---

## Customization

### Adding More Limit Presets

Edit `src/app/admin/users/UsersClient.tsx`:
```typescript
const LIMIT_PRESETS = [50, 100, 200, 300, 500, 1000]; // Add your values
```

### Changing Token Expiry

Edit `src/lib/auth.ts`:
```typescript
.setExpirationTime("7d") // Change to "1d", "30d", etc.
```

### Changing Session Cookie Duration

Edit `src/app/api/auth/login/route.ts`:
```typescript
maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
```
