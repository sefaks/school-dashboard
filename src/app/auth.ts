import NextAuth, { AuthOptions, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getTeacherFromDb, getInstitutionAdminFromDb } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

// .env'den secret alınması
const secret = process.env.NEXTAUTH_SECRET || "J+Zlxm7RBRTzgaz/r3LCHhHGXT4vWRoqW9TsfuDZ1Ks=";


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: {label:"Name",type:"text",optional:true},
        surname: {label:"Surname",type:"text",optional:true},
        isRegister: { label: "Register", type: "boolean", optional: true }, // Register flag
      },
      authorize: async (credentials) => {
        try {
          const { email, password, name, surname, isRegister } = credentials as unknown as { email: string; password: string; name?: string; surname?:string, isRegister?: boolean };

          if(isRegister){
            const register_response = await fetch("http://127.0.0.1:8000/auth/teacher/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, name, surname }),
            });

            if (!register_response.ok) {
              throw new Error("Teacher registration failed.");
            }

            const registeredTeacher = await register_response.json();
            return {
              id: registeredTeacher.id.toString(),
              email: registeredTeacher.email,
              name: registeredTeacher.name,
              role: "teacher",
            };
          }

          // Kullanıcıyı veritabanında email ile arıyoruz
          const teacher = await getTeacherFromDb(email);
          const admin = await getInstitutionAdminFromDb(email);
      
          if (teacher) {
            // Öğretmen bulunduysa, öğretmen girişi için API'yi çağırıyoruz
            let backendResponse = await fetch("https://base-service-ua14.onrender.com/auth/teacher/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
      
            if (backendResponse.ok) {
              const teacherLoginData = await backendResponse.json();
              const { access_token, is_active } = teacherLoginData;
      
             
                return {
                  id: teacher.id.toString(),
                  email: teacher.email,
                  name: teacher.name || teacher.email,
                  token: access_token,
                  role: "teacher",
                  is_active: teacher.is_active,
                };
             
              
            } else {
              throw new Error("Teacher password is incorrect.");
            }
          } else if (admin) {
            // Eğer admin bulunduysa, admin girişi için API'yi çağırıyoruz
            let backendResponse = await fetch("https://base-service-ua14.onrender.com/auth/institution_admin/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
      
            if (backendResponse.ok) {
              const adminLoginData = await backendResponse.json();
              const { access_token } = adminLoginData;
      
              return {
                id: admin.id.toString(),
                institution_id: admin.institution_id?.toString() || null,
                email: admin.email,
                name: admin.name || admin.email,
                token: access_token,
                role: "admin",
              };
            } else {
              throw new Error("Institution admin password is incorrect.");
            }
          } else {
            // Eğer kullanıcı hem öğretmen hem de admin olarak bulunmadıysa
            throw new Error("Email address not found for teacher or institution admin.");
          }
        } catch (error:any) {
          console.error("Authorization error:", error.message);
          throw new Error(error.message);
        }
      },
}),
],

  pages: {
    signIn: "/sigin", // Custom login page
    error: "/unauthorized", // Custom error page,
    newUser: "/new-user", // Custom new user page
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
        token.id = (user as unknown as { id: string }).id as string;  // Add id to JWT
        token.institution_id = (user as unknown as { institution_id: string }).institution_id as string;  // Add institution_id to JWT
        token.is_active = (user as unknown as { is_active: boolean }).is_active as boolean;  // Add is_active to JWT
      }
      return token;
    },      

    async session({ session, token }: { session: any, token: any }) { // Add accessToken and role to session
      // console.log("Session:", session);
      session.user.accessToken = token.accessToken as string;
      session.user.role = token.role as string;
      session.user.id = token.id as string;
      session.user.institution_id = token.institution_id as string;
      session.user.is_active = token.is_active as boolean;
      return session;
    },
      
},
}

export const auth = NextAuth(authOptions);
export default auth;