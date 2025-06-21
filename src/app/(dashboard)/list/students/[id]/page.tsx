
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import ClassCodeDisplay from "@/components/StudentPage/ClassCodeUpdate";
import WeeklySchedule from "@/components/schedules/WeeklySchedule";
import prisma from "@/lib/prisma";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { classes, students } from "@prisma/client";
import { get } from "http";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { parse } from "path";
import { Suspense } from "react";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {

  const {role, current_user_id, institution_id} = await getRoleAndUserIdAndInstitutionId();

  let student: 
    | (students & {
        student_class: Array<{
          classes: classes;
        }>;
      })
    | null = null; // Initialize the student variable to null

  if( role == "admin" && institution_id){

    student = await prisma.students.findUnique({
        where: { id: parseInt(id) },
        include: {
          student_class: {
            where: {
              classes: {
                institution_id: parseInt(institution_id), // Institution ID eşleşmesi
              },
            },
            take: 1, // İlk eşleşen sınıf
            include: {
              classes: true, // Sınıf detayları
            },
          },
        },
      });

    
  } else if(role == "teacher" && current_user_id){

     student  = await prisma.students.findUnique({
        where: { id: parseInt(id) },
        include: {
          student_class: {
            where: {
              classes: {
                // get teacher_classes with teacher_id
                teacher_class:{
                  some:{
                    teacher_id: parseInt(current_user_id)
                  }
                }
              },
            },
            take: 1, // İlk eşleşen sınıf
            include: {
              classes: true, // Sınıf detayları
            },
          },
        },
      });
  }

  const firstClass = student?.student_class?.[0]?.classes;

  if (!student) {
    return notFound();
  }

  const class_count = student?.student_class?.length || 0;

  // fetching lesson schedules with the first class id for the student
  const rawSchedules = await prisma.lesson_schedules.findMany({
    where:{
      schedules: {
        class_id: firstClass?.id,
        status: "ACTIVE"
      },
    }
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
  
  // İngilizce gün adını Türkçe'ye çevir
  const dayOfWeek = dayOfWeekMap[schedule.day_of_week] || schedule.day_of_week;
  
  return {
          ...schedule,
          start_time: startTime,
          end_time: endTime,
          day_of_week: dayOfWeek
  };
});

const teachers = await prisma.teachers.findMany({
  where: { 
          id: { 
                  in: lessonSchedules.map(schedule => schedule.teacher_id) 
          } 
  }
});

const lessons = await prisma.lessons.findMany({
  where: { 
          id: { 
                  in: lessonSchedules.map(schedule => schedule.lesson_id) 
          } 
  }
});

const relatedData = {
  teachers: teachers,
  lessons: lessons,
};


  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={student.photo || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name + " " + student.surname}
                </h1>
                {role === "admin" && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>
              <p className="text-sm text-gray-500">
              </p>
              <div className="flex items-center justify-start gap-2 flex-wrap text-xs font-medium">
               
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(student.birth_date? new Date(student.birth_date): new Date())}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{student.email || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>{student.school_no || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <Suspense fallback="loading...">
              </Suspense>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {firstClass?.grade}.
                </h1>
                <span className="text-sm text-gray-400">Sınıf</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {firstClass?.grade}
                </h1>
                <span className="text-sm text-gray-400">Dersler</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <ClassCodeDisplay 
                firstClass={firstClass}
                role={role}
                id = {student.id}
              />
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-2">
       <WeeklySchedule lessonSchedules={lessonSchedules} relatedData={relatedData} />

        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Kısayollar</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/lessons?grade=${firstClass?.grade ?? ''}`}
            >
              Öğrenci&apos;nin Dersleri
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/teachers?classId=${firstClass?.id ?? ''}`}
            >
              Öğrenci&apos;nin Öğretmenleri
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?classId=${firstClass?.id ?? ''}`}
            >
              Öğrenci&apos;nin Sınavları
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/assignments?classId=${firstClass?.id ?? ''}`}
            >
              Öğrenci&apos;nin Ödevleri
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/results?studentId=${student.id}`}
            >
              Öğrenci&apos;nin Sonuçları
            </Link>
          </div>
        </div>
        <Performance />
      </div>
    </div>
  );
};

export default SingleStudentPage;