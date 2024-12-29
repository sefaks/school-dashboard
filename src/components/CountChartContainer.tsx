import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import CountChart from "./CountChart"
import prisma from "@/lib/prisma";


const CountChartContainer = async () => {
    const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();
  
    const data = await prisma.students.groupBy({
        by: ["gender"],
        _count: true,
        where: {
          student_institution: {
            some: {
              institution_id: parseInt(institution_id),
            },
          },
        },
      });
      
    console.log(data);
  
    // Cinsiyete göre sayılar
    const boys = data.find((d) => d.gender === "Erkek")?._count || 0;
    const girls = data.find((d) => d.gender === "Kadın")?._count || 0;
    const total = boys + girls;
  
    // Yüzde hesaplamaları
    const boysPercentage = total > 0 ? Math.round((boys / total) * 100) : 0; // with Math.round we round the number
    const girlsPercentage = total > 0 ? Math.round((girls / total) * 100) : 0;
  
    return (
      <div className="bg-white rounded-xl w-full h-full p-4">
        {/* TITLE */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Students</h1>
          <img src="/moreDark.png" alt="More options" width={20} height={20} />
        </div>
        
        {/* CHART */}
        <CountChart boys={boys} girls={girls} />
  
        {/* BOTTOM */}
        <div className="flex justify-center gap-16 mt-4">
          {/* Boys Section */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 bg-[#A8DADC] rounded-full" />
            <h1 className="font-bold">{boys}</h1>
            <h2 className="text-xs text-gray-500">Boys ({boysPercentage}%)</h2>
          </div>
          
          {/* Girls Section */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 bg-[#e7e1fc] rounded-full" />
            <h1 className="font-bold">{girls}</h1>
            <h2 className="text-xs text-gray-500">Girls ({girlsPercentage}%)</h2>
          </div>
        </div>
      </div>
    );
  };
  
export default CountChartContainer;
  


