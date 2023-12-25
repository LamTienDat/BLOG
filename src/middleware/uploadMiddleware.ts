import multer from "multer";

export const storage = multer.memoryStorage(); // Lưu trữ ảnh trong bộ nhớ

export const upload = multer({ storage: storage });
