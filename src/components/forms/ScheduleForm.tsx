import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {  DayOfWeek, ScheduleCreateSchema, scheduleCreateSchema } from '@/lib/formValidationSchemas';
import { toast } from 'react-toastify';
import { z } from 'zod';
import TimePicker from "react-time-picker";
import { createSchedule, updateClass } from '@/lib/actions';
import { useSession } from 'next-auth/react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import ReactDOM from 'react-dom';
import TimeInput from '../TimeInput';
const ScheduleForm = ({
    type,
    data,
    setOpen,
    relatedData,
  }: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
  }) => {
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
        lesson_schedules: [],  // Ensure this is initialized as an empty array
      },
        });

    const { data: session } = useSession(); // Get the session (which includes the token)
    const router = useRouter();
    const watchedClassId = watch('class_id');
    const watchedLessonId = watch('lesson_id');

    console.log("Form errors:", errors);
  
    const [gradeFilter, setGradeFilter] = useState<number | string>(""); // Grade filtresi durumu
    const [subjectFilter,setSubjectFilter] = useState<number | string>(""); // Subject filtresi durumu
    const [selectedLessons, setSelectedLessons] = useState<Record<string, {
      lesson_id: number;
      teacher_id: number;
      start_time: string;
      end_time: string;
      day_of_week: DayOfWeek;
    }>>({});

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
    

    const [formData, setFormData] = useState(data || {});
    const [lessonSchedules, setLessonSchedules] = useState<Array<{
        lesson_id: number;
        teacher_id: number;
        day_of_week: string;
        start_time: string;
        end_time: string;
      }>>([]);
      
      
    const [openDays, setOpenDays] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<string>("DRAFT");
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
   
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
          toast.success('Program başarıyla oluşturuldu');
        } else if (type === "update") {
          response = await updateClass(finalData, session?.user.accessToken || "", data.id);
          toast.success('Program başarıyla güncellendi');
        }
    
        // Kısa bir gecikme sonrası sayfayı yenile
        setTimeout(() => {
          router.refresh();
        }, 1000);
    
        return {
          success: true,
          error: false,
          data: response
        };
      } catch (error: any) {
        console.error("Form Action Error:", error.message);
        toast.error(error.message || "Bir hata oluştu");
        
        return {
          success: false,
          error: error.message || "Bir hata oluştu.",
          data: null
        };
      }
    }, {
      success: false,
      error: false,
      data: null,
    });


      const handleAddLesson = useCallback((lessonData: { lesson_id: number; teacher_id: number; day_of_week: string; start_time: string; end_time: string; }) => {
        setLessonSchedules((prev) => [
          ...prev,
          lessonData,
        ]);
      }, []);
      
    const handleRemoveLesson = (index: number) => {
        setLessonSchedules(prev => prev.filter((_, i) => i !== index));
      };
      

    console.log("Lesson Schedules:", lessonSchedules);
  
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
          ReactDOM.flushSync(() => {
            setSelectedLessons(prev => ({
              ...prev,
              [day]: {
                ...prev[day],
                lesson_id: selectedLessonId,
                day_of_week: day as DayOfWeek
              }
            }));
            setSubjectFilter(selectedLesson.subject_id || "");
          });
        }
      }, [relatedData?.lessons]);
      const handleTimeChange = useCallback((day: string, field: 'start_time' | 'end_time', value: string) => {
        const otherField = field === "start_time" ? "end_time" : "start_time";
        const otherTime = selectedLessons[day]?.[otherField];
      
        if (otherTime) {
          const [hour, minute] = value.split(":").map(Number);
          const [otherHour, otherMinute] = otherTime.split(":").map(Number);
          const isInvalid =
            (field === "start_time" && hour * 60 + minute >= otherHour * 60 + otherMinute) ||
            (field === "end_time" && hour * 60 + minute <= otherHour * 60 + otherMinute);
      
          if (isInvalid) {
            toast.error("Başlangıç saati bitiş saatinden önce olmalıdır.");
            return;
          }
        }
      
        setSelectedLessons(prev => ({
          ...prev,
          [day]: {
            ...prev[day],
            [field]: value,
          },
        }));
      }, [selectedLessons]);

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
      
            handleAddLesson(lessonData);
            
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
      
    
      return (
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-4 gap-4">
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
          teacher.teacher_subject.some((subjectRelation: any) =>
            subjectRelation.subjects.id === Number(subjectFilter)
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
            Lütfen saat ve dakika arasına ":" koyunuz. Şu şekilde: 14:30
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
  .filter((schedule) => schedule.day_of_week === day) // `day_of_week` üzerinden filtreleme
  .map((schedule, index) => (
    <div key={index} className="flex justify-between items-center border p-2 rounded my-2">
      <span>
        {relatedData?.lessons?.find((l: any) => l.id === schedule.lesson_id)?.name} -{" "}
        {relatedData?.teachers?.find((t: any) => t.id === schedule.teacher_id)?.name} -{" "}
        {schedule.start_time} - {schedule.end_time}
      </span>
      <button
        type="button"
        onClick={() => handleRemoveLesson(index)}  // lessonSchedules array'ı üzerinden index kullanarak silme
        className="text-red-500 px-2 py-1 rounded"
      >
        Sil
      </button>
          </div>
        ))}
      </div>
    </div>
  );
};
  
return (
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

      <div className="space-y-4">
        <label htmlFor="status">Durum</label>
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

      <div>
            {days.map((day) => (
                <div key={day} className="space-y-4">
                <button
                    type="button"
                    className="w-full text-left p-4 border-b"
                    onClick={() => toggleDay(day)}
                >
                    {day}
                </button>
                {openDays[day] && <DaySchedule day={day} />}
                </div>
            ))}
            </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-2 border rounded-md text-gray-500"
        >
          İptal
        </button>
        <button type="submit" className="p-2 border rounded-md bg-blue-500 text-white">
            {type === "create" ? "Takvim Oluştur" : "Takvimi Güncelle"}
            </button>

      </div>
    </form>
  );
};

export default ScheduleForm;