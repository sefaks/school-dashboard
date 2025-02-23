"use client"
import React, { useEffect, useState } from 'react';
import { ArrowBackIos } from '@mui/icons-material';

import Link from 'next/link'
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import { useRouter } from 'next/navigation';
import { Lesson } from '@/app/types/Lesson';
import apiClient from '@/lib/apiClient';
import CourseCardBox from '@/components/CourseCardBox';
import { useSearchParams } from "next/navigation";
import { useSession } from 'next-auth/react';
import Loading from '../loading';


const Page = () => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const storedLanguage = localStorage.getItem("language") || "en";
    const [language, setLanguage] = useState(storedLanguage);
    const currentLanguageContent = language === "en" ? en : tr;

    // get redirectTo from query params
    const searchParams = useSearchParams();
  
    const redirectTo = searchParams.get("redirectTo"); 
    const isTest = redirectTo === "tests"; // ✅ redirectTo'ya göre isExam belirledik

    const { data: session } = useSession();

    const handleBackClick = () => {
        router.back();
    };

    useEffect(() => {
        const fetchLessons = async () => {
            try {
              const response = await apiClient.get('teachers/me/institution/lessons-publishes', {
                headers: { Authorization: `Bearer ${session?.user.accessToken}` },
              });
              if (response.status === 401) {
                return;
              }
              setLessons(response.data);
              setLoading(false);
            } catch (error) {
              console.error("Error fetching lessons:", error);
              setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    if (loading) {
      return <Loading/>
    }

    return (
        <div>
            <div className="px-[30px] rounded-[14px] py-[25px] bg-[#fafbfc]">
                <div className="flex mb-[20px] items-center gap-[20px]">
                    
                    <p className="font-semibold text-[24px] leading-[29px] text-textColor">{currentLanguageContent.lessons}</p>
                </div>
                {lessons.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                        {lessons.map((lesson: Lesson, index: number) => (
                            <CourseCardBox 
                                key={index} 
                                lesson={lesson} 
                                resourceId={lesson.institution_id} 
                                isTest={isTest}

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