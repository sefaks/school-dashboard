'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import Pagination from '@/components/Pagination';
import FormContainer from '@/components/FormContainer';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import RedirectButton from '@/components/AssignmentPage/RedirectButton';
import { adminClasses, teacherStudentsandClasses } from '@/lib/actions';
import { set } from 'date-fns';
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 

interface Schedule {
  id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  class_id: number;
}

interface ClassWithSchedule {
  id: number;
  class_code: string;
  institution_id: number;
  grade: number;
  schedules: Schedule[];
}

interface StudentSchedule {
  id: number;
  name: string;
  surname: string;
  grade: number;
  school_no: string;
  schedule: {
    id: number;
    assignee_type: string;
    created_at: string;
    updated_at: string;
    assignee_id: number;
    student_id: number;
  };
}

const statusColors: { [key: string]: string } = {
  ACTIVE: "bg-green-500",
  ARCHIVED: "bg-blue-500",
  DRAFT: "bg-red-500",
};



export default function ScheduleListPage() {
  const { data: session } = useSession(); // Get the session (which includes the token)

  const [data, setData] = useState<ClassWithSchedule[] | StudentSchedule[]>([]); // ✅ Varsayılan değer []
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('');
  const searchParams = useSearchParams();
  const [count, setCount] = useState(0);
  const [p, setP] = useState(1);


  const columns = [
    { header: "İsim", accessor: "name" },
    { header: "Sınıf", accessor: "class" },
    { header: "Durum", accessor: "status", className: "hidden md:table-cell" },
    { header: "Aksiyonlar", accessor: "actions", className: "hidden md:table-cell" },
  ];

  const [language, setLanguage] = useState("en");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);
    }
  }, []);
  const currentLanguageContent = language === "en" ? en : tr;

  useEffect(() => {
    if (session?.user.role) {
      setRole(session?.user.role);
    }
  }
  , [session?.user.role]);

  const fetchData = async () => {
    try {
      setLoading(true);
  

      let response;
      if (session?.user.role === 'admin') {
        const adminResponse = await adminClasses(session?.user.accessToken || '');
        console.log("Admin Response:", adminResponse); // ✅ Teacher API yanıtını kontrol et

        if (adminResponse?.classes) {
          setData(adminResponse.classes);
          setCount(adminResponse.classes.length);
          setLoading(false);

        }
      } if (session?.user.role === 'teacher') {
        const teacherResponse = await teacherStudentsandClasses(session?.user.accessToken || '');
        console.log("Full Teacher Response:", JSON.stringify(teacherResponse, null, 2)); // Tüm response'u detaylı görelim
        
        if (teacherResponse?.students) {
          console.log("First student full data:", JSON.stringify(teacherResponse.students[0], null, 2)); // İlk öğrencinin tüm verisini görelim
          setData(teacherResponse.students);
          setCount(teacherResponse.students.length);
          setLoading(false);
        }
      }

      console.log("API Response:", response); // Tüm veriyi konsolda gö
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    console.log("Data:", data); // ✅ Veriyi kontrol et
  }, [session?.user.role]);



  const renderAdminRow = (item: ClassWithSchedule) => {
    const schedule = item.schedules[0]; // Assuming we're showing the first schedule
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4">
          {schedule ? schedule.name : `${item.class_code} Programı`}
        </td>
        <td className="hidden md:table-cell">{item.class_code}</td>
        <td className="hidden md:table-cell">
          <span
            className={`${schedule?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} text-white py-1 px-3 rounded-full`}
          >
            {schedule?.status || 'Program Yok'}
          </span>
        </td>
        <td>
          <div className="flex items-center gap-2">
           
              <Link href={`/list/classes/${item.id}`}>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                  <Image src="/view.png" alt="" width={16} height={16} />
                </button>
              </Link>
            
            <FormContainer table="schedule" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </div>
        </td>

        <div className="flex items-center gap-2">
        <Link href={`/list/schedules/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="" width={16} height={16} />
          </button>
        </Link>

        {role === "teacher" && (
          <>
            <FormContainer table="assignment" type="delete" id={item.id} />
          </>
        )}
      </div>
      </tr>
    );
  };

  const renderTeacherRow = (item: StudentSchedule) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4">{`${item.name} ${item.surname}`}</td>
      <td className="hidden md:table-cell">{item.grade}. Sınıf</td>
      <td className="hidden md:table-cell">
        <span className={`bg-green-500 text-white py-1 px-3 rounded-full`}>
          {item.schedule ? 'Aktif' : 'Program Yok'}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
            <Link href={`/list/schedules/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>

            <RedirectButton type="update" id={item.id} page_type="schedules" />

          
        </div>
      </td>
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
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Tüm Programlar</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="schedule" type="create" />
            }

          </div>
        </div>
      </div>


      {/* LIST */}
      {!loading && Array.isArray(data) && data.length > 0 && (
  <Table
    columns={columns}
    renderRow={role === 'admin' ? renderAdminRow : renderTeacherRow}
    data={data}
  />
)}

      {/* PAGINATION */}
      {!loading  && <Pagination page={p} count={count} />}
    </div>
  );
}