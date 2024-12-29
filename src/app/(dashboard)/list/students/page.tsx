import { authOptions } from "@/app/auth";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { Prisma, classes, parents, students } from "@prisma/client";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";


type StudentList = students & {
  student_class: Array<{  // in here, we define with array because a student can have multiple classes
    classes: classes 
  }>; // its defining student's classes
  parent_student: Array<{  // in here, we define with array because a student can have multiple parents
    parents: parents 
  }>; // its defining student's parents
  student_institution: {
    institution_id: number
  }
};


const renderRow = (item: StudentList, role:string) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <Image
        src={item.photo || "/noAvatar.png"}
        alt=""
        width={40}
        height={40}
        className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name} {item.surname}</h3>
        <p className="text-xs text-gray-500">{item.email}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">{item.school_no}</td>
    <td className="hidden md:table-cell">
      {item.student_class.map((classItem: { classes: classes }, index: number) => (
        <span key={classItem.classes.id}>
          {classItem.classes.class_code}
          {index < item.student_class.length - 1 && ', '}
        </span>
      ))}
    </td>  
    <td className="hidden md:table-cell">
      {item.parent_student?.map((parent_item: { parents: parents }, index: number) => (
        <span key={parent_item.parents.id}>
          {parent_item.parents.email}
          {index < item.parent_student.length - 1 && ', '}
        </span>
      ))}
    </td>
    
      <div className="flex items-center gap-2">
        <Link href={`/list/students/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="" width={16} height={16} />
          </button>
        </Link>
        {role === "admin" && (
          // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
          //   <Image src="/delete.png" alt="" width={16} height={16} />
          // </button>
          <FormModal table="student" type="delete" id={item.id}/>
        )}
      </div>
  </tr>
);

const StudentListPage = async ({searchParams}:{searchParams:{[key:string]:string} | undefined;
}) => {

  const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();


const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student No",
    accessor: "studentNo",
    className: "hidden md:table-cell",
  },
  {
    header: "Classes",
    accessor: "classes",
    className: "hidden lg:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
 // actions column will be shown only for admin
  ...(role === "admin" ? 
  [{
     header: "Actions" ,
      accessor: "actions",
    }] : []),
];

  
  const { page, ...queryParams } = searchParams as { [key: string]: string };
  const p = page ? parseInt(page) : 1; 

  const query:Prisma.studentsWhereInput = {} // we define a query, which is an object, we will use it for getting the data. Its prisma feature for filtering the data

    // we check if there is any query params, if there is, we will filter the data
    if (queryParams){
      for(const [key,value] of Object.entries(queryParams)){
      if (value === "") continue;
       switch(key){
        case "class_code":
          query.student_class = {
            some:{
              classes:{
                class_code: {
                  contains:value  // contains is a prisma feature, it checks if the value is in the field or not
                },
              },
            },
          }
        break;
        case "teacherId":
          query.student_class = {
            some:{
              classes:{
                // class have teachers, so we can filter the data according to the teacher
                teacher_class:{
                  some:{
                    teacher_id: parseInt(value)
                  }
                }
               
              },
            },
          }
        break;
        
        case "search":
          query.OR = [
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
            {
              school_no: {
                contains: value,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: value,
                mode: "insensitive",
              },
            },
          ];
          break;
        }
      }
    }

  // We filter the data according to the role of the user
  // if we have teacher role, we filter the data according to the teacher id from teacher_classes to student_classes
  switch (role) {
    case "admin":
      query.student_institution = {
        some: {
          institution_id: parseInt(institution_id),
        },
      };
      break; // Admin case'i burada bitiyor
  
    case "teacher":
      query.student_class = {
        some: {
          classes: {
            teacher_class: {
              some: {
                teacher_id: parseInt(current_user_id),
              },
            },
          },
        },
      };
      break; // Teacher case'i burada bitiyor
  }
  

  const [studentsData, count] = await prisma.$transaction([ // we get the data and the count of the data together. We using studentsData for rendering the table data and count for pagination
    prisma.students.findMany({
    where: query, // we filter the data according to the query
    include: {
      student_class: { // we define in prisma table that teacher_subjects and teacher_classes are arrays
        include: {
          classes: true
        }
      },
      parent_student: {
        include: {
          parents: true
        }
      }
    },
    take: ITEM_PER_PAGE , 
    skip: (p - 1) * ITEM_PER_PAGE, // we skip the data according to the page, if the page is 1, we skip 0, if the page is 2, we skip 10

  }),
  // we get the count of the data with filtered data
  prisma.students.count({
    where: query,
  }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
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
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              //   <Image src="/plus.png" alt="" width={14} height={14} />
              // </button>
              <FormModal table="student" type="create"/>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={(item) => renderRow(item, role)} data={studentsData} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default StudentListPage;