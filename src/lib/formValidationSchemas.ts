import { z } from "zod";

export const studentSchema = z.object({
// email, class_id and share_code are required fields
    email: z.string().email({ message: "Invalid email address!" }),
    student_code: z.string().length(5, { message: "Share code must be 5 characters!" }),
    class_id: z.union([
      z.string().transform(val => Number(val)),
      z.number()
    ]),
    parents: z
      .array(
        z.object({
          name: z.string().min(1, { message: "Name is required" }),
          surname: z.string().min(1, { message: "Surname is required" }),
          email: z
            .string()
            .email({ message: "Invalid email address for parent!" }),
          phone: z.string()
            .min(1, { message: "Phone number is required" })
            .transform(val => val.replace(/\s+/g, '')) // Boşlukları kaldır
            .refine(val => /^\d{11}$/.test(val), { message: "Phone number must be 11 digits" })
        })
      )
      .optional(),  // parents is optional
});


export type StudentSchema = z.infer<typeof studentSchema>;


export const teacherSchema = z.object({
  email: z.string().email({ message: "Invalid email address!" }),
  validation_code: z.string().length(5, { message: "Validation code must be 5 characters!" })
});

export type TeacherSchema = z.infer<typeof teacherSchema>;


export const classSchema = z.object({
  class_code: z.string().min(1, { message: "Class code is required!" }),
  // grade number and required fields
  grade: z.union([
    z.string().transform(val => Number(val)),
    z.number()
  ]
  ),
 
});

export type ClassSchema = z.infer<typeof classSchema>;


export const assignmentSchema = z.object({
  start_date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date!" }),
  deadline_date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid deadline date!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  subject_id: z.union([
    z.string().transform(val => Number(val)),
    z.number()
  ]).refine(val => !isNaN(val), { message: "Invalid subject ID!" }),
  student_ids: z.array(z.string().transform(val => parseInt(val))),
  class_ids: z.array(z.string().transform(val => parseInt(val))),
  documents: z.array(
    z.object({
        name: z.string().min(1, { message: "Document name is required!" }),
        content: z.string().nullable().optional(),
        uploaded_at: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid upload date!" }),
        url: z.string().url({ message: "Invalid document URL!" })
    })
).optional().default([]) // default boş array ekleyelim
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;


export const announcementSchema = z.object({
  title: z.string().min(1, { message: "Title is required!" }),
  content: z.string().min(1, { message: "Content is required!" }),
  class_ids: z.array(z.string().transform(val => parseInt(val))),
  teacher_ids: z.array(z.string().transform(val => parseInt(val))),
  parent_ids: z.array(z.string().transform(val => parseInt(val))),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;



const SubjectEnum = z.enum([
  "TURKCE",
  "MATEMATIK",
  "FEN_B_LG_S_", // "FEN_BİLGİSİ" için backend mapping olacak
  "SOSYAL_BILGILER",
  "INGILIZCE",
  "DIN_BILGISI",
  "COGRAFYA",
  "TAR_H", // "TARİH" için backend mapping olacak
]);

export const TeacherActivateSchema = z.object({
  gender: z.enum(["Erkek", "Kadın"], { message: "Gender must be 'Erkek' or 'Kadın'" }),
  subjects: z.array(SubjectEnum).nonempty({ message: "At least one subject must be selected!" }),
  title: z.string().min(1, { message: "Title is required!" }),
});

export type TeacherActivateSchema = z.infer<typeof TeacherActivateSchema>;



    

    