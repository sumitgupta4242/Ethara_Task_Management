# 🚀 Ethara Task Manager — Complete Deployment Guide

> Follow every step in order. Do NOT skip any step.

---

## PART 1: Push Code to GitHub

### Step 1.1 — Create a GitHub Repository

1. Open your browser and go to: **https://github.com/new**
2. Fill in:
   - **Repository name**: `Ethara_Task_Management`
   - **Description**: `Full-stack team task management system with FastAPI + React`
   - **Visibility**: Public
3. **DO NOT** check "Add a README file"
4. Click **"Create repository"**
5. You will see a page with setup instructions — keep this page open.

### Step 1.2 — Push Your Code

Open your terminal and run these commands **one by one**:

```bash
# Step 1: Go to the project folder
cd /Users/sumitgupta/.gemini/antigravity/scratch/team-task-manager

# Step 2: Check if git is already initialized
git status
```

If you see "not a git repository", run:
```bash
git init
```

Now continue:
```bash
# Step 3: Add all files
git add .

# Step 4: Commit
git commit -m "Initial commit: Ethara Task Manager"

# Step 5: Connect to your GitHub repo (use YOUR username)
git remote add origin https://github.com/sumitgupta4242/Ethara_Task_Management.git
```

If you get error "remote origin already exists", run this first:
```bash
git remote remove origin
git remote add origin https://github.com/sumitgupta4242/Ethara_Task_Management.git
```

Now push:
```bash
# Step 6: Push to GitHub
git branch -M main
git push -u origin main
```

It will ask for your GitHub username and password (or Personal Access Token).

> **If it asks for a password**: GitHub no longer accepts passwords. You need a **Personal Access Token**:
> 1. Go to: https://github.com/settings/tokens
> 2. Click **"Generate new token (classic)"**
> 3. Give it a name like `ethara-deploy`
> 4. Check the **repo** checkbox
> 5. Click **"Generate token"**
> 6. Copy the token and paste it as the password

### Step 1.3 — Verify on GitHub

1. Go to: `https://github.com/sumitgupta4242/Ethara_Task_Management`
2. You should see your `backend/` and `frontend/` folders listed
3. ✅ GitHub is done!

---

## PART 2: Create Railway Account

### Step 2.1 — Sign Up

1. Go to: **https://railway.com**
2. Click **"Login"**
3. Click **"Login with GitHub"**
4. Authorize Railway to access your GitHub
5. You now have a Railway account with **$5 free credits**

---

## PART 3: Set Up MySQL Database on Railway

### Step 3.1 — Create a New Project

1. On the Railway dashboard, click the **"+ New Project"** button
2. Click **"Empty Project"**
3. You now have an empty project

### Step 3.2 — Add MySQL Database

1. Inside your project, click **"+ New"** button (top right)
2. Click **"Database"**
3. Click **"Add MySQL"**
4. Wait 10-15 seconds — Railway creates your database automatically

### Step 3.3 — Get Database Connection URL

1. Click on the **MySQL card** that appeared in your project
2. Click on the **"Data"** tab — you can see your database here
3. Click on the **"Variables"** tab
4. Find the variable called **`MYSQL_URL`** — it looks like:
   ```
   mysql://root:SomeRandomPassword@monorail.proxy.rlwy.net:12345/railway
   ```
5. **Copy this entire URL** — save it somewhere (like Notes app), you need it soon

> ⚠️ **IMPORTANT**: You will need to modify this URL slightly. Change `mysql://` to `mysql+aiomysql://`
>
> **Before:** `mysql://root:abc123@monorail.proxy.rlwy.net:12345/railway`
>
> **After:** `mysql+aiomysql://root:abc123@monorail.proxy.rlwy.net:12345/railway`

---

## PART 4: Deploy the Backend (FastAPI)

### Step 4.1 — Add Backend Service

1. In the **same Railway project**, click **"+ New"** (top right)
2. Click **"GitHub Repo"**
3. Find and select **`Ethara_Task_Management`**
4. A new service card appears in your project

### Step 4.2 — Set Root Directory

1. Click on the new service card
2. Click the **"Settings"** tab
3. Scroll to **"Source"** section
4. Find **"Root Directory"**
5. Type: **`backend`**
6. Press Enter

### Step 4.3 — Generate a Public URL

1. Still in **"Settings"**
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. You get a URL like: `backend-production-a1b2.up.railway.app`
5. **Copy this URL** — you need it for the frontend!

### Step 4.4 — Set Environment Variables

1. Click the **"Variables"** tab
2. Click **"+ New Variable"** for each of these:

```
DATABASE_URL = mysql+aiomysql://root:PASSWORD@HOST:PORT/railway
```
*(Use the modified MYSQL_URL from Step 3.3)*

```
SECRET_KEY = ethara-prod-secret-key-8f3a9b2c-2026
```

```
ALGORITHM = HS256
```

```
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
```

```
FRONTEND_URL = https://WILL-FILL-LATER.up.railway.app
```
*(We will update this after deploying the frontend)*

### Step 4.5 — Wait for Deploy

1. Click the **"Deployments"** tab
2. You will see a deployment building — wait for it to turn **green** (Success)
3. This takes 2-4 minutes

### Step 4.6 — Verify Backend is Running

Open your browser and go to:
```
https://YOUR-BACKEND-URL.up.railway.app/api/health
```

You should see:
```json
{"status": "healthy", "app": "Ethara Task Manager", "version": "1.0.0"}
```

If you see this: ✅ Backend is live!

---

## PART 5: Deploy the Frontend (React)

### Step 5.1 — Add Frontend Service

1. In the **same Railway project**, click **"+ New"** (top right)
2. Click **"GitHub Repo"**
3. Select **`Ethara_Task_Management`** again (yes, the same repo)

### Step 5.2 — Set Root Directory

1. Click on this **new** service card (not the backend one!)
2. Click **"Settings"** tab
3. Under **"Source"** → **"Root Directory"**:
4. Type: **`frontend`**
5. Press Enter

### Step 5.3 — Generate a Public URL

1. Still in **"Settings"**
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. You get a URL like: `frontend-production-c3d4.up.railway.app`
5. **This is your LIVE APP URL!** 🎉

### Step 5.4 — Set Environment Variables

1. Click the **"Variables"** tab
2. Add this one variable:

```
VITE_API_URL = https://YOUR-BACKEND-URL.up.railway.app/api
```

> ⚠️ Replace `YOUR-BACKEND-URL` with the actual backend URL from Step 4.3.
> Make sure it ends with `/api`!
>
> Example: `https://backend-production-a1b2.up.railway.app/api`

### Step 5.5 — Wait for Deploy

1. Click the **"Deployments"** tab
2. Wait for it to turn **green** (2-3 minutes)

---

## PART 6: Connect Backend to Frontend (CORS)

### Step 6.1 — Update FRONTEND_URL

1. Go back to your **Backend service** (click on it)
2. Click **"Variables"** tab
3. Find `FRONTEND_URL`
4. Change its value to your **frontend URL** from Step 5.3:
   ```
   https://frontend-production-c3d4.up.railway.app
   ```
5. Railway will auto-redeploy the backend

---

## PART 7: Seed the Database (Add Demo Accounts)

The database is empty right now. You need to populate it with demo users and tasks.

### Option A: Using Railway Shell (Recommended)

1. Go to your **Backend service** on Railway
2. Click the **"Deployments"** tab
3. Click on the **latest active deployment** (the green one)
4. Look for a **terminal/shell icon** or click the **three dots (⋮)** menu
5. Click **"Attach Shell"** or **"Open Shell"**
6. In the shell that opens, type:

```bash
python -m app.seed
```

7. You should see:
```
============================================================
  SEED DATA CREATED SUCCESSFULLY!
============================================================
```

### Option B: Seed from Your Local Machine

If the Railway shell doesn't work, you can seed from your own computer:

```bash
# Step 1: Go to backend folder
cd /Users/sumitgupta/.gemini/antigravity/scratch/team-task-manager/backend

# Step 2: Activate virtual environment
source venv/bin/activate

# Step 3: Temporarily update .env with Railway's DATABASE_URL
# Open .env and change DATABASE_URL to:
# DATABASE_URL=mysql+aiomysql://root:PASSWORD@monorail.proxy.rlwy.net:PORT/railway
# (Use the URL from Step 3.3)

# Step 4: Run seed
python -m app.seed

# Step 5: IMPORTANT! Change .env back to local after seeding:
# DATABASE_URL=mysql+aiomysql://root:yourpassword@localhost/taskmanager
```

---

## PART 8: Test Your Live App! 🎉

### Step 8.1 — Open Your App

Go to your frontend URL in the browser:
```
https://frontend-production-xxxx.up.railway.app
```

### Step 8.2 — Login with Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@ethara.com` | `admin123` |
| **QL 1** | `ql1@ethara.com` | `ql12345` |
| **QL 2** | `ql2@ethara.com` | `ql12345` |
| **Member 1** | `member1@ethara.com` | `member123` |
| **Member 2** | `member2@ethara.com` | `member123` |
| **Member 3** | `member3@ethara.com` | `member123` |
| **Member 4** | `member4@ethara.com` | `member123` |

### Step 8.3 — Share Your Link!

Your live app is at:
```
https://frontend-production-xxxx.up.railway.app
```

Your API docs are at:
```
https://backend-production-xxxx.up.railway.app/docs
```

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend deploy fails with "module not found" | Make sure Root Directory is set to `backend` in Settings |
| Frontend shows blank white page | Check that `VITE_API_URL` is correct in Variables. Redeploy. |
| Login says "Network Error" | Check that `FRONTEND_URL` on backend matches your frontend URL exactly |
| Login says "Authentication failed" | Database is empty — run the seed script (Part 7) |
| "CORS error" in browser console | Update `FRONTEND_URL` variable on backend to match your exact frontend URL |
| Deploy stuck on "Building" | Go to Deployments → click the stuck one → "Cancel" → it will auto-retry |

---

## 📁 Final Project Architecture on Railway

```
Railway Project
├── 🗄️  MySQL Database (auto-managed)
├── ⚙️  Backend Service (FastAPI)
│   ├── Root Directory: backend/
│   ├── Variables: DATABASE_URL, SECRET_KEY, FRONTEND_URL, etc.
│   └── Domain: backend-xxx.up.railway.app
└── 🖥️  Frontend Service (React + Vite)
    ├── Root Directory: frontend/
    ├── Variables: VITE_API_URL
    └── Domain: frontend-xxx.up.railway.app  ← YOUR LIVE LINK
```

---

**🎉 Congratulations! Your Ethara Task Manager is now live on the internet!**
