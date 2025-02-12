"use client"
import React, { useState, useEffect } from 'react';
import { Clock, Check, X } from 'lucide-react';
import { getStudentSchedule } from '@/lib/actions';
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowBackIos } from '@mui/icons-material';
import { tr as trLocale } from 'date-fns/locale';

import { format } from 'date-fns/format';
// import tr as trrr from 'date-fns/locale/tr';


interface Task {
    id: number;
    description: string;
    start_time: string;
    end_time: string;
    is_completed: boolean;
    day_of_week: string;
}

interface GroupedTasks {
  [key: string]: Task[];
}

const TeacherStudentSchedule = () => {
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession(); // Get the session (which includes the token)
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);


  const isToday = (day: string) => {
    const today = format(new Date(), 'EEEE', { locale: trLocale }); // 'Salı' gibi
    return day === today;
  };



  const [language, setLanguage] = useState("en");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);
    }
  }, []);
  const currentLanguageContent = language === "en" ? en : tr;

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const response = await getStudentSchedule(Number(id), session?.user.accessToken || "");
      
        // Group tasks by day
        const grouped = response.schedule.tasks.reduce((acc: GroupedTasks, task: Task) => {
          const day = task.day_of_week;
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push(task);
          return acc;
        }, {});
        
        setGroupedTasks(grouped);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching schedule:', error);


      }finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [id]);

  const formatTime = (time: string) => {
    return time.substring(0, 5); // "14:30:00" -> "14:30"
  };

  if (isLoading) {
    return <div className="w-full h-full flex flex-col items-center justify-center">
    <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
    <span className="mt-2 text-blue-500">{currentLanguageContent.loading}</span>
  </div>;
  }

  return (
    <div className="space-y-6 p-4">
         <div className="flex flex-row gap-2 p-4 border-b items-center">
          <button
            onClick={() => router.back()}
            className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
          >
            <ArrowBackIos className="ml-1" fontSize="small" />
          </button>
          <p className="font-semibold text-[24px] leading-[29px] text-textColor">
            {currentLanguageContent.schedules}
          </p>
        </div>
      {Object.entries(groupedTasks).map(([day, tasks]) => (
        <div key={day} className="overflow-hidden border rounded-lg shadow">
          <div className="bg-gray-100 p-3 flex flex-row gap-2">
            <h2 className="text-lg font-semibold text-gray-800">{day}</h2>
            {isToday(day) && (
                  <span className="ml-2 text-sm bg-blue-100  text-blue-800 px-2 py-1 rounded-full">
                   {currentLanguageContent.today}
                  </span>
                )}
          </div>
          <div className="p-0">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`border-b p-4 flex items-center justify-between ${
                  task.is_completed ? 'bg-green-50/60' : 'bg-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(task.start_time)} - {formatTime(task.end_time)}
                      </span>
                    </div>
                  </div>
                  <p className={`${task.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.description}
                  </p>
                </div>
                <div className="flex items-center">
                  {task.is_completed ? (
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-1" />
                      <span className="text-sm">{currentLanguageContent.completed}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <X className="w-5 h-5 mr-1" />
                      <span className="text-sm">{currentLanguageContent.not_completed}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherStudentSchedule;