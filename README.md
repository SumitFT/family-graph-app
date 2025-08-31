# Family Graph App (Next.js + Supabase)

MVP app to create and explore extended family trees, with search by name/sex/age group/city/parents/spouse/profession, photo upload, and a zoomable tree view.

## Quick Start
1) Create a Supabase project; copy the **URL** and **anon key** to `.env.local`.
2) In Supabase SQL Editor, run `sql/schema.sql` then (optionally) `sql/seed.sql`.
3) Create storage buckets by running the commands in `sql/storage.sql`.
4) `npm install` then `npm run dev` to run locally.
5) Deploy to Vercel; set env vars; done.
