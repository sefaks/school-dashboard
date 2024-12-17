import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role, teachersData } from "@/lib/data";
import prisma from "@/lib/prisma";
import { subjects, teachers,classes, teacher_subject, teacher_class, subject_name, Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { FieldRef } from "@prisma/client/runtime/library";

type TeacherList = teachers & {
  teacher_subject: Array<{  // in here, we define with array because a teacher can have multiple subjects
    subjects: subjects 
  }>; // its defining teacher's subjects
  teacher_class: Array<{  // in here, we define with array because a teacher can have multiple classes
    classes: classes 
  }>; // its defining teacher's classes
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Subjects",
    accessor: "subjects",
    className: "hidden md:table-cell",
  },
  {
    header: "Classes",
    accessor: "classes",
    className: "hidden md:table-cell",
  },
  {
    header: "Title",
    accessor: "title",
    className: "hidden lg:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];


// we create a function that will be assign to renderRow for Table Component
const renderRow = (item:TeacherList) => (
  // in teacher_subjects, we need to map the subjects and get the name of the subjects

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
        <p className="text-xs text-gray-500">{item?.email}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">
      {item.teacher_subject.map((subject: { subjects: subjects }, index: number) => (
        <span key={subject.subjects.id}>
          {subject.subjects.subject_name}
          {index < item.teacher_subject.length - 1 && ', '}
        </span>
      ))}
    </td>

    <td className="hidden md:table-cell">
      {item.teacher_class.map((classItem: { classes: classes }, index: number) => (
        <span key={classItem.classes.id}>
          {classItem.classes.class_code}
          {index < item.teacher_class.length - 1 && ', '}
        </span>
      ))}
    </td>

    <td className="hidden md:table-cell">{item.title}</td>
    <td className="hidden md:table-cell">{item.phone_number}</td>

    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/teachers/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="" width={16} height={16} />
          </button>
        </Link>
        {role === "admin" && (
          // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
          //   <Image src="/delete.png" alt="" width={16} height={16} />
          // </button>
          <FormModal table="teacher" type="delete" id={item.id}/>
        )}
      </div>
    </td>
  </tr>
);

  // we create a function that will be called when the page is loaded
  // it is including the searchParams, which is the query params, we get the page from the query params. If there is no page, we set it to 1
  // search params like dictionary, we get the page from the searchParams: { [page: string]: 3 }
  // if no page, can be undefined, so we set it to 1
  // define take and skip, take is the number of data that we want to get, skip is the number of data that we want to skip.For pagination
  const TeacherListPage = async ({searchParams}:{searchParams:{[key:string]:string} | undefined;
  }) => {
    
    const { page, ...queryParams } = searchParams as { [key: string]: string };
    const p = page ? parseInt(page) : 1; 
    const whereClause: any = {}; // we define a whereClause, which is an object, we will use it for filtering the data

    const query:Prisma.teachersWhereInput = {} // we define a query, which is an object, we will use it for getting the data. Its prisma feature for filtering the data

    // we check if there is any query params, if there is, we will filter the data
    if (queryParams){
      for(const [key,value] of Object.entries(queryParams)){
      if (value === "") continue;
       switch(key){
        case "subject_name":
          query.teacher_subject = {
            some:{
              subjects:{
                subject_name: {
                  equals: value as subject_name, // we set the value to the query, equals means the value should be equal to the value that we set
                },
              },
            },
          }
        
        case "class_code":
          query.teacher_class = {
            some:{
              classes:{
                class_code: {
                  contains: value,
                  mode: "insensitive",
                },
              },
            },
          };
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
              title: {
                contains: value,
                mode: "insensitive",
              },
            },
            {
              phone_number: {
                contains: value,
                mode: "insensitive",
              },
            },
          ];
          break;
        case "id":
          query.id = {
            equals: parseInt(value),
          };
          break;

        case "lessonId":
          query.teacher_lesson = {
            some:{
              lessons:{
                id: parseInt(value)
              }
            }
          }
        }
      }
    }
    
    const [teachersData, count] = await prisma.$transaction([ 
      prisma.teachers.findMany({
        where: query,
        include: {
          teacher_subject: {
            include: {
              subjects: true,
            },
          },
          teacher_class: {
            include: {
              classes: true,
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: (p - 1) * ITEM_PER_PAGE,
      }),
      prisma.teachers.count({
        where: whereClause, // Sayı sorgusunda da aynı filtreleri kullanıyoruz
      }),
    ]);
    


  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
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

              <FormModal table="teacher" type="create"/>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={teachersData} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default TeacherListPage;