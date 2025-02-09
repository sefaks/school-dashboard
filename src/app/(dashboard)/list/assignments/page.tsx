
import { authOptions } from "@/app/auth";
import RedirectButton from "@/components/AssignmentPage/RedirectButton";
import FormContainer from "@/components/FormContainer";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { Prisma, assignments, assignmentstatus, classes, documents, students, subject_name, teachers } from "@prisma/client";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { FaFilePdf } from "react-icons/fa";  // FontAwesome PDF ikonu kullanıyoruz



global.Buffer = global.Buffer || require('buffer').Buffer;

type AssignmentList = assignments & {
  assignment_class: Array<{
    classes: classes;
  }>;
  assignment_teacher: Array<{
    teachers: teachers;
  }>;
  // get assignment student with student_institution and get institution_id
  assignment_student: Array<{
    students: students;
  }>;
  assignment_document: Array<{
    documents: documents;
  }>;
  
  subjects: {
    subject_name: string;
  };

    
 
};

  const statusColors: { [key in assignmentstatus]: string } = {
    ASSIGNED: "bg-blue-500",
    COMPLETED: "bg-green-500",
    PENDING: "bg-purple-500",
    PAST_DUE: "bg-red-500",
  };

  // status colors to Turkish
  const statusColorsTR: { [key in assignmentstatus]: string } = {
    ASSIGNED: "ATANDI",
    COMPLETED: "TAMAMLANDI",
    PENDING: "BEKLEMEDE",
    PAST_DUE: "GEÇMİŞ"
  };
    



  const subjectColors: Record<subject_name, string> = {
    [subject_name.TURKCE]: "text-red-600",
    [subject_name.MATEMATIK]: "text-blue-600",
    [subject_name.FEN_BILIMLERI]: "text-green-600",
    [subject_name.SOSYAL_BILGILER]: "text-yellow-600",
    [subject_name.INGILIZCE]: "text-teal-500",
    [subject_name.DIN_BILGISI]: "text-purple-500",
    [subject_name.COGRAFYA]: "text-indigo-500",
    [subject_name.TAR_H]: "text-orange-500",
    [subject_name.F_Z_K]: "text-pink-500",
    [subject_name.K_MYA]: "text-gray-500",
    [subject_name.B_YOLOJ_]: "text-lime-500",
    [subject_name.EDEB_YAT]: "text-cyan-500",
    [subject_name.GEOMETR_]: "text-rose-500",

  };

const AssignmentListPage = async ({searchParams}:{searchParams:{[key:string]:string} |undefined }) => {
  
  const { role, current_user_id,institution_id } = await getRoleAndUserIdAndInstitutionId();

const columns = [
  {
    header: "Ders",
    accessor: "name",
  },
  {
    header: "Sınıf",
    accessor: "class",
  },
  {
    header: "Durum",
    accessor: "status",
    className: "hidden md:table-cell",
  },
  {
    header: "Başlangıç Zamanı",
    accessor: "startDate",
    className: "hidden md:table-cell",
  },
  {
    header: "Bitiş Zamanı",
    accessor: "dueDate",
    className: "hidden md:table-cell",
  },
  {
    header:"Dökümanlar",
    accessor:"documents",
    className: "hidden md:table-cell",
  }
  ,
  // actions for teacher, not
  ...(role === "teacher" ? 
  [{
     header: "Aksiyonlar" ,
      accessor: "actions",
    }] : []),


];



const renderRow = (item: AssignmentList, role: string) => {
  // Şu anki tarihi alalım
  const currentDate = new Date();
  
  // Deadline tarihini karşılaştırma için Date objesine çevirelim
  const deadlineDate = new Date(item.deadline_date);

  // Deadline tarihi geçmişse kırmızı, değilse normal stil
  const deadlineStyle = deadlineDate < currentDate ? "text-red-500" : "text-green-600"; // Kırmızı ya da normal

  return (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="hidden md:table-cell">
        {item.subjects ? (
          <span
            className={`${subjectColors[item.subjects.subject_name as subject_name]} py-1 px-3 rounded-full`}
          >
            {item.subjects.subject_name}
          </span>
        ) : (
          "No subject assigned"
        )}
      </td>

      <td className="hidden md:table-cell">
        {item.assignment_class?.map((class_item: { classes: classes }, index: number) => (
          <span key={class_item.classes.id}>
            {class_item.classes.class_code}
            {index < item.assignment_class.length - 1 && ', '}
          </span>
        ))}
      </td>

      <td className="hidden md:table-cell">
        {item.subjects ? (
         <span
         className={`${statusColors[item.status as keyof typeof statusColors] || 'bg-gray-500'} text-white py-1 px-3 rounded-full`}
       >
         {statusColorsTR[item.status as keyof typeof statusColorsTR] || "BİLİNMİYOR"}
       </span>
        ) : (
          "No status assigned"
        )}
      </td>

      <td className="hidden md:table-cell">
        {new Date(item.start_date).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </td>

      <td className={`hidden md:table-cell ${deadlineStyle}`}>
        {new Date(item.deadline_date).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </td>

   <td className="hidden md:table-cell">
  {item.assignment_document?.map((document_item: { documents: documents }) => (
    <div className="flex items-center gap-2" key={document_item.documents.id}>
      {document_item.documents.url ? (
        <>
          <span>{document_item.documents.name}</span>
          <div className="flex items-center">
          <div style={{ color: "red" }}>
            <FaFilePdf size={24} />
          </div>            
          </div>
        </>
      ) : (
        <span>No content available</span>
      )}
    </div>
  ))}
</td>

      <div className="flex items-center gap-2">
        <Link href={`/list/assignments/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="" width={16} height={16} />
          </button>
        </Link>
        {role === "teacher" && (
              <>
                <RedirectButton type="update" id={item.id} page_type="assignments" />
                <FormContainer table="assignment" type="delete" id={item.id} />
              </>
            )}
          </div>
    </tr>
  );
};





const { page, ...queryParams } = searchParams as { [key: string]: string };
const p = page ? parseInt(page) : 1;

const query: Prisma.assignmentsWhereInput = {};
let searchConditions: any[] = [];
let roleConditions: any[] = [];

// Handle search conditions
if (queryParams.search) {
  searchConditions = [
    {
      header: {
        contains: queryParams.search,
        mode: "insensitive",
      }
    },
    {
      assignment_class: {
        some: {
          classes: {
            class_code: {
              equals: queryParams.search.trim(), // Changed from contains to equals
              mode: "insensitive",
            }
          }
        }
      }
    }
  ];

  // Status araması sadece geçerli bir status değeri ise
  if (Object.values(assignmentstatus).includes(queryParams.search as assignmentstatus)) {
    searchConditions.push({
      status: queryParams.search as assignmentstatus
    });
  }

  // Tarih araması için geçerli tarih kontrolü
  if (!isNaN(Date.parse(queryParams.search))) {
    searchConditions.push({
      start_date: {
        gte: new Date(queryParams.search)
      }
    });
  }
}

// Handle other query parameters
if (queryParams.classId) {
  query.assignment_class = {
    some: {
      class_id: parseInt(queryParams.classId)
    }
  };
}

// Role based conditions
switch (role) {
  case "admin":
    roleConditions = [
      {
        assignment_class: { 
          some: { 
            classes: { 
              institution_id: parseInt(institution_id) 
            } 
          } 
        },
      },
      {
        assignment_student: { 
          some: { 
            students: { 
              student_institution: { 
                some: { 
                  institution_id: parseInt(institution_id) 
                } 
              } 
            } 
          } 
        },
      },
    ];
    break;

  case "teacher":
    query.assignee_type = "TEACHER";
    query.assignee_id = parseInt(current_user_id);
    break;
}

// Combine conditions
if (searchConditions.length > 0 && roleConditions.length > 0) {
  // Both search and role conditions exist
  query.AND = [
    { OR: searchConditions },
    { OR: roleConditions }
  ];
} else if (searchConditions.length > 0) {
  // Only search conditions exist
  query.OR = searchConditions;
} else if (roleConditions.length > 0) {
  // Only role conditions exist
  query.AND = roleConditions;
}

// Add date filter
const currentDate = new Date();
const oneMonthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

// Use the query in transaction
const [assignmentsData, count] = await prisma.$transaction([
  prisma.assignments.findMany({
    where: {
      ...query,
      deadline_date: {
        gte: oneMonthAgo,
      },
    },
    include: {
      subjects: true,
      assignment_class: {
        include: {
          classes: true,
        }
      },
      assignment_student: {
        include: {
          students: true,
        }
      },
      assignment_document: {
        include: {
          documents: true,
        }
      }
    },
    take: ITEM_PER_PAGE,
    skip: (p - 1) * ITEM_PER_PAGE,
    orderBy: {
      deadline_date: "asc",
    },
  }),
  prisma.assignments.count({
    where: {
      ...query,
      deadline_date: {
        gte: oneMonthAgo,
      },
    },
  }),
]);

    
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Assignments
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" || role === "teacher" &&               
            <RedirectButton type="create" page_type="assignments" />
            }
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={(item) => renderRow(item, role)} data={assignmentsData} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AssignmentListPage;