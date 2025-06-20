# 📝 **Trình Dịch Văn Bản (Text Translator)**

**Trình Dịch Văn Bản** là một ứng dụng dịch ngôn ngữ mạnh mẽ, hỗ trợ nhiều tính năng như dịch văn bản, nhận diện giọng nói, nhận diện văn bản từ hình ảnh (OCR), và đọc văn bản qua giọng nói. Ứng dụng sử dụng các thư viện Python hiện đại như `Tkinter`, `Google Translate`, `SpeechRecognition`, và `Tesseract OCR` để cung cấp trải nghiệm người dùng trực quan và dễ sử dụng.

## 🚀 Các Tính Năng Chính

* **Dịch Văn Bản**: Dịch văn bản từ ngôn ngữ này sang ngôn ngữ khác.
* **Nhận Diện Giọng Nói (Speech-to-Text)**: Dịch văn bản từ giọng nói thông qua microphone.
* **Nhận Diện Văn Bản từ Hình Ảnh (OCR)**: Nhận diện và dịch văn bản từ hình ảnh.
* **Đọc Văn Bản**: Đọc văn bản đã nhập hoặc kết quả dịch qua giọng nói (Text-to-Speech).

## 📦 Cài Đặt

Để chạy ứng dụng, bạn cần cài đặt các thư viện Python và công cụ bổ sung sau:

### 🐍 Bước 1: Cài Đặt Python

Ứng dụng yêu cầu Python phiên bản 3.x. Nếu bạn chưa cài đặt Python, bạn có thể tải về từ [Python Official Website](https://www.python.org/downloads/).

### 🔧 Bước 2: Cài Đặt Các Thư Viện Python từ file `requirements.txt`

Ứng dụng sử dụng một số thư viện bên ngoài, vì vậy bạn cần cài đặt chúng bằng `pip`. Dưới đây là danh sách các thư viện yêu cầu:

```bash
pip install -r requirements.txt
```

### 🔨 Bước 3: Cài Đặt Tesseract OCR

Ứng dụng sử dụng **Tesseract OCR** để nhận diện văn bản từ hình ảnh. Bạn cần cài đặt **Tesseract** trên máy tính của mình.

1. Tải Tesseract về và cài đặt từ [tesseract-ocr/tesseract](https://github.com/tesseract-ocr/tesseract).

   * Trên **Windows**: Bạn có thể tải Tesseract từ [đây](https://github.com/UB-Mannheim/tesseract/wiki).
   * Trên **macOS**: Sử dụng Homebrew:

     ```bash
     brew install tesseract
     ```

2. Sau khi cài đặt Tesseract, bạn cần cấu hình đường dẫn trong mã nguồn của ứng dụng (nếu cần):

   ```python
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Đối với Windows
   ```

### ▶️ Bước 4: Chạy Ứng Dụng

Sau khi cài đặt xong tất cả các thư viện và công cụ, bạn có thể chạy ứng dụng bằng cách mở terminal (hoặc command prompt), điều hướng đến thư mục chứa file Python của ứng dụng và chạy lệnh:

```bash
python PYTranslate.py
```

**Lưu ý**: Đảm bảo rằng bạn đã cài đặt tất cả các thư viện Python trước khi chạy ứng dụng.

## 🎯 Cách Sử Dụng

Ứng dụng có giao diện đồ họa đơn giản với các tính năng sau:

1. **Nhập Văn Bản**: Nhập văn bản vào ô "Nhập Văn Bản". Chọn ngôn ngữ đích và ứng dụng sẽ tự động dịch.
2. **Dịch Giọng Nói**: Bấm nút "Dịch Giọng Nói" để nhận diện văn bản từ giọng nói qua microphone và dịch.
3. **Dịch Văn Bản Từ Hình Ảnh (OCR)**: Chọn hình ảnh chứa văn bản cần dịch. Ứng dụng sẽ sử dụng Tesseract OCR để nhận diện văn bản và dịch.
4. **Đọc Văn Bản**: Bạn có thể đọc văn bản bạn đã nhập hoặc đọc kết quả dịch qua giọng nói bằng cách bấm nút "Đọc Văn Bản" hoặc "Đọc Kết Quả Dịch".

## 🌍 Các Ngôn Ngữ Hỗ Trợ

Ứng dụng hỗ trợ dịch giữa các ngôn ngữ sau:

* 🇬🇧 Tiếng Anh (English)
* 🇻🇳 Tiếng Việt (Vietnamese)
* 🇰🇷 Tiếng Hàn (Korean)
* 🇯🇵 Tiếng Nhật (Japanese)
* 🇨🇳 Tiếng Trung (Chinese Simplified)
* 🇫🇷 Tiếng Pháp (French)
* 🇩🇪 Tiếng Đức (German)
* 🇮🇹 Tiếng Ý (Italian)
* 🇪🇸 Tiếng Tây Ban Nha (Spanish)
* 🇵🇹 Tiếng Bồ Đào Nha (Portuguese)

## ❓ Lỗi Thường Gặp

### 1. **Không thể nhận diện giọng nói**

* Đảm bảo rằng bạn đã cấp quyền sử dụng microphone cho ứng dụng.
* Kiểm tra kết nối Internet nếu có vấn đề với dịch vụ nhận diện giọng nói của Google.

### 2. **Lỗi khi nhận diện văn bản từ hình ảnh (OCR)**

* Kiểm tra đường dẫn Tesseract có chính xác hay không.
* Đảm bảo hình ảnh rõ nét và không bị mờ.

### 3. **Ứng dụng không hoạt động ổn định**

* Nếu ứng dụng gặp sự cố hoặc lỗi, thử kiểm tra các bản cập nhật của các thư viện và Tesseract OCR.

## 📚 Tài Liệu Tham Khảo

* [Tkinter Documentation](https://docs.python.org/3/library/tkinter.html)
* [Google Translate API](https://cloud.google.com/translate)
* [gTTS Documentation](https://gtts.readthedocs.io/)
* [SpeechRecognition Documentation](https://pypi.org/project/SpeechRecognition/)





