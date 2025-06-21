import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import Image from "next/image";
import Link from 'next/link';
import FormContainer from '@/components/FormContainer';
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface ReportWithStudent {
  id: number;
  week_start_date: Date;
  week_end_date: Date;
  total_tests: number;
  average_test_score: number;
  total_solved_questions: number;
  student: {
    id: number;
    name: string;
    surname: string;
    grade: number | null;
  };
}

const columns = [
  { header: "Öğrenci", accessor: "name" },
  { header: "Sınıf", accessor: "class" },
  { header: "Analiz Türü", accessor: "type", className: "hidden md:table-cell" },
  { header: "Zaman Aralığı", accessor: "dueDate", className: "hidden md:table-cell" },
  { header: "Aksiyonlar", accessor: "actions" }
];

const renderRow = (item: ReportWithStudent, role: string) => (
  <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
    <td>{`${item.student.name} ${item.student.surname}`}</td>
    <td>{`${item.student.grade || 0}. Sınıf`}</td>
    <td className="hidden md:table-cell">Haftalık Analiz</td>
    <td className="hidden md:table-cell">
      {`${new Date(item.week_start_date).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })} - ${new Date(item.week_end_date).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`}
    </td>
    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/analysis/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="" width={16} height={16} />
          </button>
        </Link>
      </div>
    </td>
  </tr>
);

async function getStudentAnalysisData(role: string, userId: string, institutionId: string, page: number, searchQuery?: string) {
  let reportsData: ReportWithStudent[] = [];
  let totalCount = 0;

  try {
    if (role === "admin") {
      // Admin için sorgu - Report bazında
      const reportQuery: Prisma.student_analytics_summaryWhereInput = {
        students: {
          student_institution: {
            some: {
              institution_id: parseInt(institutionId)
            }
          }
        }
      };

      // Arama filtresi ekle
      if (searchQuery) {
        reportQuery.students = {
          ...reportQuery.students,
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { surname: { contains: searchQuery, mode: "insensitive" } },
            { school_no: { contains: searchQuery, mode: "insensitive" } }
                    ]
        };
      }

      // Raporları ve öğrenci bilgilerini getir
      const reports = await prisma.student_analytics_summary.findMany({
        where: reportQuery,
        include: {
          students: {
            select: {
              id: true,
              name: true,
              surname: true,
              grade: true
            }
          }
        },
        orderBy: {
          week_start_date: 'desc'
        },
        take: ITEM_PER_PAGE,
        skip: (page - 1) * ITEM_PER_PAGE
      });

      // Toplam sayı
      totalCount = await prisma.student_analytics_summary.count({
        where: reportQuery
      });

      // Veriyi dönüştür
      reportsData = reports.map(report => ({
        id: report.id,
        week_start_date: report.week_start_date,
        week_end_date: report.week_end_date,
        total_tests: report.total_tests,
        average_test_score: report.average_test_score,
        total_solved_questions: report.total_solved_questions,
        student: {
          id: report.students.id,
          name: report.students.name,
          surname: report.students.surname,
          grade: report.students.grade
        }
      }));

    } else if (role === "teacher") {
      // Öğretmen için sorgu - Report bazında
      const teacherClasses = await prisma.teacher_class.findMany({
        where: {
          teacher_id: parseInt(userId)
        },
        select: {
          class_id: true
        }
      });

      const classIds = teacherClasses.map(tc => tc.class_id);

      const reportQuery: Prisma.student_analytics_summaryWhereInput = {
        students: {
          student_class: {
            some: {
              class_id: {
                in: classIds
              }
            }
          }
        }
      };

      // Arama filtresi ekle
      if (searchQuery) {
        const searchConditions = [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { surname: { contains: searchQuery, mode: "insensitive" } },
          { school_no: { contains: searchQuery, mode: "insensitive" } }
        ];

      const gradeNumber = parseInt(searchQuery);
        if (!isNaN(gradeNumber)) {
          searchConditions.push({ grade: { equals: gradeNumber } });
        }

        reportQuery.students = {
          ...reportQuery.students,
          OR: searchConditions
        };
      }
        
      // Raporları ve öğrenci bilgilerini getir
      const reports = await prisma.student_analytics_summary.findMany({
        where: reportQuery,
        include: {
          students: {
            select: {
              id: true,
              name: true,
              surname: true,
              grade: true
            }
          }
        },
        orderBy: {
          week_start_date: 'desc'
        },
        take: ITEM_PER_PAGE,
        skip: (page - 1) * ITEM_PER_PAGE
      });

      // Toplam sayı
      totalCount = await prisma.student_analytics_summary.count({
        where: reportQuery
      });

      // Veriyi dönüştür
      reportsData = reports.map(report => ({
        id: report.id,
        week_start_date: report.week_start_date,
        week_end_date: report.week_end_date,
        total_tests: report.total_tests,
        average_test_score: report.average_test_score,
        total_solved_questions: report.total_solved_questions,
        student: {
          id: report.students.id,
          name: report.students.name,
          surname: report.students.surname,
          grade: report.students.grade
        }
      }));
    }

    return { data: reportsData, count: totalCount };
  } catch (error) {
    console.error("Analiz verileri alınırken hata oluştu:", error);
    throw error;
  }
}

export default async function StudentAnalysisPage({
  searchParams
}: {
  searchParams: { [key: string]: string } | undefined;
}) {
  // Kullanıcı bilgilerini al
  const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

  // Sayfalama ve arama parametrelerini al
  const { page, search } = searchParams || {};
  const p = page ? parseInt(page) : 1;
  const searchQuery = search || "";

  // Verileri getir
  const { data: analysisData, count } = await getStudentAnalysisData(
    role, 
    current_user_id, 
    institution_id, 
    p,
    searchQuery
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* BAŞLIK VE ARAMA */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Öğrenci Analizleri</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>

      {/* LİSTE */}
      {analysisData.length > 0 ? (
        <Table 
          columns={columns} 
          renderRow={(item) => renderRow(item as ReportWithStudent, role)} 
          data={analysisData} 
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Henüz analiz verisi bulunmamaktadır.
        </div>
      )}

      {/* SAYFALAMA */}
      <Pagination page={p} count={count} />
    </div>
  );
}