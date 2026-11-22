# VIZIONSTORE

A Next.js 15 + Supabase digital-assets marketplace with a dark violet responsive UI, account system, user dashboard, admin tools and manual payment approval.

## Included features

- Marketplace home page, featured products and responsive asset catalogue
- Search, category filter, free/paid filter and price/popularity sorting
- Email/password registration and login (bcrypt password hashes + signed httpOnly session cookie)
- The first successfully registered account is assigned the admin role by a database trigger; later accounts are regular users
- User dashboard, purchase history, profile name and password update
- Admin-only dashboard, asset create/edit/publish/delete and category create/edit/delete
- Private asset and banner uploads using short-lived Supabase signed upload tokens
- Paid checkout with UPI/QR instructions and direct-to-Supabase payment screenshot upload
- Admin order review with manual approve/reject and rejection reason
- Approved paid purchases receive short-lived signed download links; free assets require login too
- Admin payment settings for QR image, UPI ID, instructions and Discord support invite

## Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run the complete `supabase/schema.sql` file.
3. Create the four **private** Storage buckets described in `supabase/storage-setup.md`, with the listed size limits.
4. Copy `.env.example` to `.env.local` and fill in all values. Use a long random `JWT_SECRET` (at least 32 characters). Never expose or commit the service-role key.
5. Install dependencies with `npm install` and start locally with `npm run dev`.
6. Push the project to GitHub and import it into Vercel. Add the same environment variables in Vercel, then deploy.
7. Register the first account. That account becomes the admin. Registering a second account first and expecting it to become admin will not work.
8. Sign in as admin, create categories and assets, upload a download file, then publish the asset. Configure the payment QR/UPI settings before accepting paid orders.

## Storage buckets

Create these buckets as private. Suggested limits:

| Bucket | Suggested maximum |
|---|---:|
| `asset-files` | 100 MB |
| `asset-banners` | 5 MB |
| `payment-proofs` | 8 MB |
| `payment-settings` | 5 MB |

The upload endpoint currently accepts common archive, document, Minecraft-pack, configuration and media file extensions. Your Supabase plan and bucket limits must permit the selected upload size.

## Payment workflow

Payment verification is **manual**, not automated. A buyer submits a screenshot, an admin checks the payment independently in the receiving payment account, then approves or rejects the order. Never approve based only on a screenshot if the payment has not actually arrived. A responsible adult should configure and supervise payment accounts if the store operator is under 18.

## Security and deployment notes

- Supabase tables have RLS enabled and no public table policies. Server-side operations use the service-role key only after checking the signed session and database role.
- Paid asset files, payment proofs and QR settings must remain in private buckets. Do not change them to public.
- The first-admin trigger uses a transaction-scoped advisory lock to serialize simultaneous first registrations.
- Download-counter RPC execution is restricted to the Supabase service role.
- Before using this for a real public store, add production-grade rate limiting, abuse monitoring, backups, operational logging and a formal payment/refund process. This project does not include a payment gateway or automated payment verification.

## Scripts

- `npm run dev` — local development
- `npm run typecheck` — TypeScript check
- `npm run build` — production build
