"use client"
import React, { useState, useEffect } from 'react';  
import axios from 'axios';  
import { useSession } from 'next-auth/react';
import { addScheduleToStudent, getStudentSchedule, getTeacherStudentsAndClasses } from '@/lib/actions';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Box, Button, Checkbox, CircularProgress, Container, Grid, Grid2, IconButton, List, ListItem, ListItemAvatar, ListItemText, Modal, Tab, Tabs, TextField, ThemeProvider, Typography, createTheme } from '@mui/material';
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import { Clock, DeleteIcon, Plus, Trash2 } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { set } from 'date-fns';
import { ArrowBackIos } from '@mui/icons-material';
import Loading from '../../../loading';

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
  const { id } = useParams<{ id: string }>();
  const [studentData, setStudentData] = useState(null);


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
  

    // Fetching student schedule
    useEffect(() => {
      const fetchSchedule = async () => {
        try {
          setLoading(true);
          if (id && session?.user?.accessToken) {
            const response = await getStudentSchedule(Number(id), session.user.accessToken);
            setStudentData(response);

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

            setLoading(false);

          }
        } catch (error) {
          console.error('Error fetching schedule:', error);
          toast.error("Program bilgileri alınamadı");
        }
        finally {
          setLoading(false);
        }

      };
    
      fetchSchedule();
    }, [id, session?.user?.accessToken]);


    
  
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
        if (id) {
            const response = await addScheduleToStudent(
                { tasks: formattedTasks }, // Burada tasks key'i ile gönderdik
                session?.user?.accessToken || "", 
                Number(id)
              );      
                          
        } else {
          toast.error("Öğrenci bilgileri alınamadı.");
            
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

 
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
      <button
            onClick={() => router.back()}
            className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
          >
            <ArrowBackIos className="ml-1" fontSize="small" />
          </button>
        <h3 className="text-xl font-bold text-lamaPurple">
          {studentData?.student_name} {studentData?.student_surname} İçin Haftalık Program
        </h3>
        <button
          onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
          className="px-4 py-2 bg-lamaBlue  rounded-lg transition-all text-gray-900 text-sm  hover:text-gray-900"
        >
          {view === 'list' ? 'Takvim Görünümü' : 'Liste Görünümü'}
        </button>
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

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-lamaPurple text-white rounded-lg hover:bg-[#5a25cc] transition-all"
            >
              Programı Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;