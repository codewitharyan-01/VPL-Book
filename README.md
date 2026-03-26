# 🏏 VPL Season 2 – 2026

**Valand Première League Season 2** — Official Website  
*Savaso Juth Limbach Samaj · 21 March – 31 March 2026*

---

## 🚀 Setup & Deployment

### 1. Clone / Download
```bash
git clone https://github.com/YOUR_USERNAME/vpl-website.git
cd vpl-website
```

### 2. Add the QR Code Image
The QR code image (`assets/qr-payment.png`) is already included in this repo.  
If you need to replace it, add your UPI QR image at `assets/qr-payment.png`.

### 3. Configure imgbb API Key (for image uploads)

The booking form uploads payment screenshots via **imgbb** (free image hosting).

**Steps:**
1. Go to [https://imgbb.com/login](https://imgbb.com/login) and create a free account
2. Navigate to **API** section → generate your free API key
3. Open `js/script.js` and replace line:
   ```js
   const IMGBB_API_KEY = "YOUR_IMGBB_API_KEY";
   ```
   with your actual key:
   ```js
   const IMGBB_API_KEY = "abc123yourkeyhere";
   ```

> ⚠️ Without the imgbb key, the WhatsApp message will still be sent with all booking details — but without the image URL. The user's WhatsApp will open pre-filled; they should manually attach the screenshot.

### 4. Deploy to GitHub Pages
1. Push to your GitHub repo
2. Go to **Settings → Pages**
3. Set Source to `main` branch, root `/`
4. Your site will be live at `https://YOUR_USERNAME.github.io/vpl-website/`

---

## 📁 Project Structure

```
vpl-website/
├── index.html          ← Main website file
├── css/
│   └── style.css       ← All styles
├── js/
│   └── script.js       ← Form logic, WhatsApp integration
├── assets/
│   └── qr-payment.png  ← UPI QR code image
└── README.md
```

---

## 📲 How Booking Works

1. Visitor fills in **Name**, **Phone**, **Number of Persons**
2. Total amount is auto-calculated (₹20 × persons)
3. Visitor scans the QR code and pays via any UPI app
4. Visitor uploads **payment screenshot**
5. On submit → screenshot is uploaded to imgbb → WhatsApp opens with a pre-filled message containing all booking details + image link
6. Visitor sends the WhatsApp message to the organizer

---

## 📞 WhatsApp Contact
Booking confirmations go to: **+91 9427358184**

---

## 🎨 Tech Stack
- Pure HTML5 + CSS3 + Vanilla JavaScript
- Google Fonts (Bebas Neue + Rajdhani)
- imgbb API (free image hosting)
- WhatsApp Click-to-Chat API

---

*Made with ❤️ for the VPL Community*
