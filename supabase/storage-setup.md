# Supabase Storage

Create these **private** buckets in Supabase Storage:
- `asset-files`
- `asset-banners`
- `payment-proofs`
- `payment-settings`

Recommended limits:
- `asset-files`: 100 MB (adjust to your plan)
- `asset-banners`: 5 MB
- `payment-proofs`: 8 MB
- `payment-settings`: 5 MB

Do not make payment proofs or paid asset files public. This project creates short-lived signed URLs after server-side authorization. Browser uploads use Supabase signed upload tokens created by admin/user-authorized API routes.
