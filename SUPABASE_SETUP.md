# 🚀 Supabase Setup Guide

This guide will help you set up Supabase as the backend for your wedding invitation website.

## 📋 Prerequisites

- A free Supabase account (sign up at [supabase.com](https://supabase.com))
- Your wedding invitation files ready to deploy

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `wedding-invitation` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest region to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for your project to be created

---

## Step 2: Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste this SQL code:

```sql
-- Create the rsvps table
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  attending TEXT CHECK (attending IN ('yes', 'no')) NOT NULL,
  number_of_guests INTEGER CHECK (number_of_guests BETWEEN 1 AND 10),
  message TEXT CHECK (length(message) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert RSVPs
CREATE POLICY "Anyone can submit RSVP"
  ON rsvps
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow anyone to read RSVPs (optional - for stats)
CREATE POLICY "Anyone can view RSVPs"
  ON rsvps
  FOR SELECT
  TO anon
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at DESC);
CREATE INDEX idx_rsvps_attending ON rsvps(attending);
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: `Success. No rows returned`

---

## Step 3: Get Your Supabase Credentials

1. Go to **Settings** (gear icon in sidebar) → **API**
2. Find and copy these two values:

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

3. Keep these safe - you'll need them in the next step

---

## Step 4: Configure Your Frontend

1. Open `/public/js/main.js`
2. Find the `CONFIG` object at the top (around lines 6-11):

```javascript
const CONFIG = {
  // Supabase Configuration
  // Replace these with your actual Supabase project credentials
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

3. Replace the placeholder values with your actual credentials:

```javascript
const CONFIG = {
  // Supabase Configuration
  supabaseUrl: 'https://xxxxxxxxxxxxx.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

4. Save the file

---

## Step 5: Test Locally

1. Open `/public/index.html` in your browser (or use a local server)
2. Scroll to the RSVP section
3. Fill out the form and click submit
4. If successful, you should see: **"شكراً لتأكيد حضوركم! نتطلع لرؤيتكم 💕"**

### Verify Data in Supabase:

1. Go to **Table Editor** in Supabase dashboard
2. Click on the **rsvps** table
3. You should see your test entry!

---

## Step 6: Deploy Your Frontend

Since your app now uses Supabase directly, you **no longer need to host a backend**. You can deploy the frontend to any static hosting service:

### Option A: GitHub Pages (Free)

1. Push your code to a GitHub repository
2. Go to repository **Settings** → **Pages**
3. Under **Source**, select your branch (e.g., `main`)
4. Set folder to `/public` or root (depending on your setup)
5. Click **Save**
6. Your site will be available at: `https://yourusername.github.io/repo-name`

### Option B: Netlify (Free)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `/public` folder
3. Done! Your site is live

### Option C: Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Set **Root Directory** to `public`
4. Deploy!

### Option D: Supabase Storage (Free)

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket called `wedding-site`
3. Upload all files from `/public` folder
4. Make bucket public
5. Access via Supabase CDN URL

---

## 📊 View Your RSVPs

### Option 1: Supabase Dashboard

1. Go to **Table Editor** in your Supabase dashboard
2. Click on **rsvps** table
3. View all responses with filters and search

### Option 2: Create an Admin Page (Optional)

Create a simple admin page to view stats:

```html
<!-- admin.html -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>لوحة التحكم - RSVPs</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <h1>حالة تأكيدات الحضور</h1>
  <div id="stats"></div>
  <table id="rsvpTable"></table>

  <script>
    const supabase = window.supabase.createClient(
      'YOUR_SUPABASE_URL',
      'YOUR_SUPABASE_ANON_KEY'
    );

    async function loadRSVPs() {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      // Calculate stats
      const total = data.length;
      const attending = data.filter(r => r.attending === 'yes').length;
      const notAttending = data.filter(r => r.attending === 'no').length;
      const totalGuests = data
        .filter(r => r.attending === 'yes')
        .reduce((sum, r) => sum + (r.number_of_guests || 0), 0);

      document.getElementById('stats').innerHTML = `
        <p>إجمالي الردود: ${total}</p>
        <p>سيحضرون: ${attending} (${totalGuests} ضيف)</p>
        <p>لن يحضروا: ${notAttending}</p>
      `;

      // Display table
      const table = document.getElementById('rsvpTable');
      table.innerHTML = `
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الحضور</th>
            <th>عدد الضيوف</th>
            <th>الرسالة</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(r => `
            <tr>
              <td>${r.name}</td>
              <td>${r.attending === 'yes' ? '✅ سيحضر' : '❌ لن يحضر'}</td>
              <td>${r.number_of_guests || '-'}</td>
              <td>${r.message || '-'}</td>
              <td>${new Date(r.created_at).toLocaleString('ar-EG')}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
    }

    loadRSVPs();
  </script>
</body>
</html>
```

---

## 🔐 Security Notes

### Row Level Security (RLS)

The SQL script above enables RLS with policies that:
- ✅ Allow anyone to **insert** new RSVPs (anonymous users can submit)
- ✅ Allow anyone to **read** RSVPs (for stats display)
- ❌ Prevent **updates** and **deletes** (only admins via dashboard)

### Protecting Your Admin View

If you create an admin page, you may want to add authentication:

1. In Supabase dashboard, go to **Authentication** → **Policies**
2. Modify the SELECT policy to require authentication
3. Use Supabase Auth to create an admin user

---

## 💰 Pricing

Supabase Free Tier includes:
- ✅ Unlimited API requests
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth per month
- ✅ Row Level Security
- ✅ Auto-generated APIs

**This is more than enough for a wedding invitation!** Even with 500 guests submitting RSVPs, you'll stay well within the free tier.

---

## 🆘 Troubleshooting

### "Supabase not configured" message
- Check that you replaced `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in `main.js`
- Make sure the values are in quotes

### "Failed to insert" error
- Verify the table was created correctly (check Table Editor)
- Ensure RLS policies are set up
- Check browser console for detailed error messages

### Data not saving
- Open browser DevTools (F12) → Console tab
- Look for red error messages
- Common issue: CORS errors (shouldn't happen with Supabase, but check Project Settings → API)

### Can't see data in dashboard
- Go to Table Editor → rsvps
- Click refresh icon
- If empty, try submitting a test RSVP

---

## 📞 Support

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [https://discord.supabase.com](https://discord.supabase.com)
- **Check browser console** for error messages

---

## ✅ Checklist

- [ ] Created Supabase project
- [ ] Ran SQL to create `rsvps` table
- [ ] Copied Project URL and anon key
- [ ] Updated `CONFIG` in `/public/js/main.js`
- [ ] Tested RSVP form locally
- [ ] Verified data appears in Supabase Table Editor
- [ ] Deployed frontend to static hosting
- [ ] Tested RSVP on live site

---

## 🎉 You're Done!

Your wedding invitation now runs entirely on Supabase with no backend server needed. All RSVPs are stored securely in your Supabase PostgreSQL database.

**Benefits:**
- ✅ No backend server to maintain
- ✅ Free hosting (Supabase + GitHub Pages/Netlify)
- ✅ Automatic backups
- ✅ Real-time data updates
- ✅ Secure and scalable

Congratulations! 💒💕
