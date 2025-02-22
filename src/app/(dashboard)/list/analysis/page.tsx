"use client"
import { useEffect, useState } from 'react';
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import api from "@/lib/apiClient_new";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import Image from "next/image";
import Link from 'next/link';
import FormContainer from '@/components/FormContainer';
import RedirectButton from '@/components/AssignmentPage/RedirectButton';
import { set } from 'date-fns';
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 

interface AnalysisList {
  student_id: number;
  student_name: string;
  student_surname: string;
  grade: number;
  report: {
    id:number;
    week_start_date: string;
    week_end_date: string;
    total_tests: number;
    average_test_score: number;
    total_solved_questions: number;
  
  };
}

export default function StudentAnalysisPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [p, setP] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [institutionId, setInstitutionId] = useState<number | null>(null);

  const [language, setLanguage] = useState("en");
    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedLanguage = localStorage.getItem("language") || "en";
        setLanguage(storedLanguage);
      }
    }, []);
    const currentLanguageContent = language === "en" ? en : tr;



  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();
        setRole(role);
        setCurrentUserId(parseInt(current_user_id));
        setInstitutionId(parseInt(institution_id));
      } catch (err) {
        console.error("Kullanıcı bilgileri alınırken hata oluştu:", err);
      }
    };

    fetchUserInfo();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teachers/me/students-weekly-analysis');

      console.log("API Response:", response.data); // Tüm veriyi konsolda gör

      if (response.data) {

        const sortedData = response.data.sort((a: AnalysisList, b: AnalysisList) => {
          const dateA = new Date(a.report.week_start_date).getTime();
          const dateB = new Date(b.report.week_start_date).getTime();
          return dateB - dateA; // En yakın tarih en önde olacak şekilde sıralama
        });

        setAnalysisData(sortedData);
        setCount(response.data.length);
      
      }
      setError(null);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu.');
      console.error('Error fetching analysis data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const columns = [
    { header: "Öğrenci", accessor: "name" },
    { header: "Sınıf", accessor: "class" },
    { header: "Analiz Türü", accessor: "type", className: "hidden md:table-cell" },
    { header: "Zaman Aralığı", accessor: "dueDate", className: "hidden md:table-cell" },
   
  ]  

  const renderRow = (item: AnalysisList) => (
    <tr key={item.student_id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td>{`${item.student_name} ${item.student_surname}`}</td>
      <td>{`${item.grade}. Sınıf`}</td>
      <td className="hidden md:table-cell">Haftalık Analiz</td>
      <td className="hidden md:table-cell">
        {`${new Date(item.report.week_start_date).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} - ${new Date(item.report.week_end_date).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
      </td>

      <div className="flex items-center gap-2">
        <Link href={`/list/analysis/${item.report.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="" width={16} height={16} />
          </button>
        </Link>
        {role === "teacher" && (
          <>
            <FormContainer table="assignment" type="delete" id={item.report.id} />
          </>
        )}
      </div>
    </tr>
  );

  if (loading) {
    return <div className="w-full h-full flex flex-col items-center justify-center">
    <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
    <span className="mt-2 text-blue-500">{currentLanguageContent.loading}</span>
  </div>
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Öğrenci Analizleri</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading ve Error durumları */}
     
      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {/* LIST */}
      {!loading && !error && analysisData && <Table columns={columns} renderRow={renderRow} data={analysisData} />}

      {/* PAGINATION */}
      {!loading && !error && <Pagination page={p} count={count} />}
    </div>
  );
}
