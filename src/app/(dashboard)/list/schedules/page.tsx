
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
import { DateTime } from "luxon";
import { parse } from "path";

// Tip tanımlamaları
type ClassWithSchedule = classes & {
  schedules: schedules[];
};

type StudentSchedule = {
  id: number;
  name: string;
  surname: string;
  grade: number;
  created_at: Date;
  school_no: string;
  // array schedules
  student_schedules?: student_schedules[];
};

const columns = [
  { header: "İsim", accessor: "name" },
  { header: "Sınıf", accessor: "class" },
  { header: "Durum", accessor: "status", className: "hidden md:table-cell" },
  { header: "Aksiyonlar", accessor: "actions", className: "hidden md:table-cell" },
];

// Admin için satır render fonksiyonu
// Admin için satır render fonksiyonu
const renderAdminRow = (item: ClassWithSchedule, role: string) => {
  console.log("Item:", item);
  
  // Eğer schedule yoksa tek satır göster, varsa schedule'ları listele
  return !item.schedules || item.schedules.length === 0 ? (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4">
        {`${item.class_code} Programı`}
      </td>
      <td>{item.class_code}</td>
      <td className="hidden md:table-cell">
        <span className="bg-gray-500 text-white py-1 px-3 rounded-full">
          Program Yok
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <RedirectButton
            type="update"
            page_type="schedules"
            overrideUrl={`/list/schedules/create-class-schedule?id=${item.id}`}
          />
          <FormContainer table="class" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  ) : (
    <>
      {item.schedules.map((schedule, index) => (
        <tr
          key={`${item.id}-${schedule.id}`}
          className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
        >
          <td className="flex items-center gap-4">
            {schedule.name || `${item.class_code} Programı`}
          </td>
          <td>{item.class_code}</td>
          <td className="hidden md:table-cell">
            <span
              className={`${
                schedule.status === 'ACTIVE'
                  ? 'bg-green-500'
                  : schedule.status === 'DRAFT'
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
              } text-white py-1 px-3 rounded-full`}
            >
              {schedule.status === 'ACTIVE'
                ? 'Aktif'
                : schedule.status === 'DRAFT'
                ? 'Taslak'
                : schedule.status === 'ARCHIVED'
                ? 'Arşiv'
                : '-'}
            </span>
          </td>
          <td>
            <div className="flex items-center gap-2">
              <RedirectButton
                type="update"
                page_type="schedules"
                overrideUrl={`/list/schedules/create-class-schedule?id=${schedule.id}`}
              />
              {/* Delete butonunu sadece ilk schedule'da göster */}
              <FormContainer table="schedule" type="delete" id={schedule.id} />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

// Öğretmen için satır render fonksiyonu
const renderTeacherRow = (item: StudentSchedule) => (

  // öğrencinin her bir programı için ayrı satır oluştur
  // Eğer öğrenci programı yoksa tek satır göster
  
  (!item.student_schedules || item.student_schedules.length ===0) ? (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4">{`${item.name} ${item.surname}`}</td>
      <td className="hidden md:table-cell">
        {item.created_at ? new Date(item.created_at).toLocaleString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        }) : 'Tarih Yok'}
      </td>
      <td>{item.grade}. Sınıf</td>
      <td className="hidden md:table-cell">
        <span className="bg-gray-500 text-white py-1 px-3 rounded-full">
          Program Yok
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <RedirectButton
            type="create"
            page_type="schedules"
            overrideUrl={`/list/schedules/create?student_id=${item.id}`}
          />
        </div>
      </td>
    </tr>
  ) : 

  item.student_schedules.map((schedule) => (
    <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4">{`${item.name} ${item.surname}`}</td>
    <td className="hidden md:table-cell">
      {schedule.created_at ? new Date(schedule.created_at).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      }) : 'Tarih Yok'}
    </td>
    
    <td>{item.grade}. Sınıf</td>
      {schedule.is_active ? (
         <td className="hidden md:table-cell">
         <span className={`bg-green-500 text-white py-1 px-3 rounded-full`}>
            Aktif
         </span>
       </td>
      ) : (
        <td className="hidden md:table-cell">
          <span className={`bg-yellow-600 text-white py-1 px-3 rounded-full`}>
            Pasif
          </span>
        </td>
      )}

    <td>
      <div className="flex items-center gap-2">
      <RedirectButton 
          type="update" 
          page_type="schedules" 
          overrideUrl={`/list/schedules/create?id=${schedule ? schedule.id : ''}`} 
        />
         <RedirectButton
          type="create"
          page_type="schedules"
          // özel URL override ediliyor
          overrideUrl={`/list/schedules/create?student_id=${item.id}`} 
        />
      </div>
    </td>
  </tr>
  ))
    
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

    // data'da schedule olmayan sınıfları filtrele
    data = data.filter(item => item.schedules && item.schedules.length > 0);

    console.log("Data:", data);

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
    let studentQuery: Prisma.studentsWhereInput = {
      student_class: {
        some: {
          class_id: {
            in: classIds,
          },
        },
      },
      
    };
  
    // Arama parametresi
    // Arama parametresi
  if (queryParams.search && queryParams.search.trim() !== "") {
    const searchTerm = queryParams.search.trim();
    const gradeNumber = parseInt(searchTerm);
    
    // Önceki koşulları koru ve AND ile birleştir
    studentQuery = {
      AND: [
        // Önceki sınıf koşulu
        {
          student_class: {
            some: {
              class_id: {
                in: classIds,
              },
            },
          },
        },
        // Arama koşulu
        {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { surname: { contains: searchTerm, mode: "insensitive" } },
            ...((!isNaN(gradeNumber)) ? [{ grade: gradeNumber }] : []),
          ],
        },
      ],
    };
  } else {
    // Arama yoksa sadece sınıf koşulunu kullan
    studentQuery = {
      student_class: {
        some: {
          class_id: {
            in: classIds,
          },
        },
      },
    };
  }

    // Öğrencileri al
    const allStudents = await prisma.students.findMany({
      where: studentQuery,
      include: {
        student_schedules: {
          orderBy: {
            is_active: 'desc', // Aktif programlar önce gelsin
          },
        }
      },
      // İlişkisel sıralama yerine doğrudan öğrenci alanlarını kullan
      orderBy: {
        id: 'asc', // veya başka bir alan kullanabilirsiniz
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    });
    
    const sortedStudents = [...allStudents].sort((a, b) => 
    (b.student_schedules?.length || 0) - (a.student_schedules?.length || 0)
  );
    
    // Görüntülenecek satırları belirle
    const displayedStudents = sortedStudents.filter(student => 
      !student.student_schedules || student.student_schedules.length === 0 || 
      student.student_schedules.some(schedule => true) // Burada ek filtreler ekleyebilirsin
    );
    
    // Gerçek count'u hesapla
    count = await prisma.students.count({
      where: studentQuery,
    });
  
    data = displayedStudents.map(student => ({
      id: student.id,
      name: student.name,
      surname: student.surname,
      grade: student.grade,
      school_no: student.school_no,
      student_schedules: student.student_schedules,
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
            {role === "admin" && (
        <RedirectButton
          type="create"
          page_type="schedules"
          // özel URL override ediliyor
          overrideUrl="/list/schedules/create-class-schedule"
        />
      )}
          </div>
        </div>
      </div>

      {/* LİSTE */}
      {data.length > 0 ? (
        <Table
          columns= {
            role === "admin" 
              ? columns 
              : [
                  { header: "Öğrenci Adı", accessor: "name" },
                  { header: "Oluşturulma Tarihi", accessor: "created_at", className: "hidden md:table-cell" },
                  { header: "Sınıf", accessor: "grade" },
                  { header: "Durum", accessor: "status", className: "hidden md:table-cell" },
                  { header: "Aksiyonlar", accessor: "actions" },
                ]
          }
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