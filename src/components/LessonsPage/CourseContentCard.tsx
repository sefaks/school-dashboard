"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Content, StudentContent } from "@/app/types/Lesson";
import { useSearchParams } from "next/navigation";
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 
import { CheckCircle } from 'lucide-react';


interface CourseContentCardProps {
  content: Content;
  contents: Content[];
  minPageStart: number;
}

const CourseContentCard: React.FC<CourseContentCardProps> = ({
  content,
  contents,
  minPageStart
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { Inst_id, id } = useParams();
  const { content_type } = useParams();

  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);

  console.log("stored and lanaguage is ",storedLanguage,language)
  const currentLanguageContent = language === "en" ? en : tr; // Get current language content

  const searchParams=useSearchParams()
  const curriculum_year=searchParams.get('curriculum_year')
  const publisher_name=searchParams.get('publisher_name')
  const grade=searchParams.get('grade')
  const subject_id=searchParams.get('subject_id')
  

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleViewClick = (min_page_start: number) => {
    router.push(
      `/list/resources/lessons/${id}/${content_type}/units/${content.content_id}?min_page_start=${min_page_start}&page_start=${content.page_start}`
    );
  };
  
  

  return (
    <div>
      {/* Chapter Card */}
      <div
        className="px-[21px] md:px-[31px] min-h-[64px] mb-[17px] py-[20px] border border-[#DFDFDF] rounded-[12px] shadow-custom-black cursor-pointer"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-[32px] md:gap-[62px]">
          <Image
                src="/icons/rightArrow.svg"
                width={8}
                height={13}
                alt="arrow"
                className={`${isExpanded ? "rotate-90" : ""}`}
                />
                <div className="flex items-center gap-2">
                <p className="font-semibold text-[#000000] truncate-2-lines text-[14px] lg:text-[16px] leading-[19.36px]">
              {content.content_number} - {content.name}
            </p>
            {content.is_completed  && (
              <CheckCircle className="text-[#702DFF] w-5 h-5" />
              )}
                </div>
           
          </div>
          <div className="flex items-center gap-3">
            <p
              onClick={() => handleViewClick(minPageStart)}
              className="font-normal rounded-[8px] px-[10px] py-[8px] text-[14px] leading-[16px] bg-[#702DFF14] text-[#702DFF] cursor-pointer"
            >
              {currentLanguageContent.view || "Görüntüle"}
            </p>
          </div>

         
        </div>
      </div>

      {/* Nested Content */}
      {isExpanded && contents.length > 0 && (
        <div className="ml-[20px] md:ml-[31px] mb-[17px]">
          {contents.map((subcontent) => (
            <CourseContentCard
              key={subcontent.id}
              content={subcontent}
              contents={subcontent.children || []}
              minPageStart={minPageStart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseContentCard;
