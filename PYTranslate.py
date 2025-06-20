import tkinter as tk
from tkinter import filedialog, Toplevel, Listbox, Scrollbar, Entry, Label
from langdetect import detect
from googletrans import Translator
from gtts import gTTS
from playsound import playsound
import os
import speech_recognition as sr
from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

LANGUAGE_NAMES = {
    'Tiếng Anh': 'en',
    'Tiếng Việt': 'vi',
    'Tiếng Hàn': 'ko',
    'Tiếng Nhật': 'ja',
    'Tiếng Trung': 'zh-cn',  # Updated to correct code for Simplified Chinese
    'Tiếng Pháp': 'fr',
    'Tiếng Đức': 'de',
    'Tiếng Ý': 'it',
    'Tiếng Tây Ban Nha': 'es',
    'Tiếng Bồ Đào Nha': 'pt',
}

def clear_text():
    input_text.delete(1.0, tk.END)
    output_text.config(state=tk.NORMAL)
    output_text.delete(1.0, tk.END)
    output_text.config(state=tk.DISABLED)

def translate_text(event=None):
    input_text_value = input_text.get(1.0, tk.END).strip()
    dest_lang_name = dest_language.get()
    dest_lang = LANGUAGE_NAMES[dest_lang_name]

    if input_text_value:
        translator = Translator()
        translation = translator.translate(input_text_value, dest=dest_lang)
        output_text.config(state=tk.NORMAL)
        output_text.delete(1.0, tk.END)
        output_text.insert(tk.END, translation.text)
        output_text.config(state=tk.DISABLED)
    else:
        output_text.config(state=tk.NORMAL)
        output_text.delete(1.0, tk.END)
        output_text.insert(tk.END, "Vui lòng nhập văn bản cần dịch.")
        output_text.config(state=tk.DISABLED)

def speak_text(text, lang='en'):
    if text:
        tts = gTTS(text=text, lang=lang)
        tts.save("output.mp3")
        playsound("output.mp3")
        os.remove("output.mp3")

def speak_input_text():
    input_text_value = input_text.get(1.0, tk.END).strip()
    if input_text_value:
        src_lang = detect(input_text_value)
        speak_text(input_text_value, lang=src_lang)

def speak_output_text():
    output_text_value = output_text.get(1.0, tk.END).strip()
    if output_text_value:
        dest_lang_name = dest_language.get()
        dest_lang = LANGUAGE_NAMES[dest_lang_name]
        speak_text(output_text_value, lang=dest_lang)

def recognize_speech():
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()

    with microphone as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Đang Nghe...")
        audio = recognizer.listen(source)

    try:
        recognized_text = recognizer.recognize_google(audio, language='vi-VN')
        recognized_text = recognizer.recognize_google(audio, language='en-US')
        input_text.delete(1.0, tk.END)
        input_text.insert(tk.END, recognized_text)
        translate_text()
    except sr.UnknownValueError:
        output_text.config(state=tk.NORMAL)
        output_text.delete(1.0, tk.END)
        output_text.insert(tk.END, "Không thể hiểu giọng nói")
        output_text.config(state=tk.DISABLED)
    except sr.RequestError as e:
        output_text.config(state=tk.NORMAL)
        output_text.delete(1.0, tk.END)
        output_text.insert(tk.END, f"Không thể yêu cầu kết quả; {e}")
        output_text.config(state=tk.DISABLED)

def ocr_image():
    file_path = filedialog.askopenfilename()
    if file_path:
        try:
            img = Image.open(file_path)
            text = pytesseract.image_to_string(img)
            input_text.delete(1.0, tk.END)
            input_text.insert(tk.END, text)
            translate_text()
        except Exception as e:
            output_text.config(state=tk.NORMAL)
            output_text.delete(1.0, tk.END)
            output_text.insert(tk.END, f"Lỗi khi nhận dạng văn bản từ hình ảnh: {e}")
            output_text.config(state=tk.DISABLED)

def show_language_dialog():
    def filter_languages(event=None):
        search_term = search_var.get().lower()
        listbox.delete(0, tk.END)
        for language in LANGUAGE_NAMES.keys():
            if search_term in language.lower():
                listbox.insert(tk.END, language)

    def on_language_select(event):
        selected_language = listbox.get(listbox.curselection())
        dest_language.set(selected_language)
        dialog.destroy()
        translate_text()

    dialog = Toplevel(app)
    dialog.title("Chọn Ngôn Ngữ Đích")
    dialog.geometry("300x400")

    search_var = tk.StringVar()

    search_frame = tk.Frame(dialog)
    search_frame.pack(pady=5, padx=5, fill=tk.X)

    search_label = Label(search_frame, text="Tìm:", font=('Arial', 12))
    search_label.pack(side=tk.LEFT, padx=5)

    search_entry = Entry(search_frame, textvariable=search_var, font=('Arial', 12))
    search_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
    search_entry.bind('<KeyRelease>', filter_languages)

    scrollbar = Scrollbar(dialog)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    listbox = Listbox(dialog, yscrollcommand=scrollbar.set, font=('Arial', 12))
    for language in LANGUAGE_NAMES.keys():
        listbox.insert(tk.END, language)
    listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    listbox.bind('<Double-1>', on_language_select)

    scrollbar.config(command=listbox.yview)

app = tk.Tk()
app.title("Trình Dịch Văn Bản")
app.configure(bg="#f0f0f0")

input_text_label = tk.Label(app, text="Nhập Văn Bản:", bg="#f0f0f0", font=('Arial', 12, 'bold'))
input_text_label.grid(row=0, column=0, padx=10, pady=10, sticky="w")
input_text = tk.Text(app, height=5, width=60, font=('Arial', 12))
input_text.grid(row=1, column=0, padx=10, pady=5, sticky="nsew")
input_text.bind('<KeyRelease>', translate_text)  # Bind translate_text to key release event

speak_input_button = tk.Button(app, text="Đọc Văn Bản Nhập", command=speak_input_text, width=15, bg="#4CAF50", font=('Arial', 12, 'bold'))
speak_input_button.grid(row=2, column=0, padx=10, pady=5, sticky="ew")

button_frame = tk.Frame(app, bg="#f0f0f0")
button_frame.grid(row=3, column=0, padx=10, pady=10, sticky="ew")

ocr_button = tk.Button(button_frame, text="Dịch Văn Bản Từ Hình Ảnh", command=ocr_image, width=25, bg="#ADD8E6", font=('Arial', 12, 'bold'))
ocr_button.grid(row=0, column=0, padx=5, pady=5, sticky="ew")

recognize_speech_button = tk.Button(button_frame, text="Dịch Giọng Nói", command=recognize_speech, width=15, bg="#FFA500", font=('Arial', 12, 'bold'))
recognize_speech_button.grid(row=0, column=1, padx=5, pady=5, sticky="ew")

clear_button = tk.Button(button_frame, text="Xóa Văn Bản", command=clear_text, width=15, bg="#D64C4C", font=('Arial', 12, 'bold'))
clear_button.grid(row=0, column=2, padx=5, pady=5, sticky="ew")

output_text_label = tk.Label(app, text="Kết Quả Dịch:", bg="#f0f0f0", font=('Arial', 12, 'bold'))
output_text_label.grid(row=4, column=0, padx=10, pady=10, sticky="w")
output_text = tk.Text(app, height=5, width=60, state=tk.DISABLED, font=('Arial', 12))
output_text.grid(row=5, column=0, padx=10, pady=5, sticky="nsew")

dest_language_frame = tk.Frame(app, bg="#f0f0f0")
dest_language_frame.grid(row=6, column=0, padx=10, pady=10, sticky="ew")
dest_language_label = tk.Label(dest_language_frame, text="Ngôn Ngữ Đích:", bg="#f0f0f0", font=('Arial', 12, 'bold'))
dest_language_label.pack(side="left", padx=(0, 5))
dest_language = tk.StringVar(app)
dest_language.set("Tiếng Anh")
dest_language_button = tk.Button(dest_language_frame, textvariable=dest_language, command=show_language_dialog, font=('Arial', 12))
dest_language_button.pack(side="left", fill="x", expand=True)

speak_output_button = tk.Button(app, text="Đọc Kết Quả Dịch", command=speak_output_text, width=15, bg="#4CAF50", font=('Arial', 12, 'bold'))
speak_output_button.grid(row=7, column=0, padx=10, pady=5, sticky="ew")

for i in range(8):
    app.grid_rowconfigure(i, weight=1)
app.grid_columnconfigure(0, weight=1)

app.mainloop()
