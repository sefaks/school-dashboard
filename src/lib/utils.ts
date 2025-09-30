import { authOptions } from "@/app/auth";
import moment from 'moment-timezone';
import { getServerSession } from "next-auth";
import { parseISO } from 'date-fns';

export async function getRoleAndUserIdAndInstitutionId() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("No session found");
  }

  const role = (session as { user: { role: string } })?.user.role;
  const current_user_id = (session as { user: { id: string } })?.user.id;
  const institution_id = (session as unknown as { user: { institution_id: string } })?.user.institution_id;


  return { role, current_user_id, institution_id };
}

export const adjustScheduleToCurrentMonth = (data: {
  day: string;
  start: { getHours: () => number; getMinutes: () => number | undefined };
  end: { getHours: () => number; getMinutes: () => number | undefined };
  title: any;
}[]) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  const dayOfWeekMap: { [key: string]: number } = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  // Manuel saat düzeltme miktarı
  const hourAdjustment = -2;

  let allEvents: any[] = [];

  data.forEach((lesson) => {
    const dayOfWeek = dayOfWeekMap[lesson.day];
    let currentDay = new Date(firstDayOfMonth);
    
    while (currentDay <= lastDayOfMonth) {
      if (currentDay.getDay() === dayOfWeek) {
        const startDateTime = new Date(currentDay);
        const endDateTime = new Date(currentDay);
        
        // Saatleri manuel olarak ayarla
        startDateTime.setHours(
          lesson.start.getHours() + hourAdjustment,
          lesson.start.getMinutes() || 0,
          0,
          0
        );
        endDateTime.setHours(
          lesson.end.getHours() + hourAdjustment,
          lesson.end.getMinutes() || 0,
          0,
          0
        );

        allEvents.push({
          title: lesson.title,
          start: startDateTime,
          end: endDateTime,
        });
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }
  });

  return allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
};


export const subjectNameMap: { [key: string]: string } = {
  TURKCE: "Türkçe",
  MATEMATIK: "Matematik",
  FEN_BILIMLERI: "Fen Bilimleri",
  SOSYAL_BILGILER: "Sosyal Bilgiler",
  INGILIZCE: "İngilizce",
  DIN_BILGISI: "Din Bilgisi",
  COGRAFYA: "Coğrafya",
  TAR_H: "Tarih", // @map("TARİH") için uygun hale getirildi
};


export const convertToTimeZone = (dateString: any, timeZone: any) => {
  const date = (dateString instanceof Date) ? dateString : parseISO(dateString); 



  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat('tr-TR', options);
  return formatter.format(date);
};


export const SUBJECTS = [
  { id: 0, name: "Türkçe", displayName: "Türkçe" },
  { id: 1, name: "Matematik", displayName: "Matematik" },
  { id: 2, name: "Fen Bilimleri", displayName: "Fen Bilimleri" },
  { id: 3, name: "Sosyal Bilgiler", displayName: "Sosyal Bilgiler" },
  { id: 4, name: "İngilizce", displayName: "İngilizce" },
  { id: 5, name: "Coğrafya", displayName: "Coğrafya" },
  { id: 6, name: "Tarih", displayName: "Tarih" },
  { id: 7, name: "Fizik", displayName: "Fizik" },
  { id: 8, name: "Kimya", displayName: "Kimya" },
  { id: 9, name: "Biyoloji", displayName: "Biyoloji" },
  {id:10,name:"Rehberlik",displayName:"Rehberlik"},
  {id: 15, name : "T.C. İnkılap Tarihi ve Atatürkçülük", displayName : "T.C. İnkılap Tarihi ve Atatürkçülük"},
];

export const activateTeacherSubjects = [
  {id:0,name:"TURKCE",displayName:"Türkçe"},
  {id:1,name:"MATEMATIK",displayName:"Matematik"},
  {id:2,name:"FEN_BILIMLERI",displayName:"Fen Bilimleri"},
  {id:3,name:"SOSYAL_BILGILER",displayName:"Sosyal Bilgiler"},
  {id:4,name:"INGILIZCE",displayName:"İngilizce"},
  {id:5,name:"COĞRAFYA",displayName:"Coğrafya"},
  {id:6,name:"TARİH",displayName:"Tarih"},
  {id:7,name:"FİZİK",displayName:"Fizik"},
  {id:8,name:"KİMYA",displayName:"Kimya"},
  {id:9,name:"BİYOLOJİ",displayName:"Biyoloji"},
]