"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Lesson } from "@/app/types/Lesson";
import apiClient from "@/lib/apiClient";
import { toast } from "react-toastify";
import { ArrowBackIos } from "@mui/icons-material";
import CourseCardBox from "@/components/CourseCardBox";
import { useSession } from "next-auth/react";
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const institution_id = params.Inst_id;
  const redirectTo = searchParams.get("redirectTo");

  console.log("Redirect to:", redirectTo);


  const isTest = redirectTo === "tests"; // Eğer tests sayfasına gidilecekse isTest true olacak

  const [language, setLanguage] = useState("en");
  const currentLanguageContent = language === "en" ? en : tr;

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") || "en";
    setLanguage(storedLanguage);
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await apiClient.get(
          `teachers/me/institutions/${institution_id}/lessons-publishes`,
          {
            headers: { Authorization: `Bearer ${session?.user.accessToken}` },
          }
        );

        if (response.status === 401) {
          toast.error("Unauthorized Access");
          return;
        }

        setLessons(response.data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    if (institution_id) {
      fetchLessons();
    } else {
      setLoading(false);
    }
  }, [institution_id, session]);

  const handleLessonClick = (lessonId: string) => {
    if (isTest) {
      router.push(`/list/resources/${institution_id}/tests?isTest=true`);
    } else {
      router.push(`/list/resources/${institution_id}/lessons/${lessonId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          ></svg>
        </div>
    );
  }

  return (
    <div>
      <div className="px-[30px] rounded-[14px] py-[25px]">
        {/* Back arrow button */}
        <div className="flex mb-[20px] items-center gap-[20px]">
          <button
            onClick={() => router.back()}
            className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
          >
            <ArrowBackIos className="ml-1" fontSize="small" />
          </button>
          <p className="font-semibold text-[24px] leading-[29px] text-textColor">
            {currentLanguageContent.lessons}
          </p>
        </div>

        {lessons.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
            {lessons.map((lesson, index) => (
              <CourseCardBox
                key={index}
                lesson={lesson}
                resourceId={institution_id}
                isTest={isTest} // isTest bilgisini CourseCardBox'a gönderiyoruz
                onClick={() => handleLessonClick(lesson.id)}
              />
            ))}
          </div>
        ) : (
          <div>
            <p className="text-black text-[18px] font-semibold italic">
              No lessons found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
