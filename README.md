# Fu Jen imMBA website

English-first redesign of the [MBA Program in International Management](https://www.management.fju.edu.tw/esubweb/immbaengindex/) at Fu Jen Catholic University.

Static HTML, CSS, and JavaScript. No build step. Ready to publish on Vercel as a static site.

## Local preview

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

Then visit http://127.0.0.1:5173

## Publish on Vercel

This folder is configured with `vercel.json` (static HTML, `cleanUrls`, security headers). From the project root:

```bash
npx vercel login
npx vercel link
npx vercel --prod
```

Or import `carlosd531/fjcu-immba-website` in the Vercel dashboard, leave **Framework Preset** as Other, and deploy. Production uses `index.html` as the homepage.

Content is adapted from the official College of Management pages for a teaching demonstration. Admissions, tuition, and partner rules should always be confirmed on the university systems linked from this site.
