import { z } from "zod";

export const studentSchema = z.object({
// email, class_id and share_code are required fields
    email: z.string().email({ message: "Geçersiz eposta adresi!" }).optional(),
    student_code: z.string().length(5, { message: "Paylaşım kodu 5 haneli olmalı!" }).optional(),
    class_id: z.union([
      z.string().transform(val => Number(val)),
      z.number()
    ]),
    // school_no is optional
    school_no: z.string().optional(),
    parents: z
      .array(
        z.object({
          name: z.string().min(1, { message: "İsim gerekli" }),
          surname: z.string().min(1, { message: "Soy isim gerekli" }),
          email: z
            .string()
            .email({ message: "Invalid email address for parent!" }),
          phone: z.string()
            .min(1, { message: "Telefon numarası gerekli" })
            .transform(val => val.replace(/\s+/g, '')) // Boşlukları kaldır
            .refine(val => /^\d{11}$/.test(val), { message: "Telefon numarası 11 haneli olmalı: 554 242 242 32 " })
        })
      )
      .optional(),  // parents is optional
});


export type StudentSchema = z.infer<typeof studentSchema>;


export const teacherSchema = z.object({
  email: z.string().email({ message: "Geçersiz eposta adresi!" }),
  validation_code: z.string().length(5, { message: "Paylaşım kodu 5 haneli olmalı!" })
});

export type TeacherSchema = z.infer<typeof teacherSchema>;


export const classSchema = z.object({
  class_code: z.string().min(1, { message: "Sınıf kodu gerekli!" }),
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
  header: z.string(),  // optional header
  subject_id: z.union([
    z.string().transform(val => Number(val)),
    z.number()
  ]).refine(val => !isNaN(val), { message: "Invalid subject ID!" }),
  student_ids: z.array(z.string().transform(val => parseInt(val))).optional(),
  class_ids: z.array(z.string().transform(val => parseInt(val))).optional(),
  //optional test_ids
  test_ids: z.array(z.string().transform(val => parseInt(val))).optional(),
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
  "FEN_BILIMLERI", // "FEN_BİLGİSİ" için backend mapping olacak
  "SOSYAL_BILGILER",
  "INGILIZCE",
  "COĞRAFYA",
  "TARİH",
  "FİZİK",
  "KİMYA",
  "BİYOLOJİ"

]);

export const TeacherActivateSchema = z.object({
  gender: z.enum(["Erkek", "Kadın"], { message: "Gender must be 'Erkek' or 'Kadın'" }),
  subjects: z.array(SubjectEnum).nonempty({ message: "At least one subject must be selected!" }),
  title: z.string().min(1, { message: "Title is required!" }),
});

export type TeacherActivateSchema = z.infer<typeof TeacherActivateSchema>;


export const CommentSchema = z.object({
  content: z.string().min(1, { message: "Comment content is required!" }),
});

export type CommentSchema = z.infer<typeof CommentSchema>;


export const TeacherUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name is required!" }).optional(),
  surname: z.string().min(1, { message: "Surname is required!" }).optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  subjects: z.array(z.string()).optional(), // Optional olacak
  title: z.string().min(1, { message: "Title is required!" }).optional(),
  gender: z.enum(["Erkek", "Kadın"], { message: "Required field!" }).optional(),
  phone_number: z.string().min(1, { message: "Phone number is required!" }).optional().nullable(),
});

export type TeacherUpdateSchema = z.infer<typeof TeacherUpdateSchema>;


export const TeacherRegisterSchema = z.object({
  name: z.string().min(1, { message: "Name is required!" }),
  surname: z.string().min(1, { message: "Surname is required!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one digit.")
  .regex(/[\W_]/, "Password must contain at least one special character."),
  confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export type TeacherRegisterSchema = z.infer<typeof TeacherRegisterSchema>;

export enum ScheduleStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived"
}

export enum DayOfWeek {
    Monday = "Pazartesi",
    Tuesday = "Salı",
    Wednesday = "Çarşamba",
    Thursday = "Perşembe",
    Friday = "Cuma",
    Saturday = "Cumartesi",
    Sunday = "Pazar"
}

// Takvim oluşturma için Zod şeması
export const scheduleCreateSchema = z.object({
  name: z.string().min(1, "Takvim adı boş olamaz"), // Takvim adı zorunlu
  class_id: z.number().int(),
  status: z.nativeEnum(ScheduleStatus),
  lesson_schedules: z.array(
    z.object({
      id: z.number().optional(),
      lesson_id: z.number().min(1, "Ders ID'si zorunludur."),
      teacher_id: z.number().min(1, "Öğretmen ID'si zorunludur."),
      day_of_week: z.string().refine((day) => day.includes(day), {
        message: "Geçerli bir gün seçmelisiniz",
      }),
      start_time: z.string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
          message: "Geçerli bir saat formatı giriniz (HH:MM veya HH:MM:SS)",
        })
        .transform((time) => {
          // Eğer saniye kısmı varsa, sadece HH:MM kısmını al
          return time.length > 5 ? time.substring(0, 5) : time;
        }),
      end_time: z.string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
          message: "Geçerli bir saat formatı giriniz (HH:MM veya HH:MM:SS)",
        })
        .transform((time) => {
          // Eğer saniye kısmı varsa, sadece HH:MM kısmını al
          return time.length > 5 ? time.substring(0, 5) : time;
        }),
    }).refine((data) => {
      const startTime = data.start_time.split(":").map(Number);
      const endTime = data.end_time.split(":").map(Number);
      const startMinutes = startTime[0] * 60 + startTime[1];
      const endMinutes = endTime[0] * 60 + endTime[1];
      return endMinutes > startMinutes;
    }, {
      message: "Bitiş saati, başlangıç saatinden sonra olmalıdır.",
      path: ["end_time"],
    })
  ),
});

// Kullanıcıdan gelecek veriyi doğrulamak için kullanılacak tip
export type ScheduleCreateSchema = z.infer<typeof scheduleCreateSchema>;


const AdminUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name is required!" }).optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  confirmPassword: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type AdminUpdateSchema = z.infer<typeof AdminUpdateSchema>;




    

    