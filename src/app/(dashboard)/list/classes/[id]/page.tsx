import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { classes, students } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import Performance from "@/components/Performance";
import WeeklySchedule from "@/components/schedules/WeeklySchedule";


const singleClassPage = async ({
        params: { id },
}: {
        params: { id: string };
}
) => {

        const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

        let singleClass:
                | (classes & {
                        class_students: Array<{
                                students: students;
                        }>;
                        assignment_class: Array<{
                                assignments: {
                                        id: number;
                                        title: string;
                                        description: string;
                                        due_date: Date;
                                        created_at: Date;
                                };
                        }>;
                })
                | null = null; // Initialize the student variable to null

        
        const classModel = await prisma.classes.findUnique({
                where: { id: parseInt(id) },
                include: {
                        student_class: {
                                include: {
                                        students: true,
                                },
                        },
                        assignment_class: {
                                include: {
                                        assignments: true,
                                },
                        },
                },
        });

        if (!classModel) {
                return {
                        notFound: true,
                };
        }

        const rawSchedules = await prisma.lesson_schedules.findMany({
            where: {
                schedules: {
                    class_id: parseInt(id),
                    status: "ACTIVE"
                }
            }
        });

        // Ders programını WeeklySchedule bileşeninin beklediği formata dönüştür
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

        const lessons = await prisma.lessons.findMany({
            where: { 
                    id: { 
                            in: lessonSchedules.map(schedule => schedule.lesson_id) 
                    } 
            }
        });

        const teachers = await prisma.teachers.findMany({
            where: { 
                    id: { 
                            in: lessonSchedules.map(schedule => schedule.teacher_id) 
                    } 
            }
        });

        const relatedData = {
            lessons: lessons,
            teachers: teachers
        };


        return (
                <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
                    {/* LEFT */}
                    <div className="w-full xl:w-2/3">
                        {/* CLASS INFO */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
                                <div className="w-1/3">
                                    <Image
                                        src={"/class1.jpg"} // Default sınıf görseli
                                        alt="Class Image"
                                        width={150}
                                        height={150}
                                        className="w-36 h-36 rounded-full object-cover"
                                    />
                                </div>
                                <div className="w-2/3 flex flex-col justify-between gap-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <h1 className="text-xl font-semibold">{classModel.class_code}</h1>
                                        {/* Admin yetkisi varsa */}
                                        {role === "admin" && (
                                            <FormContainer table="class" type="update" data={classModel} />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-start gap-2 flex-wrap text-xs font-medium">
                                        <div className="flex items-center gap-2">
                                            <Image src="/singleClass.png" alt="Class Code" width={20} height={20} />
                                            <span>{classModel.class_code || "-"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Image src="/student.png" alt="Students" width={14} height={20} />
                                            <span>{classModel.student_class?.length || 0} Öğrenciler</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Image src="/teacher.png" alt="Teachers" width={20} height={20} />
                                            <span> Öğretmenler</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* SMALL CARDS */}
                            <div className="flex-1 flex gap-4 justify-between flex-wrap">
                                {/* SUBJECTS CARD */}
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]">
                                                        <Image
                                        src="/singleBranch.png"
                                        alt=""
                                        width={24}
                                        height={24}
                                        className="w-6 h-6"
                                    />                        
                                        <div>
                                        <h1 className="text-xl font-semibold">{classModel.assignment_class?.length || 0}</h1>
                                        <span className="text-sm text-gray-400">Dersler</span>
                                    </div>
                                </div>
                                {/* TEACHERS CARD */}
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]">
                                <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />                                  <div>
                                        <h1 className="text-xl font-semibold">{classModel.class_code?.length || 0}</h1>
                                        <span className="text-sm text-gray-400">Öğretmenler</span>
                                    </div>
                                </div>
                                {/* STUDENTS CARD */}
                                <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]">
                                <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />                                    <div>
                                        <h1 className="text-xl font-semibold">{classModel.student_class?.length || 0}</h1>
                                        <span className="text-sm text-gray-400">Öğrenciler</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* CLASS SCHEDULE */}
                        <div className="mt-4 overflow-x-auto">
                        <WeeklySchedule lessonSchedules={lessonSchedules} relatedData={relatedData} header={`Sınıf Programı: ${classModel.class_code}`} />
                    </div>
                    </div>
                    {/* RIGHT */}
                    <div className="w-full xl:w-1/3 flex flex-col gap-4">
                        {/* SHORTCUTS */}
                        <div className="bg-white p-4 rounded-md">
                            <h1 className="text-xl font-semibold">Kısa Yollar</h1>
                            <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
                                <Link
                                    className="p-3 rounded-md bg-lamaSkyLight"
                                    href={`/list/students?classId=${classModel?.id}`}
                                >
                                    Sınıf&apos;ın Öğrencileri
                                </Link>
                                <Link
                                    className="p-3 rounded-md bg-lamaPurpleLight"
                                    href={`/list/teachers?classId=${classModel?.id}`}
                                >
                                    Sınıf&apos;s Öğretmenleri
                                </Link>
                                <Link
                                    className="p-3 rounded-md bg-pink-50"
                                    href={`/list/assignments?classId=${classModel?.id}`}
                                >
                                    Sınıf&apos;ın Ödevleri
                                </Link>
                             
                            </div>
                        </div>
                        {/* PERFORMANCE */}
                        <Performance />
                    </div>
                </div>
        );
}

export default singleClassPage;
    

