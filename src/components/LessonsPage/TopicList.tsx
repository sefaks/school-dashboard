"use client";
import React, { useEffect, useState } from "react";
import { contents, students_contents } from "@/app/types/Lesson";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 
import Loading from "@/app/(dashboard)/list/loading";
import TopicListCard from "./TopicListCard";
import { getPublishContents } from "@/lib/actions";

interface TopicsListProps {
  content_id: string;
  setPdfInfo: React.Dispatch<React.SetStateAction<{
    url: string | null;
    pageStart: number;
    pageEnd: number;
  }>>;
}
const TopicsList: React.FC<TopicsListProps> = ({ content_id, setPdfInfo }) => {
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<contents[]>([]);
  const [selectedContents, setSelectedContents] = useState<contents[]>([]);
  const router = useRouter();
   const {Inst_id,id}=useParams()
  const searchParams = useSearchParams()

  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr;


   
  const curriculum_year=searchParams.get('curriculum_year')
  const publisher_name=searchParams.get('publisher_name')
  const subject_id=searchParams.get('subject_id')
  const {topicId}=useParams()
  const grade=searchParams.get('grade')
  const min_page_start = Number(searchParams.get('min_page_start')) || 1;
  const path_name = usePathname();
  const content_type = path_name.split('/')[5] || 'pdf'; // Default to 'pdf' if not found


    useEffect(() => {
      const fetchStudentsContents = async () => {
        setLoading(true);
        try {
          const lessonResponse = await getPublishContents(parseInt(Array.isArray(id) ? id[0] : id), content_type);
          if (lessonResponse.status === 401) {
            return;
          }
          console.log("lessonResponse", lessonResponse);
  
          // content_number'a göre sıralama yapalım
          const sortedContents = lessonResponse?.sort(
            (a: { content_number: string }, b: { content_number: string }) => {
              return a.content_number.localeCompare(b.content_number, undefined, {
                numeric: true,
                sensitivity: 'base'
              });
            }
          );
          console.log(content_id)
          const currentContent = sortedContents?.find(
            (content: any) => content.content_id === content_id
          );

          console.log("currentContent", currentContent);


          setContents(sortedContents);

          console.log("sortedContents", sortedContents);

          // set selected student contents is starting with same content_number as the current content's content_number
          const selectedContentNumber = currentContent?.content_number;

          console.log("selectedContentNumber", selectedContentNumber);
          
          if (selectedContentNumber) {
            // Seçilen content_number'a göre filtreleme
            const sortedContentsWithSameContentNumber = sortedContents.filter((content:any) => {
              // Başlangıçları aynı olan content_number'ları alıyoruz
              return content.content_number.startsWith(selectedContentNumber.split(".")[0]);
            });
          
            console.log("filteredContentsWithSameContentNumber", sortedContentsWithSameContentNumber);
          
            // Burada sadece başlığı aynı olan content'leri set ediyorsunuz
            setSelectedContents(sortedContentsWithSameContentNumber);
          }

        } catch (error) {
          console.error("Error fetching student contents:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchStudentsContents();
    }, [content_id]);

    const handleTopicSelect = (topic: contents) => {
      // Topic'in ünite içindeki gerçek sayfa numarasını hesapla
      const actualPageStart = topic.page_start 
      const actualPageEnd = topic.page_end 
  
      // PDF bilgisini güncelle
      setPdfInfo(prev => ({
        ...prev,
        pageStart: actualPageStart,
        pageEnd: actualPageEnd
      }));
    };

  if (loading) {
    return <Loading />;
    
  }

  return (
    <div className="border-[#FFFFFF] max-h-[90vh] overflow-y-auto bg-[#FAEBD7] px-[15px] py-[17px] shadow-custom-daow rounded-[14px]">
      <p className="font-semibold text-[#090909] mb-[17px] text-[16px] leading-[20px]">{currentLanguageContent.course_content}</p>
      <div className="flex flex-col gap-[17px]">
        {selectedContents.map((content) => (
          <TopicListCard
            key={content.content_id}
            topic={content}
            onSelectTopic={handleTopicSelect}
            selectedTopic={content}

          />
        ))}
      </div>
    </div>
  );
};

export default TopicsList;
