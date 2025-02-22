"use client"
import { teacherGetWeeklyAnalysis } from '@/lib/actions';
import apiClient from '@/lib/apiClient';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 
import api from '@/lib/apiClient_new';
import CombinedPerformanceChart from '@/components/Analysis/CombinedPerformanceChart';
import TaskStatsWithChart from '@/components/Analysis/TasksWithChart';
import AIAnalysisSection from '@/components/Analysis/AiAnalysis';

interface AnalysisDetail {
    student_name: string;
    student_surname: string;
    grade: number;
    report: {
      week_end_date: string;
      week_start_date: string;
      total_tests: number;
      average_test_score: number;
      total_solved_questions: number;
      total_weekly_tasks: number;
      weekly_task_score: number;
      average_task_score: number;
      ai_analysis:string;
      report_details: {
        total_assignments: number;
        total_solved_questions: number;
        total_tests: number;
       
        assignments: Array<{
          assignment_id: number;
          assignment_header: string;
          submitted_at: string;
          score: number | null;
          feedback: string | null;
          status: string;
        }>;
        tests: Array<{
          test_no: number;
          test_id: number;
          test_name: string;
          unit_name: string;
          submitted_at: string;
          unit_id: string;
          questions_count: number;
          correct_count: number;
          false_count: number;
          empty_count: number;
        }>;
        summary_stats: {
          total_assignment_score: number;
          average_assignment_score: number;
          total_test_score: number;
          average_test_score: number;
        };
      };
    };
  }

  const StudentAnalysis = () => {
    const [analysisData, setAnalysisData] = useState<AnalysisDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = ['overview', 'assignments', 'tests', 'tasks', 'ai_analysis'];


    const [language, setLanguage] = useState("en");
    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedLanguage = localStorage.getItem("language") || "en";
        setLanguage(storedLanguage);
      }
    }, []);
    const currentLanguageContent = language === "en" ? en : tr;


    const fetchAnalysisDetail = async (analyisId: string) => {

      try {
        setLoading(true);
        const response = await api.get(`/teachers/me/student-analysis/${analyisId}`);
        setAnalysisData(response.data);
        console.log(response.data);
      } catch (err) {
        setError('Analiz detayları yüklenirken bir hata oluştu.');
        console.error('Error fetching analysis detail:', err);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      // Get analysisId from the URL
      const analysisId = window.location.pathname.split('/').pop();
      
      if (analysisId) {
        fetchAnalysisDetail(analysisId);
      }
    }, []);
      

    if (loading) {
      return <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
                <span className="mt-2 text-blue-500">{currentLanguageContent.loading}</span>
              </div>;
    }
  
    if (error) {
      return <div className="text-red-500 text-center py-4">{error}</div>;
    }
  
    if (!analysisData) {
      return <div className="text-center py-4">{currentLanguageContent.report_not_found}</div>;
    }
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">
            {`${analysisData.student_name} ${analysisData.student_surname}`}
          </h1>
          <p className="text-gray-600">{`${analysisData.grade}. Sınıf`}</p>
        </div>
  
        {/* Analiz Tarihleri */}
        <div className="p-4 mb-2 border rounded-lg shadow">
          <p className="text-sm font-medium">{currentLanguageContent.report_time}</p>
          <p className="text-sm text-gray-500">
            {analysisData.report.week_start_date && analysisData.report.week_end_date ? (
              `${new Date(analysisData.report.week_start_date).toLocaleDateString('tr-TR')} - 
              ${new Date(analysisData.report.week_end_date).toLocaleDateString('tr-TR')}`
            ) : 'Tarih bilgisi yok'}
          </p>
        </div>

  
        {/* Genel İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">Çözülen ve Çözülmekte Olan Test</h3>
            <p className="text-2xl font-semibold text-blue-700">
              {analysisData.report.total_tests}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-900">Ortalama Test Puanı</h3>
            <p className="text-2xl font-semibold text-green-700">
              {analysisData.report.average_test_score.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-medium text-purple-900">Çözülen Soru</h3>
            <p className="text-2xl font-semibold text-purple-700">
              {analysisData.report.total_solved_questions}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h3 className="text-sm font-medium text-orange-900">Ödev Gönderimleri</h3>
            <p className="text-2xl font-semibold text-orange-700">
              {analysisData.report.report_details.total_assignments}
            </p>
          </div>
    
        </div>
  
        {/* Testler */}
        <div className="flex space-x-4 border-b">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`py-2 px-4 ${
              activeTab === tab 
                ? 'border-b-2 border-blue-500 font-bold' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? currentLanguageContent.general : 
             tab === 'assignments' ? currentLanguageContent.assignments : 
             tab === 'tests' ? currentLanguageContent.tests : 
             tab === 'tasks' ? currentLanguageContent.tasks :
             currentLanguageContent.ai_analysis || 'AI Analizi'}
          </button>
        ))}
      </div>


      {/* Genel Bakış Sekmesi */}
      {activeTab === "overview" && (
  <div className="p-4 border rounded-lg shadow">
    <p className="text-lg font-medium">{currentLanguageContent.performance_summary}</p>
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <p className="text-sm font-medium">{currentLanguageContent.average_assignment_score}</p>
        <p className="text-2xl font-bold">
         % {analysisData.report.report_details.summary_stats.average_assignment_score * 100 || 'N/A'}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium">Ortalama Test Puanı</p>
        <p className="text-2xl font-bold">
          {analysisData.report.report_details.summary_stats.average_test_score?.toFixed(1) || 'N/A'}
        </p>
      </div>
    </div>

    {/* Ödev Performans Grafiği */}
    <CombinedPerformanceChart analysisData={analysisData} currentLanguageContent = {currentLanguageContent} />
  </div>
)}

{/* Ödevler Sekmesi */}
{activeTab === "assignments" && (
  <div className="p-4 border rounded-lg shadow space-y-4">
    {analysisData.report.report_details.assignments.length > 0 ? (
      analysisData.report.report_details.assignments.map((assignment, index) => (
        <div key={index} className="p-4 border rounded-lg shadow flex flex-col gap-2">
          <h4 className="font-medium">{assignment.assignment_header}</h4>
          <p className="text-sm text-gray-500">
            Teslim: {assignment.submitted_at ? new Date(assignment.submitted_at).toLocaleString("tr-TR") : 'Tarih bilgisi yok'}
          </p>
          <div className='flex flex-row gap-1 items-center'>
          <p className='text-sm text-green-600'>{currentLanguageContent.score}:</p>
          <p className="text-md font-md">{assignment.score ?? currentLanguageContent.no_score}  </p>
          </div>
          <div className='flex flex-row gap-1 items-center'>
          <p className='text-sm text-purple-600'>{currentLanguageContent.feedback}:</p>
          <p className="text-sm font-md ">  {assignment.feedback ?? currentLanguageContent.no_feedback}</p>
          </div>

          <div className='flex flex-row gap-1 items-center'>
          <p className='text-sm text-blue-600'>{currentLanguageContent.status}:</p>
          <p className="text-sm font-md ">  {assignment.status === 'submitted' ? '✔️' : '❌'}</p>
          </div>


          
          
        </div>
      ))
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-500">Ödev verisi bulunamadı</p>
      </div>
    )}
  </div>
)}

{/* Testler Sekmesi */}
{activeTab === "tests" && (
  <div className="p-4 border rounded-lg shadow space-y-4">
    {analysisData.report.report_details.tests.length > 0 ? (
      analysisData.report.report_details.tests.map((test, index) => (
        <div key={index} className="p-4 border rounded-lg shadow">
          <h4 className="font-medium"> {test.test_no} - {test.test_name} </h4>
          <p className='text-xs'>{currentLanguageContent.unit}: {test.unit_name}</p>
          <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            {test.submitted_at ? new Date(test.submitted_at).toLocaleDateString("tr-TR") : 'Tarih bilgisi yok'}
          </p>

            <p className="text-grey ">{test.questions_count} Soru</p>
            <p className="text-sm text-green-600">{test.correct_count} Doğru</p>
            <p className='text-sm text-red-600'>{test.false_count} Yanlış</p>
            <p className='text-sm text-yellow-600'>{test.empty_count} Boş</p>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-500">Test verisi bulunamadı</p>
      </div>
    )}
  </div>
)}
  {/* Haftalık Tak Sekmesi */}
  <TaskStatsWithChart analysisData={analysisData} activeTab= {activeTab} />

  <AIAnalysisSection 
  analysis={analysisData?.report?.ai_analysis || ''}
  currentLanguageContent={currentLanguageContent}
  activeTab={activeTab}
  studentName={`${analysisData.student_name} ${analysisData.student_surname}`}
  reportDates={{
    startDate: analysisData.report.week_start_date,
    endDate: analysisData.report.week_end_date
  }}
/>

      </div>
  );
};
  
  
  export default StudentAnalysis;