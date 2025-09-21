"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis,ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Loading from "../loading";
import apiClient from "@/lib/apiClient";
import { el, fi } from "date-fns/locale";
import { set } from "date-fns";
import TestProgressChart from "@/components/results/ProgressChart";
import UnitProgress from "@/components/results/UnitProgress";
import ContentProgressChart from "@/components/results/ContentProgressChart";
import UnitContentProgress from "@/components/results/UnitContentProgress";
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 

//define the ProgressData type
type TestProgressDataType = {
  student_name: string;
  student_surname: string;
  grade: string;
  student_no: number;
  progress_data: {
    submitted_at: string;
    unit_name: string;
    unit_no: number;
    percentage: number;
    test_name: string;
    correct_answers: number;
    false_answers: number;
    empty_answers: number;
    total_questions: number;
  }[];
  all_units: {
    unit_no: number;
    unit_name: string;
  }[];
};

type ContentProgressDataType = {
  student_name: string;
  student_surname: string;
  grade: string;
  student_no: number;
  progress_data: {
    completed_at: string;
    is_completed: boolean;
    unit_name: string;
    unit_no: number;
    percentage: number;
    content_name: string;
    level: string;
  }[];
  all_units: {
    unit_no: number;
    unit_name: string;
  }[];
};

type SubjectModel = {
  id: number;
  subject_name: string;
}


const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const [progressData, setProgressData] = useState<TestProgressDataType | null>(null);
  const [contentProgressData, setContentProgressData] = useState<ContentProgressDataType | null>(null);
  const [subjects, setSubjects] = useState<SubjectModel[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedProgresstType, setSelectedProgressType] = useState('Konu Çalışması'); // Default progress type
  const [progressTypes, setProgressTypes] = useState(['Konu Çalışması', 'Test Çalışması']); // Example progress types
  

  const searchParams = useSearchParams();
  const id = searchParams.get('studentId'); // Get student ID from query params
  const grade = searchParams.get('grade'); // Get grade from query params

  const [language, setLanguage] = useState("en");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);
    }
  }, []);
  const currentLanguageContent = language === "en" ? en : tr;

//loading
  
  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        
        const response = await apiClient.get(`/subjects/all/${grade}`, {
            headers: { Authorization: `Bearer ${session?.user.accessToken}` },
        });      
         
        const data = await response.data;
        setSubjects(data);
        console.log("Subjects are", data);
        
        if (data.length > 0) {
          setSelectedSubject(data[0]); // Set first subject as default
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
      
    };
    
    if (session?.user?.accessToken) {
      fetchSubjects();
      setLoading(false);
      console.log('Fetched subjects successfully');
    }
    
  }, [session?.user?.accessToken, grade]);
  
  // Fetch progress data when subject is selected
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!id || !selectedSubject || !session?.user?.accessToken) return;
      
      setLoading(true);

      try {
        let response;
        
        if(selectedProgresstType === 'Konu Çalışması') {
           response = await apiClient.get(`/teachers/students/${id}/content-progress/${selectedSubject}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user?.accessToken}`,
            },
          });
        }
        else if(selectedProgresstType === 'Test Çalışması') {
           response = await apiClient.get(`/teachers/students/${id}/test-progress/${selectedSubject}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user?.accessToken}`,
            },
          });
        }
        
        if (!response || !response.data) {
          console.error('No data received from API');
          return;
        }

        const data = response.data

        //log all units
        if (data.all_units && data.all_units.length > 0) {
          console.log('All units:', data.all_units);
        } else {
          console.log('No units found in progress data');
        }

        if (selectedProgresstType === 'Konu Çalışması') {
          setContentProgressData(data);
        }
        else if (selectedProgresstType === 'Test Çalışması') {
          setProgressData(data);
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressData();
  }, [id, selectedSubject, session?.user?.accessToken, selectedProgresstType]);
  
  // Handle subject selection
  const handleSubjectChange = (e:any) => {
    console.log('Selected subject:', e.target.value);
    setSelectedSubject(e.target.value);
  };

  const handleProgressTypeChange = (e:any) => {
  console.log('Selected progress type:', e.target.value);
    setSelectedProgressType(e.target.value);
  }
  

  if (loading) {
    return (
      <Loading />
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">

      {(selectedProgresstType == "Test Çalışması" && progressData) &&
          <div>
            <h1 className="text-2xl font-bold">
              {progressData.student_name} {progressData.student_surname} 
            </h1>
            <div className="flex flex-row gap-3">
            <p className="text-gray-600">Sınıf: {progressData.grade}</p>
            <p className="text-gray-600">{currentLanguageContent.no}: {progressData.student_no}</p>
            </div>
          </div>
          }

      {(selectedProgresstType == "Konu Çalışması" && contentProgressData)  &&
        <div>
          <h1 className="text-2xl font-bold">
            {contentProgressData.student_name} {contentProgressData.student_surname} 
          </h1>
          <div className="flex flex-row gap-3">
          <p className="text-gray-600">{currentLanguageContent.grade}: {contentProgressData.grade}</p>
          <p className="text-gray-600">{currentLanguageContent.no}: {contentProgressData.student_no}</p>
          </div>
        </div>
        }

      
        
        <div className="mt-4 sm:mt-0 flex flex-row items-center gap-4">
         
          <div>
          <label htmlFor="progress-type-select" className="block text-sm font-medium text-gray-700 mb-1">
            İlerleme Türü Seçin:
          </label>
          <select
            id="progress-type-select"
            value={selectedProgresstType}
            onChange={handleProgressTypeChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {progressTypes.map((progress_type) => (
              <option key={progress_type} value={progress_type}>
                {progress_type}
              </option>
            ))}
          </select>
          </div>

           <div>
          <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-1">
            Ders Seçin:
          </label>
          <select
            id="subject-select"
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
          { subjects.length >0 &&

            subjects.map((subject) => (
              <option key={subject} value={subject.subject_name}>
                {subject.subject_name || subject.subject_name}
              </option>
            ))}
          </select>

          </div>

        </div>
      </div>
      
      {/* Test Progress Chart */}
      {progressData && progressData.progress_data && progressData.progress_data.length > 0 && selectedProgresstType == 'Test Çalışması' ? (
        <TestProgressChart progressData={progressData} /> ) :
        contentProgressData && contentProgressData.progress_data && contentProgressData.progress_data.length > 0 && selectedProgresstType == 'Konu Çalışması' ? (
       <ContentProgressChart progressData={contentProgressData} />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
          <p className="text-gray-600">Bu ders için öğrenciye ait ilerleme verisi bulunmamaktadır.</p>
        </div>
      )}
      
      {/* Unit Progress Overview */}
      {progressData && progressData.all_units && progressData.all_units.length > 0 &&  selectedProgresstType == 'Test Çalışması' ? (
     <UnitProgress progressData={progressData} />) :  
     contentProgressData && contentProgressData.progress_data && contentProgressData.progress_data.length > 0 && selectedProgresstType == 'Konu Çalışması' ? (
        <UnitContentProgress progressData={contentProgressData} />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
          <p className="text-gray-600">Bu ders için öğrenciye ait ünite ilerleme verisi bulunmamaktadır.</p>
        </div>
      )}

    </div>
  );
};

export default ProgressPage;