import { PrismaClient } from "@prisma/client"
import { verifyPassword } from "./password"



const prisma = new PrismaClient()

export const getTeacherFromDb = async (email: string) => {
    try {
      const teacher_example = await prisma.teachers.findUnique({
        where: {
          email: email,
        },
      })
      if (teacher_example) {
       
          return teacher_example  
        }
      
    } catch (error) {
      console.error("Error fetching teacher from DB:", error)
      return null
    }
  }


  export const getInstitutionAdminFromDb = async (email: string) => {
    try {
      const admin = await prisma.admins.findUnique({
        where: {
          email: email,
        },
        include: {
          institutions: true, // İlgili institution verisini de çekiyoruz
        },
      });
  
      if (admin) {
        return admin;
      }
      return null;
    } catch (error) {
      console.error("Error fetching admin from DB:", error);
      return null;
    }
  };
  