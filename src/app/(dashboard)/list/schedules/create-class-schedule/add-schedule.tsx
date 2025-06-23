'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DayOfWeek, ScheduleCreateSchema, scheduleCreateSchema } from '@/lib/formValidationSchemas';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { createSchedule, updateSchedule } from '@/lib/actions';
import { useSession } from 'next-auth/react';
import { useFormState } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import TimeInput from '@/components/TimeInput';
import Link from 'next/link';
import WeeklySchedule from '@/components/schedules/WeeklySchedule';

const SchedulePage = ({
  data,
  relatedData,
}: {
  data?: any;
  relatedData?: any;
}) => {
  // Determine if we're creating or updating based on data existence
  const type = data ? "update" : "create";
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('id');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(scheduleCreateSchema),
    defaultValues: {
      ...data,
      lesson_schedules: data?.lesson_schedules || []
    }
  });

  const { data: session } = useSession();
  const watchedClassId = watch('class_id');
  
  // Log errors if there are any
  console.log("Form Errors", errors);

  // Set status to lower case when initializing the form
  useEffect(() => {
    if (data?.status) {
      const lowerCaseStatus = data.status.toLowerCase();
      setValue("status", lowerCaseStatus);
    }
  }, [data?.status, setValue]);

  const [gradeFilter, setGradeFilter] = useState<number | string>("");
  const [subjectFilter, setSubjectFilter] = useState<number | string>("");
  const [selectedLessons, setSelectedLessons] = useState<Record<string, {
    lesson_id: number;
    teacher_id: number;
    start_time: string;
    end_time: string;
    day_of_week: DayOfWeek;
  }>>({});

  // Load existing schedule data if updating
  useEffect(() => {
    if (type === "update" && data?.lesson_schedules) {
      console.log(data.lesson_schedules);

      const dayOfWeekMap: Record<string, string> = {
        Monday: "Pazartesi",
        Tuesday: "Salı",
        Wednesday: "Çarşamba",
        Thursday: "Perşembe",
        Friday: "Cuma",
        Saturday: "Cumartesi",
        Sunday: "Pazar",
      };
      
      const formattedSchedules = data.lesson_schedules.map((schedule: any) => {
        let startTime = schedule.start_time;
        let endTime = schedule.end_time;
  
        // Convert Date objects to strings if needed
        if (schedule.start_time instanceof Date) {
          startTime = `${schedule.start_time.getHours().toString().padStart(2, '0')}:${schedule.start_time.getMinutes().toString().padStart(2, '0')}`;
        }
        if (schedule.end_time instanceof Date) {
          endTime = `${schedule.end_time.getHours().toString().padStart(2, '0')}:${schedule.end_time.getMinutes().toString().padStart(2, '0')}`;
        }
        
        const dayOfWeek = dayOfWeekMap[schedule.day_of_week] || schedule.day_of_week;
  
        return {
          id: schedule.id,
          ...schedule,
          start_time: startTime,
          end_time: endTime,
          day_of_week: dayOfWeek
        };
      });
     
      setLessonSchedules(formattedSchedules);
      setValue("lesson_schedules", formattedSchedules);
      
      // Load existing lessons into selectedLessons state
      const lessonsMap: Record<string, any> = {};
      data.lesson_schedules.forEach((schedule: any) => {
        // Convert start and end times
        const startTime = new Date(schedule.start_time);
        const endTime = new Date(schedule.end_time);
  
        // Format hours and minutes as HH:MM
        const formattedStartTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
        const formattedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
  
        // Convert day name to Turkish
        const dayOfWeek = dayOfWeekMap[schedule.day_of_week] || schedule.day_of_week;
  
        // Add to lessonsMap in appropriate format
        lessonsMap[dayOfWeek] = {
          id: schedule.id,
          lesson_id: schedule.lesson_id,
          teacher_id: schedule.teacher_id,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          day_of_week: dayOfWeek,
        };
      });

      console.log("selected lessons", lessonsMap);
  
      // Set grade filter when class is selected
      if (data.class_id) {
        const selectedClass = relatedData?.classes.find(
          (cls: { id: number }) => cls.id === data.class_id
        );
        setGradeFilter(selectedClass?.grade || "");
      }
  
      // Set status
      if (data.status) {
        setStatus(data.status.toLowerCase());
      }
    }
  }, [type, data, relatedData?.classes, setValue]);

  const handleTeacherChange = useCallback((day: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTeacherId = Number(e.target.value);
    setSelectedLessons(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        teacher_id: selectedTeacherId
      }
    }));
  }, []);

  const [lessonSchedules, setLessonSchedules] = useState<Array<{
    lesson_id: number;
    teacher_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>>([]);
    
  console.log("Lesson Schedules", lessonSchedules);
    
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string>("draft");
  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
 
  // Form state management
  const [state, formAction] = useFormState(async (prevState: any, formData: string) => {
    console.log("Form Action Triggered", formData);
    try {
      const parsedData = JSON.parse(formData);
      const finalData = {
        ...parsedData,
        status,
        lesson_schedules: lessonSchedules,
      };
      console.log("Final Data:", finalData);
      let response;
      
      if (type === "create") {
        response = await createSchedule(finalData, session?.user.accessToken || "");
        if (response.status == 400 && response.success === false) {

          toast.error("Hali hazırda aktif bir program var. Lütfen aktif programı arşivleyin veya silin.");  
          return ;
        }
        toast.success("Program başarıyla oluşturuldu.");
        setTimeout(() => {
          router.push('/list/schedules');
        }, 1000);

      } else if (type === "update") {
        console.log("Updating schedule with ID:", data.id);
        console.log("Lesson schedules:", lessonSchedules);
        response = await updateSchedule(finalData, session?.user.accessToken || "", data.id);

        if (response.success === false) {
          toast.error(response.message);
         
          return;
        }
        toast.success("Program başarıyla güncellendi.");
        setTimeout(() => {
          console.log("Redirecting to create class schedule with ID:", scheduleId);
          router.push('/list/schedules/create-class-schedule' + `?id=${scheduleId}`);
        }, 1000);

      }
        
      return {
        success: true,
        error: false,
        data: response
      };
    } catch (error: any) {
      console.log("Unexpected error:", error);
      toast.error("Beklenmeyen bir hata oluştu.");
      
      return {
        success: false,
        error: "Beklenmeyen bir hata oluştu.",
        data: null
      };
    }
  }, {
    success: false,
    error: false,
    data: null,
  });

  const handleAddLesson = useCallback((lessonData: { lesson_id: number; teacher_id: number; day_of_week: string; start_time: string; end_time: string; }) => {

    // eğer hali hazırda ders saatinde çakışma varsa kullanıcıyı uyar ve ekleme
    const existingLesson = lessonSchedules.find(schedule => 
      schedule.day_of_week === lessonData.day_of_week &&
      ((schedule.start_time < lessonData.end_time && schedule.end_time > lessonData.start_time) ||
       (lessonData.start_time < schedule.end_time && lessonData.end_time > schedule.start_time))
    );
    if (existingLesson) {
      toast.error("Bu ders saatinde zaten bir ders var. Lütfen farklı bir saat seçin.");
      // hata fırlat
      throw new Error("Ders saatinde çakışma var");
    }

    setLessonSchedules((prev) => [
      ...prev,
      lessonData,
    ]);
  }, []);
    
  const handleRemoveLesson = (day: string, scheduleIndex: number) => {
    setLessonSchedules(prev => {
      const daySchedules = prev.filter(schedule => schedule.day_of_week === day);
      
      const scheduleToRemove = daySchedules[scheduleIndex];
      
      return prev.filter(schedule => schedule !== scheduleToRemove);
    });
  };

      
  const toggleDay = (day: string) => {
    setOpenDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const onSubmit = async (formData: ScheduleCreateSchema) => {
    console.log("Form Submit Triggered", formData);

    if(lessonSchedules.length === 0) {
      toast.error("Lütfen en az bir ders ekleyin");
      return;
    }
    
    formAction(JSON.stringify(formData));
  };

  const handleLessonChange = useCallback((day: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLessonId = Number(e.target.value);
    const selectedLesson = relatedData?.lessons.find(
      (lesson: { id: number }) => lesson.id === selectedLessonId
    );
  
    if (selectedLesson) {
      setSelectedLessons(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          lesson_id: selectedLessonId,
          day_of_week: day as DayOfWeek
        }
      }));
      setSubjectFilter(selectedLesson.subject_id || "");
    }
  }, [relatedData?.lessons]);

  const handleTimeChange = useCallback(
    (day: string, field: 'start_time' | 'end_time', value: string) => {
      // Helper function to adjust time string
      const adjustTime = (timeStr: string): string => {
        const [hour, minute] = timeStr.split(':').map(Number);
        const adjustedHour = (hour + 24) % 24;
        return `${adjustedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      };

      // New time value
      const adjustedValue = adjustTime(value);

      const otherField = field === 'start_time' ? 'end_time' : 'start_time';
      const otherTime = selectedLessons[day]?.[otherField];

      if (otherTime) {
        const [hour, minute] = adjustedValue.split(':').map(Number);
        const [otherHour, otherMinute] = otherTime.split(':').map(Number);
        const isInvalid =
          (field === 'start_time' && hour * 60 + minute >= otherHour * 60 + otherMinute) ||
          (field === 'end_time' && hour * 60 + minute <= otherHour * 60 + otherMinute);

        if (isInvalid) {
          toast.error('Başlangıç saati bitiş saatinden önce olmalıdır.');
          return;
        }
      }

      setSelectedLessons((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [field]: adjustedValue,
        },
      }));
    },
    [selectedLessons]
  );

  const DaySchedule = ({ day }: { day: string }) => {
    const lessonData = selectedLessons[day] || {
      lesson_id: 0,
      teacher_id: 0,
      start_time: "",
      end_time: "",
      day_of_week: day as DayOfWeek,
    };
  
    const handleAddClick = () => {
      try {
        if (lessonData.lesson_id === 0 || 
            lessonData.teacher_id === 0 || 
            !lessonData.start_time || 
            !lessonData.end_time || 
            !lessonData.day_of_week) {
          toast.error("Lütfen tüm alanları doldurun");
          return;
        }

        try {
          handleAddLesson(lessonData);
        } catch (error) {
          console.error("Error adding lesson:", error);
          return;
        }
  
        
        // Reset the form for this day
        setSelectedLessons(prev => ({
          ...prev,
          [day]: {
            lesson_id: 0,
            teacher_id: 0,
            start_time: "",
            end_time: "",
            day_of_week: day as DayOfWeek,
          }
        }));
  
        toast.success("Ders başarıyla eklendi!");
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0]?.message || "Geçersiz giriş");
        } else {
          console.error("Unexpected error:", error);
          toast.error("Bir hata oluştu");
        }
      }
    };

    const formatViewTime = (time: string) => {
      if (!time) return "";
      const [hour, minute] = time.split(":").map(Number);
      return `${hour.toString()}:${minute.toString()}`;
    }
  
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={lessonData.lesson_id || ""}
            onChange={(e) => handleLessonChange(day, e)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Ders Seç</option>
            {relatedData?.lessons
              ?.filter((lesson: any) => lesson.grade === gradeFilter)
              .map((lesson: any) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </option>
              ))}
          </select>
        
          <select
            value={lessonData.teacher_id || ""}
            onChange={(e) => handleTeacherChange(day, e)}
            className="border px-2 py-1 rounded"
            disabled={!lessonData.lesson_id}
          >
            <option value="">Öğretmen Seç</option>
            {relatedData?.teachers
              ?.filter((teacher: any) => 
                teacher.subjects.some((subject: any) =>
                  subject.id === Number(subjectFilter)
                )
              )
              .map((teacher: any) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} {teacher.surname}
                </option>
              ))}
          </select>
          
          <TimeInput
            value={lessonData.start_time}
            onChange={(value) => handleTimeChange(day, 'start_time', value)}
            label="Başlangıç Saati"
            name="start_time"
          />
          
          <TimeInput
            value={lessonData.end_time}
            onChange={(value) => handleTimeChange(day, 'end_time', value)}
            label="Bitiş Saati"
            name="end_time"
          />
        </div>
        
        <p className="text-gray-500 font-sm text-sm">
          Derslerin gelmesi için önce sınıf seçmeniz gerekmektedir.
          <br />
          Lütfen saat ve dakika arasına &quot;:&quot; koyunuz. Şu şekilde: 14&#58;30
        </p>

        <button
          type="button"
          onClick={handleAddClick}
          className="bg-blue-500 text-white px-3 py-2 text-sm rounded"
        >
          Ders Ekle
        </button>

        <div>
          <h3 className="text-md font-sm mt-4">Eklenen Dersler:</h3>
          {lessonSchedules
            .filter((schedule) => schedule.day_of_week === day)
            .map((schedule, index) => (
              <div key={index} className="flex justify-between items-center border p-2 rounded my-2">
                <span>
                  {relatedData?.lessons?.find((l: any) => l.id === schedule.lesson_id)?.name} - {""}
                  {relatedData?.teachers?.find((t: any) => t.id === schedule.teacher_id)?.name} {relatedData?.teachers?.find((t: any) => t.id === schedule.teacher_id)?.surname}  / {""}
                  {formatViewTime(schedule.start_time)} - {formatViewTime(schedule.end_time)}
                </span>
                <div>
                <button
                  type="button"
                  onClick={() => handleRemoveLesson(day,index)}
                  className="text-red-500 px-2 py-1 rounded"
                >
                  Sil
                </button>
                </div>
               
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {type === "create" ? "Yeni Program Oluştur" : "Program Düzenle"}
        </h1>
        <Link href="/list/schedules" className="bg-gray-200 px-4 py-2 rounded-md">
          Geri Dön
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <input
              {...register("name")}
              placeholder="Takvim Adı"
              className="w-full p-2 border rounded-md"
            />
            {errors.name && <span className="text-red-500 text-sm">{String(errors.name.message)}</span>}

            <select
              {...register("class_id", {
                setValueAs: (value: string) => value ? Number(value) : undefined
              })}
              onChange={(e) => {
                const selectedClassId = Number(e.target.value);
                setValue("class_id", selectedClassId);
                const selectedClass = relatedData?.classes.find(
                  (cls: { id: number }) => cls.id === selectedClassId
                );
                setGradeFilter(selectedClass?.grade || "");
                console.log("Selected Class:", selectedClass);
              }}
              className="p-2 border rounded-md w-full"
            >
              <option value="">Sınıf Seç</option>
              {relatedData?.classes?.map((classItem: any) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.class_code}
                </option>
              ))}
            </select>
            {errors.class_id && <span className="text-red-500 text-sm">{String(errors.class_id.message)}</span>}
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className='underline'>Durum</label>
            <select
              {...register("status")}
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-2 border rounded-md w-full"
            >
              <option value="draft">Taslak</option>
              <option value="active">Aktif</option>
              <option value="archived">Arşiv</option>
            </select>
          </div>

          <div className="border rounded-md overflow-hidden">
            {days.map((day) => (
              <div key={day} className="border-b last:border-b-0">
                <button
                  type="button"
                  className="w-full text-left p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                  onClick={() => toggleDay(day)}
                >
                  <span className="font-medium">{day}</span>
                  <span>{openDays[day] ? '▲' : '▼'}</span>
                </button>
                {openDays[day] && <DaySchedule day={day} />}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-4">
            <Link 
              href="/list/schedules" 
              className="p-2 border rounded-md text-gray-500"
            >
              İptal
            </Link>
            <button 
              type="submit" 
              className="p-2 border rounded-md bg-blue-500 text-white"
            >
              {type === "create" ? "Takvim Oluştur" : "Takvimi Güncelle"}
            </button>
          </div>
          <WeeklySchedule 
          lessonSchedules={lessonSchedules}
          relatedData={relatedData}
          header={ type === "create" ? "Yeni Program" : "Program Düzenle"}
          />
        </form>
      </div>
    </div>
  );
};

export default SchedulePage;