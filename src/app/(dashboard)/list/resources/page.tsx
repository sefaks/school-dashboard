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
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  
  // Language setup
  const storedLanguage = typeof window !== 'undefined' ? localStorage.getItem("language") || "en" : "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr;
  
  // Get redirectTo from query params
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const isTest = redirectTo === "tests";


  const { data: session } = useSession();
  
  const handleBackClick = () => {
    router.back();
  };
  
  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const grade = e.target.value;
    setSelectedGrade(grade);
    
    if (grade === 'all') {
      setFilteredLessons(lessons);
    } else {
      // Convert both values to strings for comparison
      const filtered = lessons.filter(lesson => String(lesson.grade) === grade);
      setFilteredLessons(filtered);
    }
  };
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Determine the endpoint based on user role
        const endpoint = session?.user.role === 'admin' 
          ? 'admins/institution/lessons-publishes' 
          : 'teachers/me/institution/lessons-publishes';
        
        const response = await apiClient.get(endpoint, {
          headers: { Authorization: `Bearer ${session?.user.accessToken}` },
        });
        
        if (response.status === 401) {
          return;
        }
        
        const fetchedLessons = response.data;
        setLessons(fetchedLessons);
        setFilteredLessons(fetchedLessons);
        
        // Extract unique grades for the filter
        // Convert numeric grades to strings for consistent comparison
        const grades = [...new Set(fetchedLessons.map((lesson: Lesson) => String(lesson.grade)))].filter(Boolean);
        // Sort the grades numerically
        const sortedGrades = grades.sort((a, b) => parseInt(a) - parseInt(b));
        setAvailableGrades(sortedGrades);
        
        console.log("response data", fetchedLessons);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setLoading(false);
      }
    };
    
    if (session?.user.accessToken) {
      fetchLessons();
    }
  }, [session]);
  
  
  if (loading) {
    return <Loading/>
  }
  
  
  return (
    <div>
      <div className="px-[30px] rounded-[14px] py-[25px] bg-[#fafbfc]">
        <div className="flex mb-[25px] items-center justify-start flex-wrap gap-5">
          <div className="flex items-center">
            <p className="font-semibold text-[24px] leading-[29px] text-textColor">
              {currentLanguageContent.lessons}
            </p>
            <span className="ml-3 text-sm bg-blue-100 text-blue-700 py-1 px-2.5 rounded-full font-medium">
              {filteredLessons.length}
            </span>
          </div>
          
          {/* Grade Filter */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <label htmlFor="grade-filter" className="text-[14px] font-medium text-gray-600">
              {language === "en" ? "Filter by Grade:" : "Sınıfa Göre Filtrele:"}
            </label>
            <div className="relative">
              <select 
                id="grade-filter"
                value={selectedGrade}
                onChange={handleGradeChange}
                className="appearance-none bg-gray-50 pl-3 pr-8 py-2 border-0 rounded-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-gray-100 transition-colors duration-200"
              >
                <option value="all" className="font-medium">
                  {language === "en" ? "All Grades" : "Tüm Sınıflar"}
                </option>
                {availableGrades.map((grade) => (
                  <option key={grade} value={grade} className="font-medium">
                    {language === "en" ? `Grade ${grade}` : `Sınıf ${grade}`}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {filteredLessons.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
            {filteredLessons.map((lesson: Lesson, index: number) => (
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
              {language === "en" ? "No lessons found" : "Ders bulunamadı"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;