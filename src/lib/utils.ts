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

export const adjustScheduleToCurrentMonth = (
  lessons: { title: string; start: Date | string; end: Date | string }[]
): { title: string; start: Date; end: Date }[] => {
  const now = new Date();
  const currentMonth = now.getMonth(); // Geçerli ay
  const currentYear = now.getFullYear(); // Geçerli yıl

  return lessons.map((lesson) => {
    // Başlangıç ve bitiş zamanlarını Date nesnesine çevir
    const lessonStart = new Date(lesson.start);
    const lessonEnd = new Date(lesson.end);

    // UTC'den İstanbul'a dönüştürmek için 3 saat geri alıyoruz
    lessonStart.setHours(lessonStart.getHours() - 3);
    lessonEnd.setHours(lessonEnd.getHours() - 3);

    // Yeni başlangıç tarihini oluştur, gün ve saati koruyarak
    const adjustedStart = new Date(lessonStart);
    adjustedStart.setFullYear(currentYear); // Geçerli yılı ayarla
    adjustedStart.setMonth(currentMonth); // Geçerli ayı ayarla

    // Yeni bitiş tarihini oluştur, gün ve saati koruyarak
    const adjustedEnd = new Date(lessonEnd);
    adjustedEnd.setFullYear(currentYear); // Geçerli yılı ayarla
    adjustedEnd.setMonth(currentMonth); // Geçerli ayı ayarla

    // Başlangıç ve bitiş saatini aynı bırak
    adjustedStart.setHours(lessonStart.getHours(), lessonStart.getMinutes(), lessonStart.getSeconds());
    adjustedEnd.setHours(lessonEnd.getHours(), lessonEnd.getMinutes(), lessonEnd.getSeconds());

    return {
      title: lesson.title,
      start: adjustedStart,
      end: adjustedEnd,
    };
  });
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
