
"use client";
import React, { useEffect, useState } from "react";
import { ArrowBackIos } from "@mui/icons-material";

import { Lesson, students_contents,StudentContent, Content } from "@/app/types/Lesson";
import { useParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json";
import { getPublishContents } from "@/lib/actions";
import Loading from "@/app/(dashboard)/list/loading";
import CourseContent from "@/components/LessonsPage/CourseContent";

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

  useEffect(() => {
    const fetchLessonAndOtherLessons = async () => {
    setLoading(true);
    try {
        // Content type'ı URL'den alalım (params'dan)

        const publisherId = Array.isArray(id) ? id[0] : id;
        const contentType = Array.isArray(params.content_type) ? params.content_type[0] : params.content_type;
        const lessonResponse = await getPublishContents(parseInt(publisherId as string), contentType);
        console.log("lessonResponse", lessonResponse);
        if (lessonResponse) {
            const lessons = lessonResponse as Content[];
            setContents(lessons);
            console.log("Contents:", lessons);
        } else {
            console.error("No lesson data found");
        }

    } catch (err) {
        console.log(err);
    } finally {
        setLoading(false);
    }
    };
  
    fetchLessonAndOtherLessons();
  }, [id, instId]);


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