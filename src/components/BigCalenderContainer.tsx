import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentMonth, convertToTimeZone } from "@/lib/utils";
import {  toZonedTime } from 'date-fns-tz';
import { parseISO } from "date-fns/parseISO";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacher_id" | "class_id";
  id: number;
}) => {
  
  let activeSchedules: any[] = [];

  if (type === "class_id") {
    activeSchedules = await prisma.schedules.findMany({
      where: {
        class_id: id,
        status: "ACTIVE",
      },
    });
  }  else if (type === "teacher_id") {
    // teacher_id ile ilgili işlem
    // 1. İlk önce teacher'a ait sınıfları buluyoruz.
    const teacherClasses = await prisma.teacher_class.findMany({
      where: {
        teacher_id: id, // Belirli bir öğretmene ait sınıflar
      },
      include: {
       classes: true,
      },
    });

    const classIds = teacherClasses.map((teacherClass) => teacherClass.class_id);

    // 2. Sınıflara ait aktif schedule'ları buluyoruz
    activeSchedules = await prisma.schedules.findMany({
      where: {
        class_id: {
          in: classIds,
        },
        status: "ACTIVE",
      },
    });

  }


    // Eğer aktif schedule yoksa lesson_schedules sorgusu yapmayacağız
    if (activeSchedules.length === 0) {
      return (
        <div className="bg-blue">
          <BigCalendar data={[]} />
        </div>
      );
    }

    // Aktif schedule ID'lerini al
    const scheduleIds = activeSchedules.map((schedule) => schedule.id);

   const whereCondition = {
  schedule_id: {
    in: scheduleIds, // Sadece aktif schedule'lara ait lesson_schedules
  },
};

  // Lesson schedules verisini getir
  const dataRes = await prisma.lesson_schedules.findMany({
    where: whereCondition,
    include: {
      lessons: true,
      teachers: true,
      schedules: true,
    },
  });
  
   const data = dataRes.map((lesson_schedule) => ({
    title: lesson_schedule.lessons.name,
    start: lesson_schedule.start_time,
    end: lesson_schedule.end_time,
    day: lesson_schedule.day_of_week,
  }));



  // Veriyi mevcut aya göre düzenle
  const schedule = adjustScheduleToCurrentMonth(data);



  return (
    <div className="bg-blue">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;

