import Announcements from "@/components/Announcements";
import BigCalenderContainer from "@/components/BigCalenderContainer";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

const TeacherPage = async () => {

  const { role, current_user_id,institution_id } = await getRoleAndUserIdAndInstitutionId();

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalenderContainer type="teacher_id" id={Number(current_user_id!)} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;
