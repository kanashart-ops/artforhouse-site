# Admin + Blob + Postgres setup

## 1. Environment variables

Add these variables to `.env.local` locally and to Vercel Project Settings in production:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me-now
ADMIN_SESSION_SECRET=long-random-string
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
```

## 2. What is already prepared in the project

- `/admin` now has a login screen based on `ADMIN_USERNAME` + `ADMIN_PASSWORD`.
- After login, the admin can:
  - add images to the gallery;
  - add paintings to the “В наличии” section;
  - upload local files through the admin API;
  - save content without editing JSON manually.
- A Prisma schema is prepared in `prisma/schema.prisma` for moving cards into Postgres.

## 3. Prisma migration commands

When npm access is available in your environment, install and initialize Prisma:

```bash
npm install prisma @prisma/client @vercel/blob
npx prisma generate
npx prisma db push
```

## 4. Moving existing local images to Vercel Blob

Recommended approach:

1. Create a public Blob store in the Vercel dashboard.
2. Add `BLOB_READ_WRITE_TOKEN` to the project.
3. Install the Vercel CLI locally if you want a one-time bulk migration.
4. Upload old folders with commands like:

```bash
vercel blob put public/images/gallery/q1.jpg --pathname gallery/q1.jpg
vercel blob put public/images/shop/1.jpg --pathname shop/1.jpg
```

5. Replace saved `src` values in content records with the returned Blob URLs.

## 5. Recommended production flow

Best long-term flow:

1. Admin logs into `/admin`.
2. Image uploads go to Vercel Blob.
3. Card metadata goes to Postgres through Prisma.
4. Public pages read gallery/shop/article data from the database.

At the moment, the repository is prepared for this structure, but because the execution environment blocked npm package installation, the runtime is still using the existing JSON storage as the live fallback.
