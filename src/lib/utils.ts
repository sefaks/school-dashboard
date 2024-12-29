import { authOptions } from "@/app/auth";
import { getServerSession } from "next-auth";

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
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return lessons.map((lesson) => {
      const lessonStart = new Date(lesson.start);
      const lessonEnd = new Date(lesson.end);

      // Yeni tarihler oluştur
      const adjustedStart = new Date(lessonStart);
      // Sadece yıl ve ay bilgisini güncelle, gün ve saat aynı kalsın
      adjustedStart.setFullYear(currentYear);
      adjustedStart.setMonth(currentMonth);

      const adjustedEnd = new Date(lessonEnd);
      adjustedEnd.setFullYear(currentYear);
      adjustedEnd.setMonth(currentMonth);

      return {
          start: adjustedStart,
          end: adjustedEnd,
          title: lesson.title
       
      };
  });
};