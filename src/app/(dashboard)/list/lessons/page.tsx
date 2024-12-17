import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { lessonsData, role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, lessons, subject, teachers } from "@prisma/client";
import Image from "next/image";

type LessonsList = lessons & {
  teacher_lesson: Array<{
    teachers: teachers;
  }>;
};

const columns = [
  {
    header: "Lesson Name",
    accessor: "name",
  },
  {
    header: "Grade",
    accessor: "grade",
  },
  {
    header: "Curriculum Year",
    accessor: "year",
  },
 
  {
    header: "Teachers",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: LessonsList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.name}</td>
    <td className="hidden md:table-cell">{item.grade}</td>
    <td className="hidden md:table-cell">{new Date(item.curriculum_year).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</td>
    <td className="hidden md:table-cell">
      {item.teacher_lesson.map((teacher_item: { teachers: teachers }, index: number) => (
        <span key={teacher_item.teachers.id}>
          {teacher_item.teachers.name}
          {index < item.teacher_lesson.length - 1 && ', '}
        </span>
      ))}
    </td>    
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormModal table="lesson" type="update" data={item} />
            <FormModal table="lesson" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const LessonListPage = async ({searchParams}:{searchParams:{[key:string]:string} |undefined }) => {

  const { page, ...queryParams } = searchParams as { [key: string]: string };
  const p = page ? parseInt(page) : 1; 

  const query:Prisma.lessonsWhereInput = {} // we define a query, which is an object, we will use it for getting the data. Its prisma feature for filtering the data

  if(queryParams) {
    for(const [key,value] of Object.entries(queryParams)){
      if (value === "") continue;
       switch(key){

        case "search":
          query.OR = [
            {
              name: {
                contains: value,
                mode: "insensitive",
              },
            },
            {
              curriculum_year: {
                equals: value,
              },
            },
            {
              teacher_lesson: {
                some: {
                  teachers: {
                    name: {
                      contains: value,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ];
        break;

        case "teacherId":
          query.teacher_lesson = {
            some:{
          
              teachers:{
                id: parseInt(value)
              }
            }
          }

        break;
        }

    }
  }
            

  
  const[lessonsData,count] = await prisma.$transaction([ // we get the data and the count of the data together. We using studentsData for rendering the table data and count for pagination
  prisma.lessons.findMany({
   where: query, 
  include: {
    teacher_lesson: { // we define in prisma table that teacher_subjects and teacher_classes are arrays
      include: {
        teachers: true
      }
    }
  },
  take: ITEM_PER_PAGE , 
  skip: (p - 1) * ITEM_PER_PAGE, // we skip the data according to the page, if the page is 1, we skip 0, if the page is 2, we skip 10

}),
prisma.lessons.count() // we get the count of the data
]); 

 

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="lesson" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={lessonsData} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;