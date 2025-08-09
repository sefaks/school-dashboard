"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis,ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Loading from "../loading";
import apiClient from "@/lib/apiClient";
import { fi } from "date-fns/locale";
import { set } from "date-fns";
import TestProgressChart from "@/components/results/ProgressChart";

//define the ProgressData type
type ProgressDataType = {
  student_name: string;
  student_surname: string;
  grade: string;
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

    


const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const [progressData, setProgressData] = useState<ProgressDataType | null>(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  const searchParams = useSearchParams();
  const id = searchParams.get('studentId'); // Get student ID from query params
  const grade = searchParams.get('grade'); // Get grade from query params
  
  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        console.log('Fetching subjects for grade:', grade);
        const response = await apiClient.get(`/subjects/all/${grade}`, {
            headers: { Authorization: `Bearer ${session?.user.accessToken}` },
        });      
         
        const data = await response.data;
        setSubjects(data);
        
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
        const response = await apiClient.get(`/teachers/students/${id}/test-progress/${selectedSubject}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`,
          },
        });
        
        const data = response.data
        console.log('Fetched progress data:', data);

        //log all units
        if (data.all_units && data.all_units.length > 0) {
          console.log('All units:', data.all_units);
        } else {
          console.log('No units found in progress data');
        }

        setProgressData(data);

      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressData();
  }, [id, selectedSubject, session?.user?.accessToken]);
  
  // Handle subject selection
  const handleSubjectChange = (e:any) => {
    console.log('Selected subject:', e.target.value);
    setSelectedSubject(e.target.value);
  };
  
  // Process data for the test progress chart
  const prepareTestProgressData = () => {
    if (!progressData || !progressData.progress_data) return [];
    
    // Sort progress data by date
    const sortedData = [...progressData.progress_data].sort(
        (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    );
    
    // Format data for the chart
    return sortedData.map(item => ({
      date: new Date(item.submitted_at).toLocaleDateString(),
      unitName: item.unit_name,
      unitNo: item.unit_no,
      percentage: item.percentage,
      testName: item.test_name,
      correctAnswers: item.correct_answers,
      falseAnswers: item.false_answers,
      emptyAnswers: item.empty_answers,
      totalQuestions: item.total_questions
    }));
  };
    

  
  if (loading) {
    return (
      <Loading />
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        {progressData && (
          <div>
            <h1 className="text-2xl font-bold">
              {progressData.student_name} {progressData.student_surname}
            </h1>
            <p className="text-gray-600">Sınıf: {progressData.grade}</p>
          </div>
        )}
        
        <div className="mt-4 sm:mt-0">
          <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-1">
            Ders Seçin:
          </label>
          <select
            id="subject-select"
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject || subject}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Test Progress Chart */}
      {progressData && progressData.progress_data && progressData.progress_data.length > 0 ? (
        <TestProgressChart progressData={progressData} />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
          <p className="text-gray-600">Bu ders için test verisi bulunmamaktadır.</p>
        </div>
      )}
      
      {/* Unit Progress Overview */}
      {progressData && progressData.all_units && progressData.all_units.length > 0 && (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">Ünite Bazlı İlerleme</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...progressData.all_units]
        .sort((a, b) => a.unit_no - b.unit_no) // unit_no'ya göre sıralama
        .map((unit) => {
          // unit_no'ya göre testleri filtrele
          const unitTests = progressData.progress_data.filter(
            (test) => test.unit_no === unit.unit_no
          );

          // Ortalama başarı oranı hesapla (progress_data'da success yüzdesi yoksa kendin hesapla)
          const avgSuccess = unitTests.length
            ? unitTests.reduce((sum, test) => {
                // Eğer test objesinde 'percentage' yoksa hesapla
                const percentage = test.percentage !== undefined
                  ? test.percentage
                  : Math.round((test.correct_answers / test.total_questions) * 100);
                return sum + percentage;
              }, 0) / unitTests.length
            : 0;

          // Son test tarihi (varsa)
          const latestTest = unitTests.length
            ? unitTests.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0]
            : null;

          return (
            <div key={unit.unit_no} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-lg">
                {unit.unit_no} - {unit.unit_name}
              </h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Ortalama Başarı:</span>
                  <span
                    className={`font-medium ${
                      avgSuccess >= 70
                        ? 'text-green-600'
                        : avgSuccess >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {avgSuccess.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      avgSuccess >= 70
                        ? 'bg-green-600'
                        : avgSuccess >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${avgSuccess}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p>Test Sayısı: {unitTests.length}</p>
                {latestTest && (
                  <p>Son Test: {new Date(latestTest.submitted_at).toLocaleDateString()}</p>
                )}
              </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;