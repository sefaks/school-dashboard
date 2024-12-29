import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { parse } from "path";
import { adjustScheduleToCurrentMonth } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacher_id" | "classId";
  id: number;
}) => {
  const whereCondition =
    type === "teacher_id"
      ? { teacher_id: id }
      : { class_id: id };

  // get lesson_Schedules from prisma with where condition
  const dataRes = await prisma.lesson_schedules.findMany({
    where: whereCondition,
    include: {
      lessons: true,
      teachers: true,
    },
  });

  const data = dataRes.map((lesson_schedule) => ({
    start: lesson_schedule.start_time,
    end: lesson_schedule.end_time,
    title: lesson_schedule.lessons?.name ?? "No Title",
  }));

  console.log(data);
  const schedule = adjustScheduleToCurrentMonth(data);
  console.log(schedule);

  return (
    <div className="bg-blue">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;

