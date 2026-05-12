# LINE Stock Bot

ระบบ LINE Chatbot เช็กจำนวนสินค้าคงเหลือแบบ real-time ได้ โดยตอนนี้ใช้ mock data ก่อน และเตรียมเปลี่ยนไปเชื่อมฐานข้อมูล/API ส่วนกลางภายหลัง

## 1) ติดตั้ง

```bash
npm install
cp .env.example .env
```

แก้ `.env`:

```env
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx
PORT=3000
INVENTORY_SOURCE=mock
```

## 2) รัน

```bash
npm run dev
```

หรือ production:

```bash
npm start
```

## 3) ทดสอบ local ด้วย ngrok

```bash
ngrok http 3000
```

นำ URL ไปใส่ LINE Developers:

```text
https://xxxx.ngrok-free.app/webhook
```

แล้วเปิด Use webhook

## 4) แก้สินค้า mock

แก้ไฟล์:

```text
data/products.json
```

ตัวอย่างสินค้า:

```json
{
  "sku": "IP15-BLK-128",
  "name": "iPhone 15 สีดำ 128GB",
  "aliases": ["iphone 15", "ไอโฟน 15"],
  "stock": 12,
  "unit": "เครื่อง"
}
```

## 5) เปลี่ยนไปเชื่อม API ส่วนกลางภายหลัง

เปลี่ยน `.env`:

```env
INVENTORY_SOURCE=central_api
CENTRAL_API_BASE_URL=https://your-company-api.com/api
CENTRAL_API_TOKEN=xxx
```

ระบบจะเรียก:

```text
GET /inventory/search?q=ชื่อสินค้า
```

และคาดหวัง response:

```json
{
  "product": {
    "sku": "IP15-BLK-128",
    "name": "iPhone 15 สีดำ 128GB",
    "stock": 12,
    "unit": "เครื่อง"
  }
}
```

## จุดที่กันบัคแล้ว

- ตรวจ `x-line-signature` ก่อนประมวลผล webhook
- ใช้ raw body สำหรับตรวจ signature
- จำกัด rate limit
- ตัดข้อความตอบไม่ให้เกิน limit พื้นฐาน
- รองรับ event ที่ไม่ใช่ text โดยไม่ crash
- จัดการ JSON parse error
- จัดการกรณีหา product ไม่เจอ
- แยก inventory source เพื่อเปลี่ยนจาก mock เป็น API กลางง่าย
