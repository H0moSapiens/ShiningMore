# SCENTLUX — Perfume E-Commerce

A luxury perfume e-commerce website built with **Next.js** and **NeonDB**, deployable to **Vercel**.

> Next.js is a full-stack framework — your frontend (React pages) and backend (API routes) are deployed together on Vercel as one project. No separate backend server is needed.

---

## 🛠 Local Development Setup

### Step 1 — Install Node.js
Download and install Node.js v18+ from nodejs.org

### Step 2 — Install Dependencies
Open a terminal in the `perfume-shop` folder:
```bash
npm install
```

### Step 3 — Set Up NeonDB
1. Go to neon.tech and create a free account
2. Click "New Project", name it `scentlux`, click Create
3. On the dashboard go to Connection Details
4. Copy the Connection string (looks like postgresql://user:pass@host/db?sslmode=require)

### Step 4 — Configure Environment Variables
Open `.env.local` and fill it in:
```env
DATABASE_URL=postgresql://your_full_connection_string_here
JWT_SECRET=make_up_any_long_random_string_here
```

### Step 5 — Initialize the Database
```bash
npm run db:push
```

### Step 6 — Run Locally
```bash
npm run dev
```
Visit http://localhost:3000

---

## Default Admin Credentials
- Email: admin@scentlux.com
- Password: admin123

---

## Deploying to Vercel

Next.js deploys both the frontend and all API routes on Vercel — no separate backend server is needed. Your /src/pages/api/ routes automatically become serverless functions.

### Part A — Push Code to GitHub

1. Install Git from git-scm.com if you haven't
2. Create a GitHub account at github.com
3. Create a new repository on GitHub (click + > New repository, name it perfume-shop, do NOT initialize with README)
4. In your project terminal, run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Part B — Deploy on Vercel

1. Create a Vercel account at vercel.com (sign up with GitHub for easiest setup)
2. On the Vercel dashboard, click "Add New..." > Project
3. Find `perfume-shop` in your GitHub repos and click Import
4. Vercel auto-detects Next.js — leave all build settings as default
5. Add Environment Variables (scroll down on the config page):

| Name | Value |
|------|-------|
| DATABASE_URL | Your NeonDB connection string |
| JWT_SECRET | Your secret key string |

6. Click Deploy — your site will be live in 1-2 minutes at a URL like https://perfume-shop-xyz.vercel.app

### Part C — Initialize the Database

Run this once from your local machine (it connects directly to NeonDB):
```bash
npm run db:push
```

### Part D — Update the Live Site After Code Changes

```bash
git add .
git commit -m "Your change description"
git push
```
Vercel auto-redeploys on every push.

---

## Database Export (Excel)

In Admin Panel > Database Export tab:
- Preview any of the 4 tables live
- Export This Sheet — downloads current table as .xlsx
- Export All Tables — downloads all 4 tables + summary sheet in one .xlsx file

---

## Project Structure

```
perfume-shop/
├── vercel.json                 Vercel deployment config
├── .gitignore                  Files excluded from GitHub
├── .env.local                  Local secrets (NEVER push this)
├── next.config.js
├── tailwind.config.js
├── package.json
└── src/
    ├── components/Navbar.js
    ├── lib/
    │   ├── db.js               NeonDB connection
    │   ├── db-init.js          Database setup script
    │   └── auth.js             JWT helpers
    ├── pages/
    │   ├── index.js            Homepage
    │   ├── shop.js             Product browsing
    │   ├── cart.js             Cart + QRIS payment
    │   ├── account.js          Login / Register
    │   ├── admin.js            Admin dashboard
    │   └── api/
    │       ├── auth/           login, logout, register, me
    │       ├── products/       GET list, POST new
    │       ├── transactions/   GET history, POST order
    │       └── admin/
    │           ├── users.js    Manage user roles
    │           └── export.js   Table data for Excel export
    └── styles/globals.css
```

---

## Database Schema

| Table | Key Columns |
|-------|-------------|
| users | id, name, email, password, role |
| products | id, name, brand, category, price, stock, size_ml |
| transactions | id, user_id, total_amount, status |
| transaction_items | id, transaction_id, product_id, quantity, price_at_purchase |
