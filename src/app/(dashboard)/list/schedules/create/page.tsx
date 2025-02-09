"use client"
import React, { useState, useEffect } from 'react';  
import axios from 'axios';  
import { useSession } from 'next-auth/react';
import { addScheduleToStudent, getTeacherStudentsAndClasses } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Avatar, Box, Button, Container, Grid, Grid2, IconButton, List, ListItem, ListItemAvatar, ListItemText, Modal, Tab, Tabs, TextField, ThemeProvider, Typography, createTheme } from '@mui/material';
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import { DeleteIcon } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

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

 

const TeacherDashboard = () => {  
  const [students, setStudents] = useState([]);  
  const [selectedStudent, setSelectedStudent] = useState(null);  
  const [tasks, setTasks] = useState([]);  
  const router = useRouter();  
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession(); // Get the session (which includes the token)

  const [newTask, setNewTask] = useState({
    day: '',
    startTime: '',
    endTime: '',
    description: ''
  });





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
    async function fetchData() {  
        try {  
          if (session?.user.role === 'teacher') {  
            // fetch teacher data
            const teacherResponse = await getTeacherStudentsAndClasses(session.user.accessToken);
            const students = teacherResponse.students;
            setStudents(students);
          
          }  
        } catch (error) {  
          console.error('Error fetching data:', error);  
        }  
      }  
    
      fetchData();  
      setLoading(false);

    }, [session, router]);  
    

  const handleStudentSelect = (student) => {  
    setSelectedStudent(student);  
    setTasks([]);  
  };  
  
  const handleAddTask = (day) => {  
    setTasks([...tasks, { day, startTime: "", endTime: "", description: "" }]);  
  };  
  
  const handleInputChange = (day: string, taskIndex: number, field: string, value: string) => {
    const newTasks = [...tasks];
    
    // O güne ait task'in genel dizideki indexini bul
    const allTasksOfDay = tasks.filter(t => t.day === day);
    const taskToUpdate = allTasksOfDay[taskIndex];
    const actualIndex = tasks.findIndex(t => t === taskToUpdate);
  
    if (field === 'startTime' || field === 'endTime') {
      const cleanedValue = value.replace(/[^\d:]/g, '');
      if (cleanedValue.length <= 5) {
        newTasks[actualIndex][field] = cleanedValue;
        if (cleanedValue.length === 2 && !cleanedValue.includes(':')) {
          newTasks[actualIndex][field] = cleanedValue + ':';
        }
      }
    } else {
      newTasks[actualIndex][field] = value;
    }
    
    setTasks(newTasks);
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
        task => !isValidTimeFormat(task.startTime) || !isValidTimeFormat(task.endTime)
      );
  
      if (hasInvalidTimes) {
        alert("Lütfen tüm saatleri doğru formatta girin (örn: 09:30 veya 14:45)");
        return;
      }
    try {
        // Veriyi backend formatına dönüştür
        const formattedTasks = tasks.map(task => ({
            start_time: convertTimeStringToBackendFormat(task.startTime),
            end_time: convertTimeStringToBackendFormat(task.endTime),
            description: task.description,
            day_of_week: task.day
        }));

        console.log(formattedTasks);

        if (selectedStudent) {
            const response = await addScheduleToStudent(
                { tasks: formattedTasks }, // Burada tasks key'i ile gönderdik
                session?.user?.accessToken || "", 
                selectedStudent.id
              );      
              
            // eğer 
              
        } else {
            console.error("selectedStudent is null");
            return;
        }

        toast.success("Program başarıyla kaydedildi.");
        
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

  if (loading) {
    return <div className="w-full h-full flex flex-col items-center justify-center">
    <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
    <span className="mt-2 text-blue-500">{currentLanguageContent.loading}</span>
  </div>;
  }

  const createCalendarEvents = (tasks) => {
    return tasks.map(task => ({
      title: task.description,
      start: `2024-02-09T${task.startTime}:00`,
      end: `2024-02-09T${task.endTime}:00`,
      backgroundColor: '#1976d2',
    }));
  };

  // Görev silme fonksiyonu
  const handleDeleteTask = (dayIndex, taskIndex) => {
    const newTasks = [...tasks];
    newTasks.splice(taskIndex, 1);
    setTasks(newTasks);
  };

  return (  
    <ThemeProvider theme={theme}>  
      <Container>  
        {!selectedStudent ? (  
          <Box mt={4}>  
            <Typography variant="h6" gutterBottom>{currentLanguageContent.which_student}</Typography>  
            <List>  
              {students.map(student => (  
                <ListItem button key={student.id} onClick={() => handleStudentSelect(student)}>  
                  <ListItemAvatar>  
                    <Avatar>  
                      {student.name[0]}{student.surname[0]}  
                    </Avatar>  
                  </ListItemAvatar>  
                  <ListItemText primary={`${student.name} ${student.surname}`} />  
                </ListItem>  
              ))}  
            </List>  
          </Box>  
        ) : (  
          <Box mt={4}>  
            <Typography variant="h5" gutterBottom>  
              {selectedStudent.name} {selectedStudent.surname} İçin Çalışma Takvimi  
            </Typography>  
            <Tabs value={view} onChange={(e, newValue) => setView(newValue)} sx={{ mb: 3 }}>  
              <Tab label="Liste Görünümü" value="list" />  
              <Tab label="Takvim Görünümü" value="calendar" />  
            </Tabs>  
            {view === 'calendar' ? (  
              <Box sx={{ height: '600px' }}>  
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
              </Box>  
            ) : (  
              <>  
                {[currentLanguageContent.monday, currentLanguageContent.tuesday, currentLanguageContent.wednesday,  
                  currentLanguageContent.thursday, currentLanguageContent.friday, currentLanguageContent.saturday,  
                  currentLanguageContent.sunday].map((day, dayIndex) => (  
                  <Box key={day} mt={2}>  
                    <Typography variant="h6">{day}</Typography>  
                    <Button variant="contained" color="primary" onClick={() => handleAddTask(day)}>  
                      {currentLanguageContent.add_task}
                    </Button>  
                    {tasks.filter(task => task.day === day).map((task, index) => (  
                      <Box key={index} mt={2}>  
                        <Grid2 container spacing={2} alignItems="center">  
                        <Grid2 item component="div" xs={12} sm={3}>
                                <TextField
                                    label="Başlama Saati"
                                    type="text"
                                    fullWidth
                                    value={task.startTime}
                                    onChange={(e) => handleInputChange(day, index, 'startTime', e.target.value)}
                                    InputLabelProps={{
                                    shrink: true,
                                    }}
                                    inputProps={{
                                    step: 300, // 5 dakikalık aralıklar
                                    }}
                                />
                                </Grid2>
                                <Grid2 item component="div" xs={12} sm={3}>
                                    <TextField
                                        label="Bitiş Saati"
                                        type="text"
                                        fullWidth
                                        value={task.endTime}
                                        onChange={(e) => handleInputChange(day, index, 'endTime', e.target.value)}
                                        InputLabelProps={{
                                        shrink: true,
                                        }}
                                        inputProps={{
                                        step: 300, // 5 dakikalık aralıklar
                                        }}
                                    />
                                    </Grid2>
                          <Grid2 item component="div" xs={12} sm={5}>  
                            <TextField  
                              label="Yapılacak"  
                              type="text"  
                              fullWidth  
                              value={task.description}  
                              onChange={(e) => handleInputChange(day, index, 'description', e.target.value)}
                              />  
                          </Grid2>  
                          <Grid2 item component="div" xs={12} sm={1}>  
                            <IconButton  
                              color="error"  
                              onClick={() => handleDeleteTask(dayIndex, index)}  
                              aria-label="delete"  
                            >  
                              <DeleteIcon />  
                            </IconButton>  
                          </Grid2>  
                        </Grid2>  
                      </Box>  
                    ))}  
                  </Box>  
                ))}  
              </>  
            )}  
            {view === 'list' && (  
              <Box mt={4}>  
                <Button variant="contained" color="secondary" onClick={handleSubmit}>  
                  Programı Kaydet  
                </Button>  
                <Button  
                  variant="outlined"  
                  color="secondary"  
                  onClick={() => setSelectedStudent(null)}  
                  style={{ marginLeft: '10px' }}  
                >  
                  Geri Dön  
                </Button>  
              </Box>  
            )}  
          </Box>  
        )}  
      </Container>  
    </ThemeProvider>  
  );  
};  

export default TeacherDashboard;