import prisma from "@/lib/prisma";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

const Announcements = async () => {
  const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

  const roleConditions = {
    teacher: { teacher_id: parseInt(current_user_id) },
    parent: { parent_id: parseInt(current_user_id) },
    admin: { institution_id: parseInt(institution_id) },
  };

  const data = await prisma.announcements.findMany({
    take: 3,
    orderBy: { created_at: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { announcement_teachers: { some: { teacher_id: role === "teacher" ? (roleConditions[role as keyof typeof roleConditions] as { teacher_id: number }).teacher_id : undefined } } },
          { announcement_parents: { some: { parent_id: role === "parent" ? (roleConditions[role as keyof typeof roleConditions] as { parent_id: number }).parent_id : undefined } } },
        ],
      }),
    },
  });

  return (
    <div className="bg-white p-4 rounded-md">
     <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">Announcements</h1>
      <a href="/list/announcements" className="text-xs text-gray-400 flex items-center gap-1">
        View All
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>

      <div className="flex flex-col gap-4 mt-4">
        {data[0] && (
          <div className="bg-lamaSkyLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[0].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {data[0].created_at && new Intl.DateTimeFormat("en-GB").format(data[0].created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[0].content}</p>
          </div>
        )}
        {data[1] && (
          <div className="bg-lamaPurpleLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[1].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {data[1].created_at && new Intl.DateTimeFormat("en-GB").format(data[1].created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[1].content}</p>
          </div>
        )}
        {data[2] && (
          <div className="bg-lamaYellowLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[2].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {data[2].created_at && new Intl.DateTimeFormat("en-GB").format(data[2].created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[2].content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;