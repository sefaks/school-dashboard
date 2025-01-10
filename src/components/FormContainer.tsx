import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "class"
    | "assignment"
    | "announcement"
    | "activate"
           ;
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData: any = {};

  // Kullanıcı ve kurum bilgilerini alıyoruz
  const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();


  if (type !== "delete") {
    switch (table) {
    case "student":
        // Kurumun sınıflarını getir
        if (institution_id) {
            const classes = await prisma.classes.findMany({
                where: { institution_id: parseInt(institution_id) },
                select: { id: true, class_code: true },
            });

            relatedData = { classes };
        }
        console.log("related_data",relatedData);
        break;  
    case "teacher":
      // herhangi bir related data yok
      break;      
    
    case "class":
      if (institution_id) {
       // get students with student_instution's institution_id equal to institution_id 

        const students = await prisma.students.findMany({
          where: {
            student_institution: {
              some: {
                institution_id: parseInt(institution_id),
              },
            },
          },
          select: { id: true, name: true, surname: true },
        });

        relatedData = { students };
      }
      break;
      case "assignment":
          // get teacher's teacher_classes and assign to classes with id and class_code
          const classes = await prisma.classes.findMany({
            where: {
              teacher_class: {
                some: {
                  teacher_id: parseInt(current_user_id),
                },
              },
            },
            select: { id: true, class_code: true },
          });
      
          // get students with teeacher_classes class_id equal to student_classes class_id
          const students = await prisma.students.findMany({
            where: {
              student_class: {
                some: {
                  classes: {
                    teacher_class: {
                      some: {
                        teacher_id: parseInt(current_user_id),
                      },
                    },
                  },
                },
              },
            },
            select: { id: true, name: true, surname: true },
          });

          // get subjects in teacher_subjects
          const subjects = await prisma.subjects.findMany({
            where: {
              teacher_subject: {
                some: {
                  teacher_id: parseInt(current_user_id),
                },
              },
            },
            select: { id: true, subject_name: true },
          });


          relatedData = { classes, students, subjects };
        
        break;
      case "announcement":
        // get teacher's teacher_classes and assign to announcementClasses with id and class_code

        if (role === "admin") {
          const announcementClasses = await prisma.classes.findMany({
            where: {
              institution_id: parseInt(institution_id),
            },
            select: { id: true, class_code: true },
          });

          const teachers = await prisma.teachers.findMany({
            where: {
              teacher_institution: {
                some: {
                  institution_id: parseInt(institution_id),
                },
              },
            },
            select: { id: true, name: true, surname: true },
          });

          const parents = await prisma.parents.findMany({
            where:{
              parent_student: {
                some: {
                  students: {
                    student_institution: {
                      some: {
                        institution_id: parseInt(institution_id),
                      },
                    },
                  },
                },
              },
            }
          });

          relatedData = { announcementClasses, teachers, parents };
        }
        else if (role === "teacher") {
          const announcementClasses = await prisma.classes.findMany({
            where: {
              teacher_class: {
                some: {
                  teacher_id: parseInt(current_user_id),
                },
              },
            },
            select: { id: true, class_code: true },
          });            

          const parents = await prisma.parents.findMany({
            where:{
              parent_student: {
                some: {
                  students: {
                    student_class: {
                      some: {
                        classes: {
                          teacher_class: {
                            some: {
                              teacher_id: parseInt(current_user_id),
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            }
          });


          relatedData = { announcementClasses, parents };
        }
        break;

    case "activate":
        //subject enum'ları ve gender enum'ları
      const activateSubjects = await prisma.subjects.findMany()
      ;
      const activateGenders = ["Erkek", "Kadın"];


      relatedData = { activateSubjects, activateGenders };



    default:
      break;
     
    }
  }

  return (
    <div className="form-container">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id ? parseInt(id as string) : undefined}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
