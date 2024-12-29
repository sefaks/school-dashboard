import prisma from "@/lib/prisma";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";


// Define specific type for user types
type UserType = "admin" | "teacher" | "student" | "parent";

const UserCard = async ({ type }: { type: UserType }) => {
  const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

  // Type-safe model map
  const modelMap: Record<UserType, any> = {
    admin: prisma.admins,
    teacher: prisma.teachers,
    student: prisma.students,
    parent: prisma.parents,
  };

  // Ensure type exists in modelMap
  if (!(type in modelMap)) {
    throw new Error(`Invalid user type: ${type}`);
  }

  let whereClause: any = {};
  
  switch (type) {
    case "admin":
      whereClause = {
        institution_id: parseInt(institution_id),
      };
      break;
    case "teacher":
      whereClause = {
        teacher_institution: {
          some: {
            institution_id: parseInt(institution_id),
          },
        },
      };
      break;
    case "student":
      whereClause = {
        student_institution: {
          some: {
            institution_id: parseInt(institution_id),
          },
        },
      };
      break;
    case "parent":
      whereClause = {
        parent_student: {
          some: {
            students: {
              student_institution: {
                some: {
                  institution_id: parseInt(institution_id),
                },
              },
            },
          },
        },
      };
      break;
  }

  const count = await modelMap[type].count({
    where: whereClause,
  });

  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaBlue p-4 flex-1 text-black min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-black">
          2024/2025
        </span>
        <img src="/more.png" alt="more" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{count}</h1>
      <h1 className="capitalize text-sm font-medium text-white-500">{type}</h1>
    </div>
  );
};

export default UserCard;