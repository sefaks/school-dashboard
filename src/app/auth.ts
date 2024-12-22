import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInSchema } from "@/lib/zod";
import { getTeacherFromDb, getInstitutionAdminFromDb } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

const secret = process.env.NEXTAUTH_SECRET || "J+Zlxm7RBRTzgaz/r3LCHhHGXT4vWRoqW9TsfuDZ1Ks=";


export const { handlers, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = credentials;

          // İlk olarak teacher-login'e istek gönderiyoruz
          let backendResponse = await fetch("http://127.0.0.1:8000/auth/teacher/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          // Eğer teacher-login başarılı olduysa
          if (backendResponse.ok) {
            const teacherLoginData = await backendResponse.json();
            const { access_token, is_active } = teacherLoginData;
            console.log("Teacher login successful");
            console.log(teacherLoginData.access_token)

            // Eğer öğretmen aktifse, bilgilerini DB'den alıyoruz
            if (is_active) {
                const teacher = await getTeacherFromDb(email as string); // Öğretmeni DB'den al
                if (teacher) {
                    return {
                        id: teacher.id.toString(),
                        email: teacher.email,
                        name: teacher.name || teacher.email,
                        token: access_token,
                        role: "teacher",
                    };
                }
            } else {
                throw new Error("Teacher account is not active.");
            }
          }

          // Eğer teacher-login başarısızsa, admin-login'i deneyelim
          console.log("Teacher login failed, trying institution admin login...");
          backendResponse = await fetch("http://127.0.0.1:8000/auth/institution_admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (backendResponse.ok) {
            const adminLoginData = await backendResponse.json();
            const { access_token, is_active } = adminLoginData;

            // Eğer admin aktifse, bilgilerini DB'den alıyoruz
            if (is_active) {
                const admin = await getInstitutionAdminFromDb(email as string); // Admin bilgilerini al
                if (admin) {
                    return {
                        id: admin.id.toString(),
                        email: admin.email,
                        name: admin.name || admin.email,
                        token: access_token,
                    };
                } else {
                    throw new Error("Institution Admin account is not found.");
                }
            } else {
                throw new Error("Institution Admin account is not active.");
            }
          }

          // Eğer her iki login da başarısız olduysa, hata fırlat
          throw new Error("Login failed for both teacher and admin.");
        } catch (error) {
          console.error("Authorization error:", error);
          return null; // Authorization failed
        }
      },
    }),
  ],

  pages: {
    signIn: "/sigin", // Custom login page
    error: "/unauthorized", // Custom error page
  },

  session: {
    strategy: "jwt", // Use JWT strategy
  },

  secret: secret, // .env file for the secret

callbacks: {
    async jwt({ token, user }) {
        if (user) {
          token.accessToken = (user as { token: string }).token;  // Add access_token to JWT
          token.role = (user as { role: string }).role;  // Add role to JWT (Backend'den gelen role)
        }
        return token;
      },      

      async session({ session, token }: { session: any, token: any }) {
        session.user.accessToken = token.accessToken; // Add access_token to session
        session.user.role = token.role;  // Add role to session (JWT'den alınan role)
        return session;
      },
      
},
});
