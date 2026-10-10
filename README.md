# Grill Theory – Order Online

A Node.js + Express ordering website starter for Grill Theory, with a customer menu/cart/checkout and a staff order dashboard.

## Menu details configured
- Menu prices based on the menu shared in chat.
- Coca-Cola, Pepsi, Sprite, Thums Up and water bottle: ₹20 each.
- UPI ID: `8799768006@ybl`.
- Delivery and pickup options.

## Important limitations before using for real orders
- GitHub stores the code; it does not run this Node.js backend. Deploy the app on a Node.js host such as Render.
- This starter stores orders in server memory. Orders can be lost when the server restarts/sleeps. Add a persistent database before relying on it for business orders.
- UPI is a payment handoff only. The app does not verify transactions automatically; staff must verify payments in the UPI/bank app.
- The previously discussed distance-based delivery fee is not yet implemented in this starter. Do not use it for live delivery pricing until that is added and tested.
- Set a strong `ADMIN_PIN` environment variable on the host. Never use the default PIN `2580` in production.

## Run locally
Install Node.js 20 or newer, then run:

```bash
npm install
ADMIN_PIN=change-this-pin npm start
```

Open `http://localhost:3000` for the customer menu and `http://localhost:3000/admin.html` for the staff dashboard.

## Publish via GitHub + Render
1. Create a **private GitHub repository** named `grill-theory-ordering`.
2. Upload the contents of this folder (upload the files inside the folder, not the ZIP file itself).
3. In Render, choose **New + → Blueprint** and connect the GitHub repository. Render reads `render.yaml`.
4. When prompted for `ADMIN_PIN`, enter a strong PIN that is not your phone number or `2580`.
5. Deploy and test a sample order and staff dashboard before sharing the URL.

Do not add passwords, secret keys, or `.env` files to GitHub.
