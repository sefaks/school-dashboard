"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowBackIos } from "@mui/icons-material";
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import { AssignmentSchema, assignmentSchema } from "@/lib/formValidationSchemas";
import { addAssignment, getAssignment, teacherStudentsandClasses, teacherSubjects, updateAssignment } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import Image from "next/image";

import { useFormState } from 'react-dom';
import api from "@/lib/apiClient_new";

//cant resolve watch from fs


const CreateAssignmentPage = () => {
  const {
    register,
    handleSubmit,
    setValue, 
    watch, // bu "watch" fonksiyonudur, client-side'da çalışır
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
  });


interface FileWithBase64 {
    name: string;
    type: string;
    size: number;
    lastModified: number;
    base64: string;
  }

  const [relatedData, setRelatedData] = useState({
    classes: [],
    students: [],
    subjects: [],
  });


  const [selectedFiles, setSelectedFiles] = useState<FileWithBase64[]>([]);
  const classes = useState([]);
  const students = useState([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "create" as "create" | "update";
  const id = searchParams.get("id");

  const startDateValue = watch("start_date");
  const deadlineDateValue = watch("deadline_date");

  // state for loading and error handling
    const [error, setError] = useState(null);

  const { data: session } = useSession(); // Get the session (which includes the token)
  const router = useRouter();

 


  const [state, formAction] = useFormState(async (prevState: any, formData: string) => {
    try {
      console.log("Form Action Triggered"); // Form action'ın tetiklendiğini kontrol et
      const parsedData = JSON.parse(formData);
      const { token, selectedFiles, ...restData } = parsedData;

      let response = null;

      if (type === "create") {
        response = await addAssignment(restData, selectedFiles, token);
      } else if (type === "update") {
         response = await updateAssignment(restData, selectedFiles, token, parseInt(id ?? ""));
      }

      
      // Return the response data along with success status
      return { 
        success: true, 
        error: false,
        data: response 
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An error occurred",
        data: null
      };
    }
  }, {
    success: false,
    error: false,
    data: null,
  });

    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);

  

    useEffect(() => {
        const fetchData = async () => {
          try {
            const classesAndStudentsResponse = await api.get("/teachers/me/classes-students")

            console.log("Classes and Students Response:", classesAndStudentsResponse);
            
            const teacherSubjectsResponse =await  api.get("/teachers/me/subjects")

            console.log("Teacher Subjects Response:", teacherSubjectsResponse);
      
            // Tüm data yüklendikten sonra state'i güncelle
            const classesAndStudentsResponseData =  classesAndStudentsResponse;
            const teacherSubjectsResponseData =  teacherSubjectsResponse;

            setRelatedData({
              classes: classesAndStudentsResponseData.data.classes,
              students: classesAndStudentsResponseData.data.students,
              subjects: teacherSubjectsResponseData.data
            });
      
            // Update case için assignment detaylarını çek
            if (type === 'update' && id) {
                try {
                  const assignmentResponse = await api.get(`/assignments/${id}`)
                  const assignmentData = assignmentResponse.data;
                  // Tüm assignment data'sını logla
                  console.log("Full Assignment Response:", assignmentResponse);
                  console.log("Full Assignment Data:", assignmentData);
              
                  // Specific kontrolller
                  console.log("Raw Classes:", assignmentData.classes);
                  console.log("Raw Students:", assignmentData.students);
              
                  // Form alanlarını doldur
                  setValue("start_date", assignmentData.start_date);
                  setValue("deadline_date", assignmentData.deadline_date);
                  setValue("header", assignmentData.title);
                  setValue("description", assignmentData.description);
                  setValue("subject_id", assignmentData.subject_id);
              
                  // Seçili sınıfları ve öğrencileri ayarla
                  const classIds = assignmentData.classes 
                    ? Array.isArray(assignmentData.classes) 
                      ? assignmentData.classes.map((ac: any) => ac.id) 
                      : []
                    : [];
              
                  const studentIds = assignmentData.students
                    ? Array.isArray(assignmentData.students)
                      ? assignmentData.students.map((as: any) => as.id)
                      : []
                    : [];
              
                  console.log("Extracted Class IDs:", classIds);
                  console.log("Extracted Student IDs:", studentIds);
              
                  setSelectedClasses(classIds);
                  setSelectedStudents(studentIds);

                  // Eğer assignmentData varsa, selected files'i set et
                  if (assignmentData.documents) {
                    const files = assignmentData.documents.map((doc: any) => ({
                      name: doc.name,
                      type: doc.file_type,
                      size: doc.file_size,
                      lastModified: doc.created_at,
                      base64: doc.file_url,
                    }));
                    setSelectedFiles(files);
                  }
              
                } catch (error) {
                  console.error("Error fetching assignment details:", error);
                }
              }
          } catch (error) {
            setError(error as any);
          } finally {
            setIsLoading(false);
          }
        };
      
        fetchData();
      }, [type, id]);
      
      // Render kısmında loading state'ini kontrol et

        const isValid = Object.keys(errors).length === 0;

      console.log("Is Form Valid?", isValid);
      // if not isValid, console.log the errors
      if (!isValid) {
        console.log("Errors:", errors);
      }

    // Ayrı bir useEffect ile relatedData'yı izle
    useEffect(() => {
        console.log("Updated Related Data:", relatedData);
        console.log("Selected Classes:", selectedClasses);
        console.log("Selected Students:", selectedStudents);
    }, [relatedData]);

    // eğer assignmentData varsa, selected files'i set et
    
 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setValue(e.target.name, e.target.value);
        }

    const fileToBase64 = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            });
        };


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
        const newFiles = await Promise.all(
            Array.from(event.target.files).map(async (file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            base64: await fileToBase64(file)
            }))
        );
        setSelectedFiles(newFiles);
        }
        event.target.value = '';
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prevFiles => {
        const newFiles = [...prevFiles];
        newFiles.splice(index, 1);
        return newFiles;
        });

        setDocuments(prevDocs => {
        const newDocs = [...prevDocs];
        newDocs.splice(index, 1);
        return newDocs;
        });
    };


  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: "start_date" | "deadline_date") => {
    setValue(field, e.target.value);
  };



  const onSubmit = async (data: AssignmentSchema) => {
    if (!session?.user.accessToken) {
      toast.error("No authentication token found");
      return;
    }

    // set values to data
    data.class_ids = selectedClasses;
    data.student_ids = selectedStudents;
  
    try {
        const result = type === "create" ? await addAssignment(data, selectedFiles, session.user.accessToken) : 
                                      await updateAssignment( data, selectedFiles, session.user.accessToken, parseInt(id || "0"));
        
        // for response use toast
        // if type is create, use created, else use updated
        if (type === "create") {
          toast.success(currentLanguageContent.homework_created_successfully);
        } else {
          toast.success(currentLanguageContent.homework_updated_successfully);
        }

        console.log("Assignment created successfully:", result);
    } catch (err) {
      toast.error("Error creating assignment");
      console.log("Error creating assignment:", err);
    }
  };

  const handleStudentSelect = (studentId: number) => {
    // Prevent adding duplicates
    if (!selectedStudents.includes(studentId)) {
      setSelectedStudents((prev) => [...prev, studentId]);
    }
  };

  const handleStudentRemove = (studentId: number) => {
    setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
  };

  
  const handleClassSelect = (classId: number) => {
    // Prevent adding duplicates
    if (!selectedClasses.includes(classId)) {
      setSelectedClasses((prev) => [...prev, classId]);
    }
  };

  const handleClassRemove = (classId: number) => {
    setSelectedClasses((prev) => prev.filter((id) => id !== classId));
  };

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);
    }
  }, []);

  const currentLanguageContent = language === "en" ? en : tr;


  
  
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="flex flex-row gap-2 p-4 border-b items-center">
          <button
            onClick={() => router.back()}
            className="bg-white border p-2 rounded-[10px] hover:bg-gray-300"
          >
            <ArrowBackIos className="ml-1" fontSize="small" />
          </button>
          <p className="font-semibold text-[24px] leading-[29px] text-textColor">
            {currentLanguageContent.homeworks}
          </p>
        </div>
  
        {/* Main Content - Made responsive with flex-col on mobile */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

        <div className="flex flex-col lg:flex-row p-4 lg:p-6 gap-6">
            
          {/* Left Section - Full width on mobile */}
          <div className="w-full lg:w-1/2 lg:mr-4">
            <h1 className="text-xl font-semibold mb-6">
              {currentLanguageContent.create_homework}
            </h1>
            
              {/* Date Range Row - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguageContent.start_date}
                  </label>
                <input
                    type="datetime-local"
                    className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    {...register("start_date")}
                    onChange={(e) => handleDateChange(e, "start_date")}
                />
                   {startDateValue && (
                            <p className="text-sm text-green-600">
                            {new Date(startDateValue).toLocaleString('tr-TR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false, // 24 saat formatında göstermek için
                            })}
                            </p>
                        )}
                          {errors.start_date && (
            <p className="text-sm text-red-600">{errors.start_date.message}</p>
          )}
                </div>
              
                <div className="w-full sm:flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguageContent.end_date}
                  </label>
                  <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        {...register("deadline_date")}
                        onChange={(e) => handleDateChange(e, "deadline_date")}
                        />

                   {deadlineDateValue && (
                        <p className="text-sm text-green-600">
                        {new Date(deadlineDateValue).toLocaleString('tr-TR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false, // 24 saat formatında göstermek için
                        })}
                        </p>
                    )}
                     {errors.deadline_date && (
            <p className="text-sm text-red-600">{errors.deadline_date.message}</p>
          )}
                </div>
              </div>
  
              {/* Title and Course Selection Row - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-4 mt-3">
                <div className="w-full sm:flex-1 ">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguageContent.header}
                  </label>
                  <input
                  placeholder="6. Hafta Ödevi"
                    type="text"
                    {...register("header")}
                    className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleChange}
                  />
                </div>
                <div className="w-full sm:flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguageContent.lesson_selection}
                  </label>
                <select
                    {...register("subject_id", { valueAsNumber: true })}
                    className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleChange}
                >
                    {relatedData.subjects.map((subject: { id: number, subject_name: string }) => (
                        <option key={subject.id} value={subject.id}>
                            {subject.subject_name}
                        </option>
                    ))}
                </select>
                </div>
              </div>
  
              {/* Description Row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentLanguageContent.description}
                </label>
                <textarea
                {...register("description")}
                rows={4}
                  className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={handleChange}
                />
              </div>
  
              {/* File Upload Section */}
              <div className="flex items-center gap-4 border p-4 rounded-md border-dashed focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="file"
                  className="w-full cursor-pointer text-sm text-gray-700"
                  multiple
                  onChange={handleFileChange}
                />
                <span className="text-gray-500 hidden sm:inline">{currentLanguageContent.drop_or_select}</span>

               
              </div>
              {selectedFiles.length > 0 && (
                        <div className="mt-4">
                            <h2 className="text-md font-semibold">Yüklenen Dokümanlar:</h2>
                            <ul className="list-disc ">
                            {selectedFiles.map((file, index) => (
                                console.log("File:", file),
                                <li key={index} className="flex flex-row gap-1 items-center text-sm">
                                  <div className="flex w-full mt-1 justify-between items-center" >

                                      <div className="flex flex-row gap-2 items-center">
                                          <Image
                                          src="/icons/pdf.svg"
                                          alt="pdf icon"
                                          width={24}
                                          height={24}
                                      />
                                      <span>{file.name}</span>
                                      </div >

                                      <div className="flex items-center">
                                      <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Kaldır
                                </button>
                                      </div>
                                     
                                </div>

                               
                                
                                </li>
                            ))}
                            </ul>
                        </div>
                        )}
  
            
          </div>
  
          {/* Right Section - Full width on mobile */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Class Selection */}
            <div className="w-full bg-white p-4 rounded-lg shadow-sm">
             <label className="block mb-2 text-sm font-medium">{currentLanguageContent.lesson_selection}</label>
                <select
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  multiple
                  {...register("class_ids")}
                  value={selectedClasses.map(String)}
                  onChange={(e) => handleClassSelect(parseInt(e.target.value))}
                >
                  {relatedData?.classes?.map((classItem: any) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.class_code}
                    </option>
                  ))}
                </select>
                {errors.class_ids && (
                    <span className="text-red-500 text-sm">{errors.class_ids.message}</span>
                )}
  
              {/* Selected Classes */}
              <div className="mt-2">
                <h3 className="font-medium text-green-600">{currentLanguageContent.selected_classes}:</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedClasses.map((classId) => {
                    const cls = relatedData?.classes?.find((c: any) => c.id === classId);
                    return (
                      cls && (
                        <span key={classId} className="flex items-center gap-2 p-1 bg-blue-200 rounded-md">
                          {(cls as any).class_code}
                          <button
                            type="button"
                            onClick={() => handleClassRemove(classId)}
                            className="text-red-500"
                          >
                            X
                          </button>
                        </span>
                      )
                    );
                  })}
                </div>
              </div>
            </div>

            {/* notice for teachers */}
            <div className="w-full bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">
                {currentLanguageContent.notice_for_teachers}
              </p>
            </div>
  
            {/* Student Selection */}
            <div className="w-full bg-white p-4 rounded-lg shadow-sm">
            {!isLoading && relatedData.students && (
                            <>
                                <label className="block mb-2 text-sm font-medium">Öğrenci Seçimi</label>
                                <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                multiple
                                {...register("student_ids")}
                                value={selectedStudents.map(String)}
                                onChange={(e) => {
                                    const selectedId = parseInt((e.target as HTMLSelectElement).value);
                                    handleStudentSelect(selectedId);
                                }}
                                >
                                {relatedData.students.map((student:any) => (
                                    <option key={student.id} value={student.id}>
                                    {`${student.name} ${student.surname}`}
                                    </option>
                                ))}
                                </select>
                                {errors.student_ids && (
                                <span className="text-red-500 text-sm">{errors.student_ids.message}</span>
                                )}

                                {/* Selected Students */}
                                <div className="mt-2">
                                <h3 className="font-medium text-green-600">
                                    {currentLanguageContent.selected_students}:
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {selectedStudents.map((studentId) => {
                                    const student = relatedData.students?.find(
                                        (s: any) => s.id === studentId
                                    );
                                    return (
                                        student && (
                                        <span 
                                          key={studentId} 
                                          className="flex items-center gap-2 p-1 bg-blue-200 rounded-md"
                                        >
                                          {(student as any).name} {(student as any).surname}
                                          <button
                                          type="button"
                                          onClick={() => handleStudentRemove(studentId)}
                                          className="text-red-500"
                                          >
                                          X
                                          </button>
                                        </span>
                                        )
                                    );
                                    })}
                                </div>
                                </div>
                            </>
                            )}

                            {isLoading && (
                            <div>Yükleniyor...</div>
                            )}
            </div>
            <div className="flex justify-end">
            <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md disabled:opacity-50 mt-4 transition-colors"
                >
                    {type === "create" ? currentLanguageContent.create : currentLanguageContent.update}
                </button>
              </div>
          </div>
          
        </div>
        </form> 

      </div>
    )
  }


  
  export default CreateAssignmentPage;


