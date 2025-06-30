
"use client";
import React, { useEffect, useState } from "react";
import { ArrowBackIos } from "@mui/icons-material";

import { Lesson, students_contents,StudentContent, Content } from "@/app/types/Lesson";
import { useParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json";
import { getPublishContents, getPublishTeacherContents } from "@/lib/actions";
import Loading from "@/app/(dashboard)/list/loading";
import CourseContent from "@/components/LessonsPage/CourseContent";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/apiClient";
import { set } from "date-fns";
import { AxiosResponse } from "axios";

// const students_contents2 = [
//   { id: 1, content_name: "BİR KAHRAMAN DOĞUYOR", level: 0, content_number: "1" },
//   { id: 2, content_name: "XX. YÜZYILIN BAŞLARINDA OSMANLI DEVLETİ", level: 1, content_number: "1.1" },
//   { id: 3, content_name: "Avrupa’daki Gelişmelerin Osmanlı Devleti’ne Yansımaları", level: 2, content_number: "1.2.1" },
//   { id: 4, content_name: "Dağılmayı Önleme Çabaları", level: 2, content_number: "1.2.2" },
//   { id: 5, content_name: "Osmanlı Devleti’nin Son Dönemindeki Başlıca Fikir Akımları", level: 2, content_number: "1.2.3" },
//   { id: 6, content_name: "MUSTAFA KEMAL’İN DOĞUMU, AILESI VE ÇOCUKLUĞU", level: 1, content_number: "1.2" },
//   { id: 7, content_name: "Mustafa Kemal’in Öğrenim Hayatı", level: 1, content_number: "1.3" },
//   { id: 8, content_name: "MUSTAFA KEMAL’IN FIKIR HAYATINI ETKILEYEN KIŞILER VE OLAYLAR", level: 1, content_number: "1.4" },
//   { id: 9, content_name: "I. DÜNYA SAVAŞI’NA KADAR MUSTAFA KEMAL’IN ASKERLIK HAYATI", level: 1, content_number: "1.5" }
// ];


const Page = () => {
  const [currentLesson, setCurrentLesson] = useState<Lesson>();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const id = params.id;
  const instId = params?.Inst_id;
  const router=useRouter()
  const [contents, setContents] = useState<Content[]>([]);
  
  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr; 
  const { data: session } = useSession();
  const content_type = params.content_type || 'pdf'; // Default to 'pdf' if not found


  useEffect(() => {
      let lessonResponse: AxiosResponse<any, any>;
      let data: any;

      console.log("useEffect triggered with id:", id, "and content_type:", content_type);

      const fetchPublishContents = async (publisherId: number, contentType: string) => {
        setLoading(true);
    try {

          console.log("Fetching contents for publisherId:", publisherId, "and contentType:", contentType);

            if(session?.user.role && session?.user.role == 'teacher') {
              // request with 
              lessonResponse = await apiClient.get(`/teachers/me/publishes/${Array.isArray(id) ? id[0] : id}/contents?content_type=${content_type}`,
              {
                headers: {
                  Authorization: `Bearer ${session?.user.accessToken}`
                }
              });
              data = lessonResponse.data.teacher_contents || [];

            } else if(session?.user.role && session?.user.role === 'admin') {
              console.log("Fetching contents for admin role");
                lessonResponse = await apiClient.get(`/lessons/publishes/${publisherId}/contents/${content_type}`)
              data = lessonResponse.data || [];
            } 
            
            const response_data = data
            console.log("Fetched contents:", data);
            setContents(response_data);
            


    } catch (err) {
        console.log(err);
    } finally {
        setLoading(false);
    }
    };
    if (session?.user.accessToken) {
      fetchPublishContents(
        parseInt(Array.isArray(id) ? id[0] : id),
        Array.isArray(content_type) ? content_type[0] : content_type
      );
    }
  
  }, [id, instId,session?.user.role]);


  return (
    <div>
      <div className="px-[22px] xl:px-[30px] rounded-[14px] py-[25px] bg-[#f4f5f7]">
        <div className="flex mb-[20px] items-center gap-[20px]">
          <button
          onClick={()=>router.back()}
            className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
          >
            <ArrowBackIos fontSize="small" className="pl-[3px]" />
          </button>
          <p className="font-semibold text-[24px] leading-[29px] text-textColor">
            {currentLanguageContent.content_types}
          </p>
        </div>
        {loading ? (
         <Loading  />
        ) : (
          <>
            {/* <LessonCard
              image={`/images/image3.svg`}
              title={currentLesson?.name}
              description={currentLesson?.description}
              tags={["Group Course", "Advance"]} // Replace with relevant tags
            /> */}

            <CourseContent contents={contents}  />

            {/* Other Courses */}
            {/* <div className="mt-[25px]">
              <p className="font-semibold mb-[15px] text-[24px] text-[#161439] leading-[29px]">
                Other Courses
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                {otherLessons?.length > 0 ? (
                  otherLessons.map((lesson) => (
                    <CourseCardBox
                      key={lesson.id}
                      lesson={lesson.lesson}
                      resourceId={Number(instId)}
                    />
                  ))
                ) : (
                  <p>No other courses available.</p>
                )}
              </div>
            </div> */}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;