# Py-Translate Web

Phiên bản web của ứng dụng Py-Translate, cho phép dịch văn bản giữa nhiều ngôn ngữ.

## Tính năng

- Dịch văn bản giữa nhiều ngôn ngữ
- Phát âm văn bản đầu vào và kết quả dịch
- Nhận dạng văn bản từ hình ảnh (OCR)
- Nhận dạng giọng nói và dịch
- Giao diện hiện đại, dễ sử dụng

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js (phiên bản 14.x trở lên)
- npm hoặc yarn

### Cài đặt

```bash
# Clone dự án
git clone https://github.com/HoangPhc/Py-Translate

# Di chuyển vào thư mục dự án
cd py-translate-web

# Cài đặt các gói phụ thuộc
npm install
```

### Chạy dự án

```bash
# Chạy ở môi trường phát triển
npm start

# Build dự án cho môi trường production
npm run build
```

## Triển khai lên Vercel

### Cách 1: Triển khai qua Vercel CLI

1. Cài đặt Vercel CLI:
```bash
npm install -g vercel
```

2. Đăng nhập vào Vercel:
```bash
vercel login
```

3. Triển khai dự án:
```bash
# Di chuyển vào thư mục dự án
cd py-translate-web

# Triển khai lên Vercel
vercel
```

4. Làm theo các hướng dẫn trên màn hình để hoàn tất quá trình triển khai.

### Cách 2: Triển khai qua GitHub

1. Đẩy dự án lên GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/Py-Translate.git
git push -u origin master
```

2. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)

3. Nhấp vào "New Project"

4. Chọn "Import Git Repository" và chọn repository GitHub của bạn

5. Cấu hình dự án:
   - Framework Preset: Create React App
   - Build Command: npm run build
   - Output Directory: build
   - Root Directory: ./

6. Nhấp vào "Deploy" để bắt đầu quá trình triển khai

7. Sau khi triển khai thành công, bạn sẽ nhận được URL của ứng dụng (ví dụ: https://py-translate-web.vercel.app)

### Cấu hình tùy chỉnh

File `vercel.json` đã được cấu hình sẵn cho dự án này:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ qua email: example@example.com

## Công nghệ sử dụng

- ReactJS
- TypeScript
- React Bootstrap
- i18next cho đa ngôn ngữ
- Web Speech API
- Tesseract.js cho OCR
- Google Translate API 