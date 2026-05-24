# Inked Anime Tattoo Store

Premium anime/tattoo e-commerce starter built with Next.js, Prisma, Tailwind, OTP email login, Google login scaffold, Razorpay checkout and admin dashboard.

## Run locally on Windows

```bash
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev --name latest_store_fixes
npm run seed
npm run dev
```

Open `http://localhost:3000`.

If your local database has old test data or migrations fail after this update, run:

```bash
npx prisma migrate reset
npm run seed
npm run dev
```

## Admin login

Set your admin email in `.env`:

```env
ADMIN_EMAIL="your-email@gmail.com"
```

Then sign up or login with the same email. Admin-only links will appear after login.

## New fixes in this version

- Checkout session cookie handling improved for OTP login.
- Unknown-login users now see popup and are redirected to signup.
- Mobile retractable side menu added.
- Search works on desktop and phone.
- Login redirects user back to the page they came from when a redirect is provided.
- Products support multiple images. Product detail page has an Amazon-like image carousel with thumbnails.
- Admin can add/edit multiple image URLs per product.
- Cart quantity cannot exceed available product stock.
- Admin can add product-level discounts, flat discounts and Buy 1 Get 1.
- Admin can bulk-apply discounts to multiple products.
- Admin can create/remove coupon codes.
- Customer can apply coupon at checkout.
- Product cards/detail show MRP crossed out, discounted price and discount percent when a discount exists.
- Demo checkout creates a paid order when Razorpay keys are blank.

## Test coupon

Seed creates coupon:

```text
ANIME10
```

Use it on the cart page.
