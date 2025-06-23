"use client";
import React, { useEffect, useState } from "react";
import { Content } from "@/app/types/Lesson";
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 
import CourseContentCard from "./CourseContentCard";
interface CourseContentProps {
  contents: Content[];
}

// Function to create nested content
const createNestedContents = (contents: Content[]): Content[] => {
  // Önce içerikleri level ve content_number'a göre sıralayalım

  console.log("contents", contents);

const sortedContents = [...contents].sort((a, b) => {
    if (a.level !== b.level) {
        return a.level - b.level;
    }
    return a.content_number.localeCompare(b.content_number, undefined, {
        numeric: true,
        sensitivity: 'base'
    });
});

const filteredContents = sortedContents.filter(
        (item) => Number(item.id) !== 0 && item.content_name !== null
);

    // Her ünite için minimum page_start değerlerini tutacak map
    const unitsMinPageStart = new Map<string, number>();

  // Her ünitenin alt içeriklerini grupla ve minimum page_start'ı bul
  filteredContents.forEach(item => {
    const unitNumber = item.content_number.split('.')[0]; // Ünite numarasını al
    const currentPageStart = item.page_start;
    
    if (currentPageStart !== undefined) {
      const currentMin = unitsMinPageStart.get(unitNumber);
      if (currentMin === undefined || currentPageStart < currentMin) {
        unitsMinPageStart.set(unitNumber, currentPageStart);
      }
    }
  });

  const processedIds = new Set<string>();
  const contentMap = new Map<string, Content>();

  // İlk geçiş: Tüm içerikleri Map'e ekle ve minimum page_start değerlerini ata
filteredContents.forEach(item => {
    if (!processedIds.has(item.content_id)) {
        const unitNumber = item.content_number ? item.content_number.split('.')[0] : ""; // Check for undefined
        const minPageStart = unitsMinPageStart.get(unitNumber) || item.page_start;

        console.log("minPageStart", minPageStart);

        contentMap.set(item.content_number, {
            ...item,
            children: [],
            min_page_start: minPageStart // Yeni alan eklendi
        });
        processedIds.add(item.content_id);
    }
});

  // Parent-child ilişkilerini kur
  const rootItems: Content[] = [];
  contentMap.forEach((item) => {
    const contentNumber = item.content_number ?? "";
    if (typeof contentNumber !== "string" || contentNumber.trim() === "") {
      rootItems.push(item);
      return;
    }

    const numbers = contentNumber.split('.');
    if (numbers.length === 1) {
      rootItems.push(item);
    } else {
      const parentNumber = numbers.slice(0, -1).join('.');
      const parent = contentMap.get(parentNumber);
      if (parent && parent.children) {
        const existingChild = parent.children.find(
          (child) => child.content_id === item.content_id
        );
        if (!existingChild) {
          parent.children.push(item);
        }
      }
    }
  });

  return rootItems;
};


const CourseContent: React.FC<CourseContentProps> = ({ contents }) => {
  const [nestedContents, setNestedContents] = useState<Content[]>([]);
  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  
  
    const currentLanguageContent = language === "en" ? en : tr; 
    useEffect(() => {
      setNestedContents(createNestedContents(contents));

     

    }, [contents]);
  

return (
    <div className="bg-[#F8F9FB] shadow-custom-daow mt-[20px] border border-[#F8F9FB] px-[22px] lg:px-[40px] py-[37px] rounded-[14px]">
        <p className="font-semibold mb-[6px] text-[20px] text-[#161439] leading-[24px]">{currentLanguageContent.course_content}</p>
        <div className="mt-[35px]">
            {nestedContents.map((content) => (
                <CourseContentCard
                    key={content.content_id}
                    content={content}
                    contents={content.children || []}
                    minPageStart={content.min_page_start ?? 0} // Provide a default value of 0
                />
            ))}
        </div>
    </div>
);
};

export default CourseContent;
