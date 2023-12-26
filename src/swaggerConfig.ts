import swaggerJsdoc from "swagger-jsdoc";
import * as path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
      description: "API description",
    },

    servers: [
      {
        url: "http://localhost:3000/",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Only string from: `eyJhbGciOiJIU...` ignore `Bearer`",
        },
      },
      schemas: {
        Blog: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "5f75f1f94055d43a45b36ae2",
            },
            title: {
              type: "string",
              example: "Sample Blog",
            },
            content: {
              type: "string",
              example: "This is a sample blog post.",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2022-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2022-01-01T00:00:00.000Z",
            },
            state: {
              type: "integer",
              example: 1,
            },
            like: {
              type: "integer",
              example: 0,
            },
            dislike: {
              type: "integer",
              example: 0,
            },
            author: {
              type: "string",
              example: "user123", // Replace with the actual type and example
            },
            likesInfo: {
              type: "array",
              items: {
                type: "string",
                example: "5f75f2f94055d43a45b36ae2", // Replace with the actual type and example
              },
            },
            dislikesInfo: {
              type: "array",
              items: {
                type: "string",
                example: "5f75f1f94055d41a45b36ae2", // Replace with the actual type and example
              },
            },
          },
          required: [
            "title",
            "content",
            "state",
            "like",
            "dislike",
            "author",
            "likesInfo",
            "dislikesInfo",
          ],
        },
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "5f75f1f94055d43a45b36ae2",
            },
            username: {
              type: "string",
              example: "user123",
            },
            password: {
              type: "string",
              example: "hashedPassword",
            },
            role: {
              type: "string",
              example: "user",
            },
            profileImage: {
              type: "object",
              properties: {
                data: {
                  type: "string",
                  format: "binary",
                  example: "base64EncodedImage",
                },
              },
            },
            firstName: {
              type: "string",
              example: "John",
            },
            lastName: {
              type: "string",
              example: "Doe",
            },
            email: {
              type: "string",
              example: "john.doe@example.com",
            },
            birthDate: {
              type: "number",
              example: 946684800000, // Example timestamp for January 1, 2000
            },
            address: {
              type: "string",
              example: "123 Main St, City, Country",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2022-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2022-01-01T00:00:00.000Z",
            },
            isVerified: {
              type: "boolean",
              example: true,
            },
            likedPosts: {
              type: "array",
              items: {
                type: "string",
                example: "5f75f1f94055d43a45b36ae2",
              },
            },
            dislikedPosts: {
              type: "array",
              items: {
                type: "string",
                example: "5f75f1f94055d43a45b36ae2",
              },
            },
          },
          required: [
            "username",
            "password",
            "role",
            "firstName",
            "lastName",
            "email",
            "birthDate",
            "likedPosts",
            "dislikedPosts",
            "isVerified",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    },
  },
  apis: [path.resolve(__dirname, "./routes/*.ts")],
};

const specs = swaggerJsdoc(options);

export default specs;
