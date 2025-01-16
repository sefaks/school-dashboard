import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { Prisma, classes, schedules, schedulestatus } from "@prisma/client";
import { title } from "process";
import Image from "next/image";
import FormContainer from "@/components/FormContainer";
import TableSearch from "@/components/TableSearch";
import Link from "next/link";

type ScheduleList = schedules & {

    classes: classes

}

const statusColors: { [key in schedulestatus]: string } = {
    ACTIVE: "bg-green-500",
    ARCHIVED: "bg-blue-500",
    DRAFT: "bg-red-500",
};

const renderRow = (item: ScheduleList, role: string) => (
    <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
        <td className="flex items-center gap-4">{item.name}</td>
        <td className="hidden md:table-cell">{item.classes?.class_code}</td>
        <td className="hidden md:table-cell">
        <span
        className={`${statusColors[item.status as schedulestatus]} text-white py-1 px-3 rounded-full`}
        >
          {item.status}

        </span> 
        </td>   
        
        
        <td>
            <div className="flex items-center gap-2">
                <Link href={`/list/classes/${item.id}`}>
                    <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                        <Image src="/view.png" alt="" width={16} height={16} />
                    </button>
                </Link>
                {role === "admin" && (
                    <>
                        <FormContainer table="class" type="update" data={item} />
                        <FormContainer table="class" type="delete" id={item.id} />
                    </>
                )}
            </div>
        </td>
    </tr>
);

const ScheduleListPage = async ({searchParams}:{searchParams:{[key:string]:string} |undefined }) => {
    const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

    const columns = [
        {
            header: "Name",
            accessor: "name",
        },
        {
            header:"Class",
            accessor:"class",
        },
        {
            header: "Status",
            accessor: "student_class",
            className: "hidden md:table-cell",
        },
        {
            header: "Actions",
            accessor: "actions",
            className: "hidden md:table-cell",
        },
    ];



    const { page, ...queryParams } = searchParams as { [key: string]: string };
    const p = page ? parseInt(page) : 1;
  
    const query: Prisma.schedulesWhereInput = {};
  
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value === "") continue;
        switch (key) {
          case "search":
            query.OR = [
              {
                classes: {
                  class_code: {
                    contains: value,
                  },
                },
              },
            ];
            break;
          case "grade":
            query.classes = {
                grade: parseInt(value),
                };
            break;
          case "teacherId":
            query.classes = {
                teacher_class: {
                    some: {
                    teachers: {
                        id: parseInt(value),
                    },
                    },
                },
             
            };
            break;
          case "studentId":
            query.classes = {
                student_class: {
                    some: {
                    students: {
                        id: parseInt(value),
                    },
                    },
                },
            };
            break;
        }
      }
    }
  
    // Rol bazlı filtreleme:
    switch (role) {
      case "admin":

        break;
      case "teacher":
        query.classes = {
            teacher_class: {
                some: {
                teachers: {
                    id: parseInt(current_user_id),
                },
                },
            },
        };
        break;
      default:
        return null;
    }
  
    const [schedulesData, count] = await prisma.$transaction([
      prisma.schedules.findMany({
        where: query,
        include: {
          classes: true,
        },
        take: ITEM_PER_PAGE,
        skip: (p - 1) * ITEM_PER_PAGE,
      }),
      prisma.schedules.count({
        where: query, // Filtreli sınıf sayısı
      }),
    ]);



    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
          {/* TOP */}
          <div className="flex items-center justify-between">
            <h1 className="hidden md:block text-lg font-semibold">All Schedules</h1>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <TableSearch />
              <div className="flex items-center gap-4 self-end">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                  <Image src="/filter.png" alt="" width={14} height={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                  <Image src="/sort.png" alt="" width={14} height={14} />
                </button>
            
                {role === "admin" &&
                 <FormContainer table="schedule" type="create" />}
           </div>
            </div>
          </div>
          {/* LIST */}
          <Table columns={columns} renderRow={(item) => renderRow(item, role)} data={schedulesData} />
          {/* PAGINATION */}
          <Pagination page={p} count={count} />
              </div>
      );
    };
    

export default ScheduleListPage;
            
        