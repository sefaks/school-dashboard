import NextAuth, { AuthOptions, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getTeacherFromDb, getInstitutionAdminFromDb } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

// .env'den secret alınması
const secret = process.env.NEXTAUTH_SECRET || "J+Zlxm7RBRTzgaz/r3LCHhHGXT4vWRoqW9TsfuDZ1Ks=";

// JWT ve Session için tip güvenliği sağlamak
interface User {
  id: string;
  email: string;
  name: string;
  token: string;
  role: string;
}

interface SessionUser {
  accessToken: string;
  role: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
        const { email, password } = credentials as { email: string, password: string };

        // İlk olarak teacher-login'e istek gönderiyoruz
        let backendResponse = await fetch("https://base-service-ua14.onrender.com/auth/teacher/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

          // If login is successful, get teacher from DB
          if (backendResponse.ok) {
            const teacherLoginData = await backendResponse.json();
            const { access_token, is_active } = teacherLoginData;
            console.log("Teacher login successful");

            // If teacher is active, get teacher from DB
            if (is_active) {
                const teacher = await getTeacherFromDb(email as string); // Get teacher 
                if (teacher) {
                    return {
                        id: teacher.id.toString(),
                        email: teacher.email,
                        name: teacher.name || teacher.email,
                        token: access_token,
                        role: "teacher", // Adding role to JWT
                    };
                }
            } else {
                throw new Error("Teacher account is not active.");
            }
          }

          // If teacher login failed, try institution admin login
          console.log("Teacher login failed, trying institution admin login...");
          backendResponse = await fetch("https://base-service-ua14.onrender.com/auth/institution_admin/login", {
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
                        role: "admin",
                    };
                } else {
                    throw new Error("Institution Admin account is not found.");
                }
            } else {
                throw new Error("Institution Admin account is not active.");
            }
          }

          // If login failed for both teacher and admin
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
  jwt: {
    secret: secret,
  },

  secret: secret, // secret is using for JWT encryption.

callbacks: { // this callback function is used to add the role to the JWT token each time a user logs in
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.accessToken = (user as unknown as { token: string }).token;  // Add access_token to JWT
        token.role = (user as unknown as { role: string }).role as string;  // Add role to JWT (Backend'den gelen role)
      }
      else {
        console.log("No user:", user);
      }
      return token;
    },      

    async session({ session, token }: { session: any, token: any }) { // Add accessToken and role to session
      session.user.accessToken = token.accessToken as string;
      session.user.role = token.role as string;
      return session;
    },
      
},
}

export const auth = NextAuth(authOptions);
export default auth;