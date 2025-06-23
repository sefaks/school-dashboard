import React from "react";
import { LinearProgress } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
// Define prop types
interface CourseCardProps {
  image: string;
  title: string;
  progress: number;
  tags: string[];
  content_id: string;
  publisher_id:string;
  content_uuid:string,
  content_type:string
  page_start:number,
}

const CourseContinueCard: React.FC<CourseCardProps> = ({progress,image, publisher_id, content_id,content_uuid,content_type,page_start ,tags,title}) => {

  const router = useRouter();

  const routeContent=()=>{
    console.log("content id is ",content_id)
    router.push(`/dashboard/resources/lessons/${publisher_id}/${content_type}/units/${content_uuid}?min_page_start=${page_start}&page_start=${page_start}`)

  }


  return (
    <div className="flex !bg-white flex-col xs:flex-row gap-3 !rounded-[14px] !shadow-md !p-[12px] h-full">
      {/* Course Image - Sabit yükseklik ve genişlik */}
      <div className="xs:w-[157px] flex-shrink-0">
        <Image
          width={157}
          height={100}
          src={image}
          alt={title}
          className="w-full xs:w-[157px] h-[100px] object-cover rounded-md"
        />
      </div>
      
      {/* Course Details */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`text-xs font-semibold rounded-md px-2 py-1 ${
                  tag === "Ders Kaynağı"
                    ? "bg-[#35B97D1A] text-[#018B4D]"
                    : "bg-[#ebf2ff] text-[#1165ef]"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Title - Max 2 satır */}
          <h3 className="text-[15px] leading-[21px] font-semibold text-gray-800 mb-2 line-clamp-2">
            {title}
          </h3>
        </div>
        
        {/* Progress ve Devam Et butonu */}
        <div className="mt-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="w-full text-sm text-gray-600">
              <div className="flex mb-[9px] items-center justify-between">
                <span className="text-[#20202080] text-[12px] font-medium">Progress</span>
                <span className="font-semibold text-[#514EF3]">{progress}%</span>
              </div>
              <LinearProgress
                variant="determinate"
                value={progress}
                className="w-full rounded-lg"
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#514EF3',
                  },
                  backgroundColor: '#E0E0E0',
                }}
              />
            </div>
            <button 
              className="text-[12px] gap-[6px] flex items-center font-semibold leading-[20px] text-[#323539] rounded-[8px] border border-[#E5E5E7] py-[8px] px-[14px] flex-shrink-0 whitespace-nowrap"
              onClick={routeContent}
            >
              Devam Et
              <Image src="/right.svg" width={16} height={16} alt="arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContinueCard;
