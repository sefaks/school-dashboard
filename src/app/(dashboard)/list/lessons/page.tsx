import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { Prisma, lessons, subject, teachers } from "@prisma/client";
import Image from "next/image";

type LessonsList = lessons & {
  teacher_lesson: Array<{
    teachers: teachers;
  }>;
  institutions: {
    name: string;
  };
};


const renderRow = (item: LessonsList, role:string) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.name}</td>
    <td className="hidden md:table-cell">{item.institutions.name}</td>
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

const { role, current_user_id, institution_id} = await getRoleAndUserIdAndInstitutionId();

const columns = [
  {
    header: "Lesson Name",
    accessor: "name",
  },
  {
    header:"Institution",
    accessor: "institution",
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
  // actions for admin role
  {
    ...role === "admin" && {
      header: "Actions",
      accessor: "action",
    },
  }  


];

  const { page, ...queryParams } = searchParams as { [key: string]: string };
  const p = page ? parseInt(page) : 1; 

  const query:Prisma.lessonsWhereInput = {} // we define a query, which is an object, we will use it for getting the data. Its prisma feature for filtering the data
  if (queryParams) {
    const orConditions = [];
  
    for (const [key, value] of Object.entries(queryParams)) {
      if (value === "") continue;
  
      switch (key) {
        case "search":
          orConditions.push({ // or conditions are used for searching the data in multiple columns
            name: {
              contains: value,
              mode: "insensitive",
            },
          });
  
          orConditions.push({
            teacher_lesson: {
              some: {
                teachers: {
                  OR: [
                    {
                      name: {
                        contains: value,
                        mode: "insensitive",
                      },
                    },
                    {
                      surname: {
                        contains: value,
                        mode: "insensitive",
                      },
                    },
                    // search for institution name
                    
                    
                  ],
                },
              },
            },
          });
          orConditions.push({
            institutions: {
              name: {
                contains: value,
                mode: "insensitive",
              },
            },
          });
  
          if (!isNaN(parseInt(value))) {
            orConditions.push({
              grade: {
                equals: parseInt(value),
              },
            });
          }
          break;
  
        case "teacherId":
          query.teacher_lesson = {
            some: {
              teachers: {
                id: parseInt(value),
              },
            },
          };
          break;
  
        case "grade":
          if (!isNaN(parseInt(value))) {
            query.grade = parseInt(value);
          }
          break;
      }
    }
  
    if (orConditions.length > 0) {
      query.OR = orConditions;
    }
  }
  
  try {
    const results = await prisma.lessons.findMany({
      where: Object.keys(query).length > 0 ? query : undefined,
      include: {
        teacher_lesson: {
          include: {
            teachers: true,
          },
        },
      },
      take: 5,
      skip: 0,
    });
  } catch (error) {
    console.error("Query Error:", error);
  }

  switch (role) {
    case "admin":
    // query for lessons for admin with institution_id
      query.institution_id = parseInt(institution_id);
        
      break;

    case "teacher":
      query.teacher_lesson = {
        some: {
          teachers: {
            id: parseInt(current_user_id),
          },
        },
      };
      break;
    default:
      return null;
  }
  
  
  const[lessonsData,count] = await prisma.$transaction([ // we get the data and the count of the data together. We using studentsData for rendering the table data and count for pagination
  prisma.lessons.findMany({
   where: query, 
  include: {
    teacher_lesson: { // we define in prisma table that teacher_subjects and teacher_classes are arrays
      include: {
        teachers: true
      }
    },
    institutions:{
      select:{
        name:true
      }
    }
  },
  take: ITEM_PER_PAGE , 
  skip: (p - 1) * ITEM_PER_PAGE, // we skip the data according to the page, if the page is 1, we skip 0, if the page is 2, we skip 10

}),
// we get the count of the data with filtered data
prisma.lessons.count({
  where: query,
}),
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
      <Table columns={columns} renderRow={(item) => renderRow(item, role)} data={lessonsData} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;