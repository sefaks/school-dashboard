"use client"
import React, { useState, useEffect } from 'react';  
import axios from 'axios';  
import { useSession } from 'next-auth/react';
import { addScheduleToStudent, getStudent, getStudentSchedule, getTeacherStudentsAndClasses, updateScheduleToStudent } from '@/lib/actions';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Avatar, Box, Button, Checkbox, CircularProgress, Container, Grid, Grid2, IconButton, List, ListItem, ListItemAvatar, ListItemText, Modal, Tab, Tabs, TextField, ThemeProvider, Typography, createTheme } from '@mui/material';
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import { Clock, DeleteIcon, Plus, Trash2, UserSearch } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { set } from 'date-fns';
import { ArrowBackIos } from '@mui/icons-material';
import Loading from '../../loading';

const theme = createTheme({  
    palette: {  
      primary: {  
        main: "#A78BFA",  
      },  
      secondary: {  
        main: '#A8DADC', // İkinci bir renk örneği  
      },  
    },  
  });  

type Task = {
    day: string;
    startTime: string;
    endTime: string;
    description: string;
};

type Student = {
    id: number;
    student_name: string;
    student_surname: string;
    class_name: string;
    schedule?: {
      id: number;
      name: string;
      is_active: boolean;
      tasks: Task[];
    };
  };

const WEEK_DAYS = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar'
];

 

const TeacherDashboard = () => {  
  const [selectedStudent, setSelectedStudent] = useState(null);  
  const [tasks, setTasks] = useState([]);  
  const router = useRouter();  
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession(); // Get the session (which includes the token)
  const [schedule, setSchedule] = useState(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [isActive, setIsActive] = useState(true); // Varsayılan olarak aktif


const searchParams = useSearchParams();
const scheduleId = searchParams.get('id') as string | null;
const studentId = searchParams.get('student_id') as string | null;

const [newTask, setNewTask] = useState({
        day: '',
        startTime: '',
        endTime: '',
        description: ''
    });

    //Language State
    const [language, setLanguage] = useState("en");
    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedLanguage = localStorage.getItem("language") || "en";
        setLanguage(storedLanguage);
      }
    }, []);
    const currentLanguageContent = language === "en" ? en : tr;

    const [view, setView] = React.useState('list'); // 'list' veya 'calendar'
  
    useEffect(() => {
        if (studentData?.schedule?.is_active !== undefined) {
          setIsActive(studentData.schedule.is_active);
        }
      }, [studentData]);

    // Fetching student schedule
    useEffect(() => {
        if (scheduleId && session?.user?.accessToken) {
          setLoading(true);
          const fetchSchedule = async () => {
            try {
              const response = await getStudentSchedule(Number(scheduleId), session.user.accessToken);
              setStudentData(response);
              setSchedule(response.schedule);

              if (response.schedule?.tasks) {
                const formattedTasks = response.schedule.tasks.map(task => ({
                  day: task.day_of_week,
                  startTime: task.start_time.substring(0, 5),
                  endTime: task.end_time.substring(0, 5),
                  description: task.description,
                  id: task.id,
                  is_completed: task.is_completed
                }));
                setTasks(formattedTasks);
              }
            } catch (error) {
              console.error("Öğrenci programı getirilirken hata oluştu:", error);
            } finally {
              setLoading(false);
            }
          };
          fetchSchedule();
        } else if (studentId && session?.user?.accessToken) {
          // Burada scheduleId olmadığında ve studentId olduğunda çalışacak kısmı ekliyoruz
          setLoading(true);
          const fetchStudentInfo = async () => {
            try {
              const response = await getStudent(Number(studentId), session.user.accessToken);
              setStudentInfo(response);
            } catch (error) {
              console.error("Öğrenci bilgileri getirilirken hata oluştu:", error);
              toast.error("Öğrenci bilgileri alınamadı.");
            } finally {
              setLoading(false);
            }
          };
          fetchStudentInfo();
        } else {
          // Hem scheduleId hem de studentId yoksa loading'i kapat
          setLoading(false);
        }
      }, [scheduleId, studentId, session?.user?.accessToken]);
    
  
    const handleAddTask = (day: string) => {
      const newTask: Task = {
        day,
        startTime: "",
        endTime: "",
        description: "",
        id: `temp-${Date.now()}`, // Geçici bir ID ekleyelim
        is_completed: false // Yeni görevler tamamlanmamış olarak başlar
      };
      
      setTasks([...tasks, newTask]);
    };
  
  const handleDescriptionChange = (day: string, taskIndex: number, value: string) => {
    const newTasks = tasks.map((task, index) => {
      if (task.day === day && tasks.filter(t => t.day === day).indexOf(task) === taskIndex) {
        return {
          ...task,
          description: value
        };
      }
      return task;
    });
    setTasks(newTasks);
  };
  


  const handleTimeChange = (day: string, taskIndex: number, field: 'startTime' | 'endTime', value: string) => {
    // ":" karakterini kaldır
    const rawValue = value.replace(/:/g, '');
    
    // Sadece rakamları al
    const numbersOnly = rawValue.replace(/[^\d]/g, '');
    
    // 4 karakterden fazlasını engelle
    if (numbersOnly.length > 4) return;
    
    // İlk iki rakam 24 veya daha büyükse, "00" olarak ayarla
    let formattedValue = numbersOnly;
    if (numbersOnly.length >= 2) {
      const hours = parseInt(numbersOnly.slice(0, 2));
      if (hours >= 24) {
        formattedValue = '00' + numbersOnly.slice(2);
      }
    }
    
    const newTasks = tasks.map((task, index) => {
      if (task.day === day && tasks.filter(t => t.day === day).indexOf(task) === taskIndex) {
        // Eğer 4 rakam girilmişse formatted olarak kaydet
        if (formattedValue.length === 4) {
          let hours = formattedValue.slice(0, 2);
          const minutes = parseInt(formattedValue.slice(2, 4));
          
          // Dakika 59'dan büyükse 59 yap
          const validMinutes = minutes > 59 ? '59' : formattedValue.slice(2, 4);
          
          const formatted = `${hours}:${validMinutes}`;
          return {
            ...task,
            [field]: formatted
          };
        }
        // Değilse ham haliyle kaydet
        return {
          ...task,
          [field]: formattedValue
        };
      }
      return task;
    });
    setTasks(newTasks);
  };
  
  // Görüntüleme için saat formatı fonksiyonu
  const formatTimeDisplay = (value: string): string => {
    if (!value) return '';
    
    // Eğer zaten "HH:mm" formatındaysa direkt döndür
    if (/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }
    
    // Sadece rakamlar varsa formatla
    const numbersOnly = value.replace(/[^\d]/g, '');
    
    if (numbersOnly.length >= 2) {
      let hours = parseInt(numbersOnly.slice(0, 2));
      if (hours >= 24) hours = 0;
      
      if (numbersOnly.length >= 4) {
        let minutes = parseInt(numbersOnly.slice(2, 4));
        if (minutes > 59) minutes = 59;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      
      return numbersOnly;
    }
    
    return numbersOnly;
  };
  

  
  const convertTimeStringToBackendFormat = (timeString:string) => {
    if (!timeString) return '';
    // "20:30" formatını "20:30:00" formatına çevir
    return timeString + ':00';
  };

  const isValidTimeFormat = (timeString:string) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  };

  const handleSubmit = async () => {

    const hasInvalidTimes = tasks.some(
      (task: any) => !isValidTimeFormat(task.startTime) || !isValidTimeFormat(task.endTime)
    );

    if (hasInvalidTimes) {
      alert(currentLanguageContent.alert_schedule);
      return;
    }
    try {
        // Veriyi backend formatına dönüştür
        const formattedTasks = tasks.map((task: any) => ({
            start_time: convertTimeStringToBackendFormat(task.startTime),
            end_time: convertTimeStringToBackendFormat(task.endTime),
            description: task.description,
            day_of_week: task.day
        }));
        console.log(formattedTasks);


        if (studentId && !scheduleId) {
            const response = await addScheduleToStudent(
                { tasks: formattedTasks,
                  name: schedule?.name || `${studentInfo?.student_name} ${studentInfo?.student_surname} İçin Yeni Haftalık Program`,
                  is_active: isActive,
                 }, 
                session?.user?.accessToken || "", 
                Number(studentId)
              );      
                          
        } else if (scheduleId && !studentId) {
            // tasks ile birlikte is_active ve name 

            const response = await updateScheduleToStudent(
                { tasks: formattedTasks,
                  name: schedule?.name || `${studentData?.student_name} ${studentData?.student_surname} İçin Yeni Haftalık Program`,
                  is_active: isActive,
                 }, 
                session?.user?.accessToken || "", 
                Number(scheduleId)
              );
        }

        toast.success(currentLanguageContent.schedule_save_success);
        // 2 saniye sonra sayfayı yenile
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
    } catch (error: any) {
        let errorData;
    
        try {
            errorData = JSON.parse(error.message); // JSON stringini parse ediyoruz
        } catch {
            errorData = { status: 500, message: "Beklenmeyen bir hata oluştu!" };
        }
    
        switch (errorData.status) {
            case 404:
                toast.error(currentLanguageContent.student_not_found);
                break;
            case 403:
                toast.error(currentLanguageContent.no_acces_to_add_schedule);
                break;
            case 400:
                toast.warning(currentLanguageContent.already_have_schedule);
                break;
            default:
                toast.error(errorData.message || "Beklenmeyen bir hata oluştu!");
                break;
        }
    }
    
  };

  const groupTasksByDay = (tasks:any) => {
    // Her gün için boş bir array ile başlayalım
    const initialGroups = WEEK_DAYS.reduce((acc:any, day:any) => {
      acc[day] = [];
      return acc;
    }, {});

    // Mevcut taskları günlere göre gruplayalım
    return tasks.reduce((acc:any, task:any) => {
      if (acc[task.day]) {
        acc[task.day].push(task);
      }
      return acc;
    }, initialGroups);
  };

 


  const createCalendarEvents = (tasks:any) => {
    return tasks.map((task: any) => ({
      title: task.description,
      start: `2024-02-09T${task.startTime}:00`,
      end: `2024-02-09T${task.endTime}:00`,
      backgroundColor: '#1976d2',
    }));
  };

  // Görev silme fonksiyonu
  const handleDeleteTask = (day: string, taskIndex: number) => {
    const newTasks = tasks.filter((task, index) => {
      // Eğer bu task başka bir güne aitse, koru
      if (task.day !== day) {
        return true;
      }
      
      // Eğer bu task aynı güne aitse, index'i kontrol et
      const dayTasks = tasks.filter(t => t.day === day);
      const dayTaskIndex = dayTasks.indexOf(task);
      
      // Eğer silinmek istenen index değilse, koru
      return dayTaskIndex !== taskIndex;
    });
    
    setTasks(newTasks);
  };



  if (loading) {
    return <Loading/>
  }

  const setScheduleName = (name: string) => {
    setSchedule((prev:any) => ({
      ...prev,
      name: name
    }));
  }


  if (scheduleId  && !loading) {
    return (
    
      <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
      <div className='flex flex-row gap-4 items-center'>
              <button
                onClick={() => router.back()}
                className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
              >
                <ArrowBackIos className="ml-1" fontSize="small" />
              </button>
              <div className="relative">
                <input
                  type="text"
                  value={schedule?.name || ''}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder={`Program İsmi`}
                  className="text-lg font-medium text-gray-800 bg-white border border-gray-300 rounded-lg py-2 px-4 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-lamaPurple focus:border-transparent transition-all"
                  aria-label="Program Adı"
                />
                {schedule?.name && (
                  <button 
                    onClick={() => setScheduleName('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="İsmi Temizle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
        <div className='flex flex-row gap-4'>
          <div className="flex items-center">
          <select
              value={isActive ? "active" : "passive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:border-lamaBlue focus:outline-none focus:ring-2 focus:ring-lamaBlue focus:border-transparent transition-all cursor-pointer"
              style={{
                backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")",
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem"
              }}
            >
              <option value="active" className="py-1">Aktif</option>
              <option value="passive" className="py-1">Pasif</option>
            </select>
          </div>
          <button
            onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
            className="px-4 py-2 bg-lamaBlue rounded-lg transition-all text-gray-900 text-sm hover:text-gray-900"
          >
            {view === 'list' ? 'Takvim Görünümü' : 'Liste Görünümü'}
          </button>
        </div>            
    
          </div>
    
          {view === 'calendar' ? (
            <div className="h-[600px] bg-white rounded-lg shadow-lg p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'timeGridWeek,timeGridDay'
                }}
                events={createCalendarEvents(tasks)}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                locale="tr"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {WEEK_DAYS.map((day) => {
                const dayTasks = groupTasksByDay(tasks)[day] || [];
                return (
                  <div key={day} className="overflow-hidden border rounded-lg shadow">
                    <div className=" p-4 flex justify-between items-center">
                      <h2 className="text-md font-semibold ">{day}</h2>
                      <button
                        onClick={() => handleAddTask(day)}
                        className="px-3 py-1 bg-lamaPurple text-white rounded-lg hover:bg-lamaPurpleDark transition-all text-sm"
                      >
                        <Plus className="w-4 h-4 inline-block mr-1" />
                        Görev Ekle
                      </button>
                    </div>
                    <div className="divide-y">
                      {dayTasks.map((task:any) => (
                        <div
                          key={task.id || Math.random()}
                          className={`p-4 flex items-center justify-between ${
                            task.is_completed ? 'bg-purple-50/60' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                            <input
                                  type="text"
                                  value={formatTimeDisplay(task.startTime)}
                                  onChange={(e) => handleTimeChange(day, dayTasks.indexOf(task), 'startTime', e.target.value)}
                                  placeholder="09:00"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                                  maxLength={5}
                                />
                            </div>
                            <div className="col-span-3">
                            <input
                                type="text"
                                value={formatTimeDisplay(task.endTime)}
                                onChange={(e) => handleTimeChange(day, dayTasks.indexOf(task), 'endTime', e.target.value)}
                                placeholder="10:00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                                maxLength={5}
                              />
                            </div>
                            <div className="col-span-5">
                                <input
                                type="text"
                                value={task.description}
                                onChange={(e) => handleDescriptionChange(day, dayTasks.indexOf(task), e.target.value)}
                                placeholder="Görev açıklaması"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                                />
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <IconButton
                                onClick={() => handleDeleteTask(day, dayTasks.indexOf(task))}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          Bu gün için görev bulunmuyor
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            <div className="mt-6 flex justify-end gap-4 items-center">
               
                <div className="flex space-x-4">
                    <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-lamaPurple text-white rounded-lg hover:bg-[#5a25cc] transition-all"
                    >
                    Programı Kaydet
                    </button>
                </div>
                </div>
            </div>
          )}
        </div>
      );
  
    } else if (!scheduleId && !loading && studentId) {

        return (
            <div className="container mx-auto p-4">
             <div className="mb-6 flex justify-between items-center">
             <div className='flex flex-row gap-4 items-center'>
              <button
                onClick={() => router.back()}
                className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
              >
                <ArrowBackIos className="ml-1" fontSize="small" />
              </button>
              <div className="relative">
                <input
                  type="text"
                  value={schedule?.name || ''}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder={`Program İsmi`}
                  className="text-lg font-medium text-gray-800 bg-white border border-gray-300 rounded-lg py-2 px-4 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-lamaPurple focus:border-transparent transition-all"
                  aria-label="Program Adı"
                />
                {schedule?.name && (
                  <button 
                    onClick={() => setScheduleName('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="İsmi Temizle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
        <div className='flex flex-row gap-4'>
          <div className="flex items-center">
          <select
              value={isActive ? "active" : "passive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:border-lamaBlue focus:outline-none focus:ring-2 focus:ring-lamaBlue focus:border-transparent transition-all cursor-pointer"
              style={{
                backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")",
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem"
              }}
            >
              <option value="active" className="py-1">Aktif</option>
              <option value="passive" className="py-1">Pasif</option>
            </select>
          </div>
          <button
            onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
            className="px-4 py-2 bg-lamaBlue rounded-lg transition-all text-gray-900 text-sm hover:text-gray-900"
          >
            {view === 'list' ? 'Takvim Görünümü' : 'Liste Görünümü'}
          </button>
        </div>            
    
          </div>
    
              {view === 'calendar' ? (
            <div className="h-[600px] bg-white rounded-lg shadow-lg p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'timeGridWeek,timeGridDay'
                }}
                events={createCalendarEvents(tasks)}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                locale="tr"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {WEEK_DAYS.map((day) => {
                const dayTasks = groupTasksByDay(tasks)[day] || [];
                return (
                  <div key={day} className="overflow-hidden border rounded-lg shadow">
                    <div className="p-4 flex justify-between items-center">
                      <h2 className="text-md font-semibold">{day}</h2>
                      <button
                        onClick={() => handleAddTask(day)}
                        className="px-3 py-1 bg-lamaPurple text-white rounded-lg hover:bg-lamaPurpleDark transition-all text-sm"
                      >
                        <Plus className="w-4 h-4 inline-block mr-1" />
                        Görev Ekle
                      </button>
                    </div>
                    <div className="divide-y">
                      {dayTasks.map((task:any) => (
                        <div
                          key={task.id || Math.random()}
                          className="p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                              <input
                                type="text"
                                value={formatTimeDisplay(task.startTime)}
                                onChange={(e) => handleTimeChange(day, dayTasks.indexOf(task), 'startTime', e.target.value)}
                                placeholder="09:00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                                maxLength={5}
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="text"
                                value={formatTimeDisplay(task.endTime)}
                                onChange={(e) => handleTimeChange(day, dayTasks.indexOf(task), 'endTime', e.target.value)}
                                placeholder="10:00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                                maxLength={5}
                              />
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={task.description}
                                onChange={(e) => handleDescriptionChange(day, dayTasks.indexOf(task), e.target.value)}
                                placeholder="Görev açıklaması"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                              />
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <IconButton
                                onClick={() => handleDeleteTask(day, dayTasks.indexOf(task))}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          Bu gün için görev bulunmuyor
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            <div className="mt-6 flex justify-end gap-4 items-center">
            <div className="flex space-x-4">
                <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-lamaPurple text-white rounded-lg hover:bg-[#5a25cc] transition-all"
                >
                Programı Kaydet
                </button>
            </div>
            </div>
        </div>
          )}
        </div>
        );

    }
    
  }
 
  

export default TeacherDashboard;