 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
index e215bc4ccf138bbc38ad58ad57e92135484b3c0f..de2a05c72d6b7e2cc55352ee31d56583422a2d3d 100644
--- a/README.md
+++ b/README.md
@@ -12,25 +12,35 @@ yarn dev
 pnpm dev
 # or
 bun dev
 ```
 
 Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
 
 You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
 
 This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
 
 ## Learn More
 
 To learn more about Next.js, take a look at the following resources:
 
 - [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
 - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
 
 You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
 
 ## Deploy on Vercel
 
 The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
 
 Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
+
+## Admin panel
+
+- Page: `/admin`
+- Allows:
+  - upload new images/videos;
+  - add/remove items in gallery;
+  - edit the "Картины в наличии" section.
+- Data is stored in `data/gallery.json` and `data/shop.json`.
+- Optional protection: set `ADMIN_PASSWORD` in `.env.local`. If omitted, admin endpoints work without password.
 
EOF
)