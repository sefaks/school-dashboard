import BigCalendarContainer from "@/components/BigCalenderContainer";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { classes, students } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import Performance from "@/components/Performance";




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
                                            <span>{classModel.student_class?.length || 0} Students</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Image src="/teacher.png" alt="Teachers" width={20} height={20} />
                                            <span> Teachers</span>
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
                                        <span className="text-sm text-gray-400">Subjects</span>
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
                                        <span className="text-sm text-gray-400">Teachers</span>
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
                                        <span className="text-sm text-gray-400">Students</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* CLASS SCHEDULE */}
                        <div className="mt-4">
                            <BigCalendarContainer type="class_id" id={classModel?.id} />
                        </div>
                    </div>
                    {/* RIGHT */}
                    <div className="w-full xl:w-1/3 flex flex-col gap-4">
                        {/* SHORTCUTS */}
                        <div className="bg-white p-4 rounded-md">
                            <h1 className="text-xl font-semibold">Shortcuts</h1>
                            <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
                                <Link
                                    className="p-3 rounded-md bg-lamaSkyLight"
                                    href={`/list/students?classId=${classModel?.id}`}
                                >
                                    Class&apos;s Students
                                </Link>
                                <Link
                                    className="p-3 rounded-md bg-lamaPurpleLight"
                                    href={`/list/teachers?classId=${classModel?.id}`}
                                >
                                    Class&apos;s Teachers
                                </Link>
                                <Link
                                    className="p-3 rounded-md bg-pink-50"
                                    href={`/list/assignments?classId=${classModel?.id}`}
                                >
                                    Class&apos;s Assignments
                                </Link>
                                <Link
                                    className="p-3 rounded-md bg-lamaYellowLight"
                                    href={`/list/schedule?classId=${classModel?.id}`}
                                >
                                    Class&apos;s Schedules
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
    

