# Fu Jen imMBA website

English-first redesign of the [MBA Program in International Management](https://www.management.fju.edu.tw/esubweb/immbaengindex/) at Fu Jen Catholic University.

One Next.js project. The program pages stay at their current addresses. The student market is the `/market` section, with its own sign-in. An administrator of the market approves buyers and sellers.

## Local preview

```bash
npm install
npm run dev
```

The dev server listens on port 3847. The program home is `/`. The student market is `/market`.

## Publish on Vercel

Import `carlosd531/fjcu-immba-website` and let Vercel detect Next.js. The program pages are the HTML files in `public/`. The market uses the class Supabase project. If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset, the app uses the public address and publishable key already in the code. Do not add the service-role key.

Content is adapted from the official College of Management pages for a teaching demonstration. Admissions, tuition, and partner rules should always be confirmed on the university systems linked from this site.
