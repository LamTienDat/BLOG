1. Tiêu đề và Mô tả:
Ứng dụng Blog
Quản lí đăng bài, quản lí lượt like, dislike, quản lí user.

2. Bắt đầu:
- Cài đặt:
  * npm install
  * Chạy chương trình: npx ts-node src/app.ts
  * Chạy chương trình môi trường development: npm run dev
- Yêu cầu hệ thống:
Typescript, NodeJS, ExpressJS, MongoDB

3. Cấu trúc thư mục:

4. Cấu trúc cơ sở dữ liệu:

Blogs {
    title: string;
    content: string;
    createdAt:  Date;
    updatedAt:  Date;
    state: number ;
    like: number ;
    dislike : number;
    author: string | Schema.Types.ObjectId;
}

Users {
    username: string;
    password: string;
    role: string;
    profileImage: {
        data: Buffer;
        contentType: string;
    };
    firstName: string;
    lastName: string;
    email: string;
    birthDate: number; 
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

5. Cấu hình:
.env.example

6. Sử dụng và Tính năng:
  Tạo tài khoản.
  Đăng bài, like, dislike, thao tác cơ bản với bài đăng.
