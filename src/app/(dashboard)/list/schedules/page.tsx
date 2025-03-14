import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { classes, schedules, Prisma, student_schedules } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import FormContainer from "@/components/FormContainer";
import RedirectButton from "@/components/AssignmentPage/RedirectButton";

// Tip tanımlamaları
type ClassWithSchedule = classes & {
  schedules: schedules[];
};

type StudentSchedule = {
  id: number;
  name: string;
  surname: string;
  grade: number;
  school_no: string;
  schedule: student_schedules | null;
};

const columns = [
  { header: "İsim", accessor: "name" },
  { header: "Sınıf", accessor: "class" },
  { header: "Durum", accessor: "status", className: "hidden md:table-cell" },
  { header: "Aksiyonlar", accessor: "actions", className: "hidden md:table-cell" },
];

// Admin için satır render fonksiyonu
const renderAdminRow = (item: ClassWithSchedule, role: string) => {
  const schedule = item.schedules && item.schedules.length > 0 ? item.schedules[0] : null;
  
  return (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4">
        {schedule ? schedule.name : `${item.class_code} Programı`}
      </td>
      <td>{item.class_code}</td>
      <td className="hidden md:table-cell">
        <span
          className={`${schedule?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'} text-white py-1 px-3 rounded-full`}
        >
          {schedule?.status || 'Program Yok'}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/classes/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <FormContainer table="schedule" type="update" data={item} />
          <FormContainer table="class" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );
};

// Öğretmen için satır render fonksiyonu
const renderTeacherRow = (item: StudentSchedule) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4">{`${item.name} ${item.surname}`}</td>
    <td>{item.grade}. Sınıf</td>
    <td className="hidden md:table-cell">
      <span className={`bg-green-500 text-white py-1 px-3 rounded-full`}>
        {item.schedule ? 'Aktif' : 'Program Yok'}
      </span>
    </td>
    <td>
      <div className="flex items-center gap-2">
        <RedirectButton type="update" id={item.id} page_type="schedules" />
      </div>
    </td>
  </tr>
);

const ScheduleListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string } | undefined;
}) => {
  // Kullanıcı rolü ve kurum bilgilerini al
  const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

  // Sayfalama parametrelerini al
  const { page, ...queryParams } = searchParams || {};
  const p = page ? parseInt(page) : 1;

  // Veri ve toplam sayı değişkenleri
  let data: ClassWithSchedule[] | StudentSchedule[] = [];
  let count = 0;

  if (role === "admin") {
    // Admin sorgusu
    const classQuery: Prisma.classesWhereInput = {
      institution_id: parseInt(institution_id),
    };

    // Arama parametresini işle
    if (queryParams.search) {
      classQuery.OR = [
        { class_code: { contains: queryParams.search, mode: "insensitive" } },
      ];
    }

    // Admin için veri al
    [data, count] = await prisma.$transaction([
      prisma.classes.findMany({
        where: classQuery,
        include: {
          schedules: true,

        },
        take: ITEM_PER_PAGE,
        skip: (p - 1) * ITEM_PER_PAGE,
      }),
      prisma.classes.count({
        where: classQuery,
      }),
    ]);

  } else if (role === "teacher") {
    // Öğretmenin öğrencilerini ve programlarını al
    const teacherClasses = await prisma.teacher_class.findMany({
      where: {
        teacher_id: parseInt(current_user_id),
      },
      select: {
        class_id: true,
      },
    });

    const classIds = teacherClasses.map(tc => tc.class_id);

    // Öğrencileri sorgula
    const studentQuery: Prisma.studentsWhereInput = {
      student_class: {
        some: {
          class_id: {
            in: classIds,
          },
        },
      },
    };

    // Arama parametresi
    if (queryParams.search) {
      studentQuery.OR = [
        { name: { contains: queryParams.search, mode: "insensitive" } },
        { surname: { contains: queryParams.search, mode: "insensitive" } },
        { school_no: { contains: queryParams.search, mode: "insensitive" } },
      ];
    }

    // Öğrencileri al
    const students = await prisma.students.findMany({
      where: studentQuery,
      include: {
        student_schedule: {
          where: {
            assignee_id: parseInt(current_user_id),
            assignee_type: "teacher",
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    });

    count = await prisma.students.count({
      where: studentQuery,
    });

    // Öğrenci verilerini dönüştür
    data = students.map(student => ({
      id: student.id,
      name: student.name,
      surname: student.surname,
      grade: student.grade,
      school_no: student.school_no,
      schedule: student.student_schedule[0] || null,
    }));
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* BAŞLIK VE ARAMA */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Tüm Programlar</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="schedule" type="create" />}
          </div>
        </div>
      </div>

      {/* LİSTE */}
      {data.length > 0 ? (
        <Table
          columns={columns}
          renderRow={role === "admin" 
            ? (item) => renderAdminRow(item as ClassWithSchedule, role) 
            : (item) => renderTeacherRow(item as StudentSchedule)
          }
          data={data}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Henüz program bulunmamaktadır.
        </div>
      )}

      {/* SAYFALAMA */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ScheduleListPage;