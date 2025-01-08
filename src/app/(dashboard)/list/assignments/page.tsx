
import { authOptions } from "@/app/auth";
import FormContainer from "@/components/FormContainer";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { Prisma, assignments, assignmentstatus, classes, students, subject_name, teachers } from "@prisma/client";
import { getServerSession } from "next-auth";
import Image from "next/image";

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

  const subjectColors: Record<subject_name, string> = {
    [subject_name.TURKCE]: "text-red-500",
    [subject_name.MATEMATIK]: "text-blue-500",
    [subject_name.FEN_BILIMLERI]: "text-green-500",
    [subject_name.SOSYAL_BILGILER]: "text-yellow-500",
    [subject_name.INGILIZCE]: "text-teal-500",
    [subject_name.DIN_BILGISI]: "text-purple-500",
    [subject_name.COGRAFYA]: "text-indigo-500",
    [subject_name.TAR_H]: "text-orange-500",
  };

const AssignmentListPage = async ({searchParams}:{searchParams:{[key:string]:string} |undefined }) => {
  
  const { role, current_user_id,institution_id } = await getRoleAndUserIdAndInstitutionId();

const columns = [
  {
    header: "Subject",
    accessor: "name",
  },
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden md:table-cell",
  },
  {
    header: "Start Date",
    accessor: "startDate",
    className: "hidden md:table-cell",
  },
  {
    header: "Due Date",
    accessor: "dueDate",
    className: "hidden md:table-cell",
  },
  // actions for teacher, not
  ...(role === "teacher" ? 
  [{
     header: "Actions" ,
      accessor: "actions",
    }] : []),


];



const renderRow = (item: AssignmentList, role:string) => (
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
      {item.assignment_student?.map((student_item: { students: students }, index: number) => (
        <span key={student_item.students.id}>
          {student_item.students.name} {student_item.students.surname}
          {index < item.assignment_student.length - 1 && ', '}
        </span>
      ))}
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
        className={`${statusColors[item.status as assignmentstatus]} text-white py-1 px-3 rounded-full`}
        >
          {item.status}
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
  <td className="hidden md:table-cell"> {new Date(item.deadline_date).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </td>
    <td>
      <div className="flex items-center gap-2">
        {role === "teacher"  && (
          <>
            <FormModal table="assignment" type="update" data={item} />
            <FormModal table="assignment" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);



  // we get the page number from the searchParams, if there is no page number, we set it to 1
  const { page, ...queryParams } = searchParams as { [key: string]: string };
  const p = page ? parseInt(page) : 1; 

  // we define a query, which is an object, we will use it for getting the data. Its prisma feature for filtering the data
  const query:Prisma.assignmentsWhereInput = {}
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value === "") continue;
      
      switch (key) {
        case "search":
          // Boş string kontrolü
          if (!value) break;
          
          query.OR = [
            // Header araması
            {
              header: {
                contains: value,
                mode: "insensitive",
              }
            },
           
            // Class code araması
            {
              assignment_class: {
                some: {
                  classes: {
                    class_code: {
                      contains: value,
                      mode: "insensitive",
                    }
                  }
                }
              }
            }
          ];
           // Status araması sadece geçerli bir status değeri ise eklensin
        if (Object.values(assignmentstatus).includes(value as assignmentstatus)) {
          query.status = value as assignmentstatus;
        }
  
          // Eğer geçerli bir tarih ise, tarih araması da ekle
          if (!isNaN(Date.parse(value))) {
            query.OR.push({
              start_date: {
                gte: new Date(value)
              }
            });
          }
          
          break;
      }
    }
  
  }

  // We filter the data according to the role of the user
  switch (role) {
    case "admin":
      // filter that institution_id is equal to all assignment class and assignment_student's student institution_id
      query.OR = [
        {
          assignment_class: { some: { classes: { institution_id: parseInt(institution_id) } } },
        },
        {
          assignment_student: { some: { students: { student_institution: { some: { institution_id: parseInt(institution_id) } } } } },
        },
      ];
      break;
  
    // If the user is a teacher, we filter the data according to the teacher's id
    case "teacher":
      query.assignee_type = "TEACHER"; // Öğretmenlerin atadığı ödevler
      query.assignee_id = parseInt(current_user_id); // Giriş yapan öğretmenin id'si
      break;
  }
            
  // transactions are used to execute multiple queries at once. We get the data and the count of the data together. We using studentsData for rendering the table data and count for pagination
    const [assignmentsData, count] = await prisma.$transaction([
      prisma.assignments.findMany({
        where: {
          ...query, // Include any other filters from your query
          deadline_date: {
            gte: new Date(), // Only include assignments with a deadline greater than or equal to the current date
          },
        },
        include: {
          subjects: true, // subjects ilişkisini dahil ediyoruz
          assignment_class: { // assignment_class ilişkisini dahil ediyoruz
            include: {
              classes: true, // classes ilişkisini dahil ediyoruz
            }
          },
          assignment_student: { // assignment_student ilişkisini dahil ediyoruz
            include: {
              students: true, // students ilişkisini dahil ediyoruz
            }
        },

        },
        take: ITEM_PER_PAGE, // Sayfa başına gösterilecek öğe sayısı
        skip: (p - 1) * ITEM_PER_PAGE, // Sayfalama işlemi için verileri atlamak
        orderBy: {
          deadline_date: "asc", // Sıralama işlemi
        },
      }),
      
      // assignments tablosunun toplam sayısını alıyoruz
      prisma.assignments.count({
        where: {
          ...query, // Apply the same filtering criteria
          deadline_date: {
            gte: new Date(), // Same filter for counting future assignments
          },
        },
      }),
    ]);

    console.log(assignmentsData);
    
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
            <FormContainer table="assignment" type="create" />
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