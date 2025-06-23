import Announcements from "@/components/Announcements";
import BigCalenderContainer from "@/components/BigCalenderContainer";
import LastContents from "@/components/home/LastContents";
import RecentAssignments from "@/components/home/RecentAssignmentSubmission";
import TeacherQuote from "@/components/home/TeacherQuote";
import WeeklySchedule from "@/components/schedules/WeeklySchedule";
import prisma from "@/lib/prisma";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { parse } from "path";

const TeacherPage = async () => {

  const { role, current_user_id,institution_id } = await getRoleAndUserIdAndInstitutionId();

  const rawSchedules = await prisma.lesson_schedules.findMany({
    where: {
      teacher_id: parseInt(current_user_id),
      schedules: {
        status: "ACTIVE",
      },
    },
  });

  const dayOfWeekMap: Record<string, string> = {
    Monday: "Pazartesi",
    Tuesday: "Salı",
    Wednesday: "Çarşamba",
    Thursday: "Perşembe",
    Friday: "Cuma",
    Saturday: "Cumartesi",
    Sunday: "Pazar",
};

const lessonSchedules = rawSchedules.map(schedule => {
  let startTime: string | Date = schedule.start_time;
  let endTime: string | Date = schedule.end_time;
  
  // Tarih nesnesi ise string formatına dönüştür
  if (startTime instanceof Date) {
      startTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
  }
  
  if (endTime instanceof Date) {
      endTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
  }

  const dayOfWeek = dayOfWeekMap[schedule.day_of_week] || schedule.day_of_week;
  
  return {
          ...schedule,
          start_time: startTime,
          end_time: endTime,
          day_of_week: dayOfWeek
  };
});

const classes = await prisma.classes.findMany({
  include: {
    teacher_class: {
      where: {
        teacher_id: parseInt(current_user_id),
      },
    },
  },
});

const lessons = await prisma.lessons.findMany({
  where:{
    lesson_schedules: {
      some: {
        teacher_id: parseInt(current_user_id),
      },
    },
   
  }
 
});

const teachers = await prisma.teachers.findMany({
  where: {
    id: parseInt(current_user_id),
  },
});

const relatedData = {
  classes:classes,
  lessons: lessons,
  teachers: teachers,
}

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
      
        <div className="h-full rounded-md flex flex-col gap-4 ">
                <div className="lg:h-1/3">
                <LastContents />
                </div>
                <div>
                  <TeacherQuote />
                </div>
                <div>
                <WeeklySchedule lessonSchedules={lessonSchedules} relatedData={relatedData} header={"Haftalık Ders Programı"} />
                </div>

        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <RecentAssignments />
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;
