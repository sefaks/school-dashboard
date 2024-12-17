import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { classesData, role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, classes, students, teachers } from "@prisma/client";
import Image from "next/image";

type ClassList = classes & {
  student_class: Array<{  // in here, we define with array because a class can have multiple students
    students: students 
  }>; 
  teacher_class: Array<{  // in here, we define with array because a class can have multiple teachers
    teachers: teachers 
  }>;

};
  
const columns = [
  {
    header: "Class Name",
    accessor: "name",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Teachers",
    accessor: "teachers",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];


const renderRow = (item: ClassList) => (

  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.class_code}</td>
    <td className="hidden md:table-cell">{item.student_class?.length || 0}</td>
    <td className="hidden md:table-cell">{item.grade}</td>
    <td className="hidden md:table-cell">
      {item.teacher_class?.map((teacher_item: { teachers: teachers }, index: number) => (
        <span key={teacher_item.teachers.id}>
          {teacher_item.teachers.name} {teacher_item.teachers.surname}
          {index < item.teacher_class.length - 1 && ', '}
        </span>
      ))}
    </td> 
    <td>
      <div className="flex items-center gap-2">
          <>
            <FormModal table="class" type="update" data={item} />
            <FormModal table="class" type="delete" id={item.id} />
          </>
        
      </div>
    </td>
  </tr>
);

const ClassListPage = async ({searchParams}:{searchParams:{[key:string]:string} |undefined }) => {

  const { page, ...queryParams } = searchParams as { [key: string]: string };
  const p = page ? parseInt(page) : 1; 

  const query:Prisma.classesWhereInput = {} // we define a query, which is an object, we will use it for getting the data. Its prisma feature for filtering the data

  if(queryParams) {
    for(const [key,value] of Object.entries(queryParams)){
      if (value === "") continue;
       switch(key){

        case "search":
          query.OR = [
            {
              class_code: {
                contains: value,
                mode: "insensitive",
              },
            },
            
          ];
        break;
        case "grade":
          query.grade = parseInt(value)
        
        case "teacherId":
          query.teacher_class = {
            some:{
              teachers:{
                id: parseInt(value)
              }
            }
          }
        case "studentId":
          query.student_class = {
            some:{
              students:{
                id: parseInt(value)
              }
            }
          }


        }

    }
  }
            
  const [classesData, count] = await prisma.$transaction([
    prisma.classes.findMany({
      where: query,
      include: {
        student_class: {
          include: {
            students: true, // Öğrenciler dahil
          },
        },
        teacher_class: {
          include: {
            teachers: true, // Öğretmenler dahil
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),
    prisma.classes.count({
      where: query, // Filtreli sınıf sayısı
    }),
  ]);

  classesData.forEach((classItem) => {
    console.log(`Class: ${classItem.class_code}`);
    console.log(`Students in class:`, classItem.student_class.map(sc => sc.students));
    console.log(`Teachers in class:`, classItem.teacher_class.map(tc => tc.teachers));
  });
  
  

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="class" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={classesData} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
          </div>
  );
};

export default ClassListPage;
