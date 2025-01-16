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
  let whereCondition;

  if (type === "teacher_id") {
    // Eğer teacher_id üzerinden erişiyorsak
    whereCondition = { teacher_id: id };
  } else if (type === "class_id") {
    // Eğer class_id üzerinden erişiyorsak
    const activeSchedules = await prisma.schedules.findMany({
      where: {
        class_id: id, // class_id eşleşmesi
        status: "ACTIVE", // Sadece aktif schedule'lar
      },
    });

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

    whereCondition = {
      schedule_id: {
        in: scheduleIds, // Sadece aktif schedule'lara ait lesson_schedules
      },
    };
  }

  // Lesson schedules verisini getir
  const dataRes = await prisma.lesson_schedules.findMany({
    where: whereCondition,
    include: {
      lessons: true,
      teachers: true,
    },
  });
  
   const data = dataRes.map((lesson_schedule) => ({
    title: lesson_schedule.lessons.name,
    start: lesson_schedule.start_time,
    end: lesson_schedule.end_time,
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

