import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import AttendanceChart from "./AttendanceChart";
import Image from "next/image";


const AttendanceChartContainer = async() => {

    const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

    const data = [
        {
          name: "Mon",
          present: 60,
          absent: 40,
        },
        {
          name: "Tue",
          present: 70,
          absent: 60,
        },
        {
          name: "Wed",
          present: 90,
          absent: 75,
        },
        {
          name: "Thu",
          present: 90,
          absent: 75,
        },
        {
          name: "Fri",
          present: 65,
          absent: 55,
        },
      ];
    

    return (
        <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <AttendanceChart data={data} />
      </div>
    );
}

export default AttendanceChartContainer;