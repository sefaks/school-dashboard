import { authOptions } from "@/app/auth";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, parents, students } from "@prisma/client";
import { getServerSession } from "next-auth";
import Image from "next/image";

type ParentList = parents & {
  parent_student: Array<{  // in here, we define with array because a parent can have multiple students
    students: students 
  }>; 

    
  }

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student Names",
    accessor: "students",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: ParentList, role:string) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-xs text-gray-500">{item?.email}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">{item.parent_student.map((student) => student.students.name).join(", ")}</td>
    <td className="hidden md:table-cell">{item.phone}</td>
    <td className="hidden md:table-cell">{item.phone}</td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormModal table="parent" type="update" data={item} />
            <FormModal table="parent" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const ParentListPage = async ({searchParams}:{searchParams:{[key:string]:string} | undefined; }) => {

  const session = await getServerSession(authOptions);
  const role = (session as { user: { role: string } })?.user.role;
  
  const { page, ...queryParams } = searchParams as { [key: string]: string };
  const p = page ? parseInt(page) : 1; 
  const whereClause: any = {}; // we define a whereClause, which is an object, we will use it for filtering the data

  const query:Prisma.parentsWhereInput = {} // we define a query, which is an object, we will use it for getting the data. Its prisma feature for filtering the data

  // we check if there is any query params, if there is, we will filter the data
  if (queryParams){
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
            surname: {
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
       
          {
            phone: {
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
      }
    }
  }
  // we get the data from the database, we get the parents, we include the parent_student, which is the relation between parent and student
  const [parentsData, count] = await prisma.$transaction([ 
    prisma.parents.findMany({
      where: query,
      include: {
        parent_student: {
          include: {
            students: true,
          },
        }
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),
    prisma.parents.count({
      where: whereClause, // Sayı sorgusunda da aynı filtreleri kullanıyoruz
    }),
  ]);

 
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
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
      <Table columns={columns}  renderRow={(item) => renderRow(item, role)} data={parentsData} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}


export default ParentListPage;