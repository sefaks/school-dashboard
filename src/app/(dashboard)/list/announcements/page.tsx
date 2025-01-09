import FormContainer from "@/components/FormContainer";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { Prisma, announcements, classes, parents, teachers } from "@prisma/client";
import Image from "next/image";

type AnnouncementList =announcements & {
  announcement_classes: Array<{  // in here, we define with array because a teacher can have multiple subjects
    classes: classes 
  }>; // its defining teacher's subjects
  announcement_parents: Array<{  // in here, we define with array because a teacher can have multiple classes
    parents: parents 
  }>; // its defining teacher's classes
  announcement_teachers: Array<{  // in here, we define with array because a teacher can have multiple classes
    teachers: teachers 
  }>; // its defining teacher's classes
  
};


const AnnouncementListPage =  async ({searchParams}:{searchParams:{[key:string]:string} |undefined }) => {
  // take role from session
  const { role, current_user_id, institution_id} = await getRoleAndUserIdAndInstitutionId();
  

  const columns = [
    {
      header : "Publisher",
      accessor: "publisher",
    },
    {
      header:"Title",
      accessor: "title",
    },
  {
    header: "Content",
    accessor: "content",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "actions",
  },
];


  const { page, ...queryParams } = searchParams as { [key: string]: string };
  const p = page ? parseInt(page) : 1; 

  const query:Prisma.announcementsWhereInput = {} // we define a query, which is an object, we will use it for getting the data. Its prisma feature for filtering the data

    // we check if there is any query params, if there is, we will filter the data
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value === "") continue; // Boş değeri atla
    
        switch (key) {
          case "class":
            query.announcement_classes = {
              some: {
                classes: {
                  class_code: {
                    contains: value,
                    mode: "insensitive",
                  },
                },
              },
            };
            break;
          case "teacher":
            query.announcement_teachers = {
              some: {
                teachers: {
                  id: parseInt(value),
                },
              },
            };
            break;
          case "parent":
            query.announcement_parents = {
              some: {
                parents: {
                  id: parseInt(value),
                },
              },
            };
            break;
          case "search":
            query.OR = [
              {
                content: {
                  contains: value.trim(),
                  mode: "insensitive",
                },
              },
              {
                announcement_classes: {
                  some: {
                    classes: {
                      class_code: {
                        contains: value,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
              {
                announcement_teachers: {
                  some: {
                    teachers: {
                      surname: {
                        contains: value,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
              {
                announcement_parents: {
                  some: {
                    parents: {
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
                      ],
                    },
                  },
                },
              }
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
    
  switch(role){
    case "teacher":
      query.OR = [
        // Kendi Yayınladığı Duyurular
        {
          publisher_type: {
            equals: "TEACHER",
          },
          publisher_id: {
            equals: parseInt(current_user_id),
          },
        },
        // Atanmış Olduğu Duyurular
        {
          announcement_teachers: {
            some: {
              teachers: {
                id: parseInt(current_user_id),
              },
            },
          },
        },
      ];
      break;
    case "parent":
      query.announcement_parents = {
        some:{
          parents:{
            id: parseInt(current_user_id),
          },
        },
      };
      break;
    case "admin":
     query.OR = [
      {
        publisher_type: {
          equals: "ADMIN",
        },
        publisher_id: {
          equals: parseInt(current_user_id),
        },
      },
        {
          announcement_classes: {
            some: {
              classes: {
                institution_id: {
                  equals: parseInt(institution_id),
                },
              },
            },
          },
        },
        
        {
          announcement_teachers: {
            some: {
              teachers: {
                teacher_institution: {
                  some: {
                    institution_id: {
                      equals: parseInt(institution_id),
                    },
                  },
                },
               
              },
            },
          },
        },
        {
          announcement_parents: {
            some: {
              parents: {
               parent_student: {
                  some: {
                    students: {
                      student_institution: {
                        some: {
                          institution_id: {
                            equals: parseInt(institution_id),
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ];
  }



  const renderRow = (item: AnnouncementList) => {
    let publisherName: string | null = null;
  
    const publisher = publisherMap[item.publisher_type]?.[item.publisher_id];
  
    if (publisher) {
      publisherName = item.publisher_type === "ADMIN" ? publisher.name : `${publisher.name ?? ''} `;
    } else {
      publisherName = "Unknown Publisher";
    }

    return (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.publisher_type === "TEACHER" && (
          <span>


          </span>
        )}
      </td>
      <td>{item.title}</td>
      <td>{item.content}</td>
          <td className="hidden md:table-cell">
      {item.created_at ? (
        new Date(new Date(item.created_at).setHours(new Date(item.created_at).getHours() - 3)).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })
      ) : null}
    </td>

      <td>
        <div className="flex items-center gap-2">
            <>
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </>
        </div>
      </td>
    </tr>
  );
  }

  const [announcements_data, count] = await prisma.$transaction([
    prisma.announcements.findMany({
      where: query,
      include: {
        announcement_classes: {
          include: {
            classes: true,
          },
        },
        announcement_parents: {
          include: {
            parents: true,
          },
        },
        announcement_teachers: {
          include: {
            teachers: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),
    prisma.announcements.count({
      where: query,
    }),
  ]);
  
  // Ek olarak, admin ve teacher bilgilerini tek bir sorguda çekiyoruz:
  const adminIds = announcements_data
    .filter((a) => a.publisher_type === "ADMIN")
    .map((a) => a.publisher_id);
  
  const teacherIds = announcements_data
    .filter((a) => a.publisher_type === "TEACHER")
    .map((a) => a.publisher_id);
  
  const [adminData, teacherData] = await Promise.all([
    prisma.admins.findMany({
      where: { id: { in: adminIds } },
    }),
    prisma.teachers.findMany({
      where: { id: { in: teacherIds } },
    }),
  ]);
  
  // Publisher bilgilerini haritalayarak birleştiriyoruz:
  const publisherMap = {
    ADMIN: Object.fromEntries(adminData.map((admin) => [admin.id, admin])),
    TEACHER: Object.fromEntries(teacherData.map((teacher) => [teacher.id, teacher])),
  };
  


  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
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
      
              <FormContainer table="announcement" type="create" />
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={announcements_data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count}  />
    </div>
  );
};

export default AnnouncementListPage;