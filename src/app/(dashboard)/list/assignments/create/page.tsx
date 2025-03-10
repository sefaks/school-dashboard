"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowBackIos } from "@mui/icons-material";
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";
import { AssignmentSchema, assignmentSchema } from "@/lib/formValidationSchemas";
import { addAssignment, getAssignment, getUnitsForSubjectAndGrade, teacherStudentsandClasses, teacherSubjects, updateAssignment } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import Image from "next/image";
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects'; // Ampul (fikir) ikonu

import { useFormState } from 'react-dom';
import api from "@/lib/apiClient_new";
import AIHomeworkIdeaModal from "@/components/AssignmentPage/AIHomeworkIdeaModal";

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
    publishes: [],
    units: [],
  });


  const [selectedFiles, setSelectedFiles] = useState<FileWithBase64[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "create" as "create" | "update";
  const id = searchParams.get("id");

  const [grade, setGrade] = useState(null); // Sınıf seviyesi için state
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const startDateValue = watch("start_date");
  const deadlineDateValue = watch("deadline_date");
  const [selectedPublishId, setSelectedPublishId] = useState<number | null>(null);

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
    const [selectedTests, setSelectedTests] = useState<number[]>([]);


    useEffect(() => {
        const fetchData = async () => {
          try {
            const classesAndStudentsResponse = await api.get("/teachers/me/classes-students")

            console.log("Classes and Students Response:", classesAndStudentsResponse);
            
            const teacherSubjectsResponse =await  api.get("/teachers/me/subjects")

            console.log("Teacher Subjects Response:", teacherSubjectsResponse);

            const teacherPublishesResponse = await api.get("/teachers/me/publishes")

            console.log("Teacher Publishes Response:", teacherPublishesResponse);

      
            // Tüm data yüklendikten sonra state'i güncelle
            const classesAndStudentsResponseData =  classesAndStudentsResponse;
            const teacherSubjectsResponseData =  teacherSubjectsResponse;
            const teacherPublishesResponseData = teacherPublishesResponse;

            setRelatedData({
              classes: classesAndStudentsResponseData.data.classes,
              students: classesAndStudentsResponseData.data.students,
              subjects: teacherSubjectsResponseData.data,
              publishes: teacherPublishesResponseData.data
            });
      
            // Update case için assignment detaylarını çek
            if (id) {
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
                  setValue("header", assignmentData.header);
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

                  const testIds = assignmentData.tests
                    ? Array.isArray(assignmentData.tests)
                      ? assignmentData.tests.map((at: any) => at.id)
                      : []
                    : [];

                    //set selectedPublishId is first test publisher id
                  setSelectedPublishId(assignmentData.tests[0].publisher_id);
              
                  console.log("Extracted Class IDs:", classIds);
                  console.log("Extracted Student IDs:", studentIds);
              
                  setSelectedClasses(classIds);
                  setSelectedStudents(studentIds);
                  setSelectedTests(testIds);

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

          // 1 saniye sonra sayfayı yenile
          setTimeout(() => {
            window.location.reload();
          },1000);


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

  const handleTestSelect = (testId: number) => {
    // Prevent adding duplicates
    if (!selectedTests.includes(testId)) {
      setSelectedTests((prev) => [...prev, testId]);
    }
  }

  const handleTestRemove = (testId: number) => {
    setSelectedTests((prev) => prev.filter((id) => id !== testId));
  }

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);
    }
  }, []);

  const currentLanguageContent = language === "en" ? en : tr;



  const fetchUnitsForSubjectAndGrade = async (subjectId, grade) => {
    try {
      if (!subjectId || !grade) {
        console.log('Subject ID or grade is missing', { subjectId, grade });
        return;
      }
      
      console.log('Fetching units for:', { subjectId, grade });
      
      const unitsData = await getUnitsForSubjectAndGrade(
        subjectId, 
        grade, 
        session?.user.accessToken
      );
      
      // API'den gelen veriyi kontrol et
      const units = Array.isArray(unitsData) ? unitsData : [];
      console.log('Units data received:', units);
      
      setRelatedData(prev => ({
        ...prev,
        units: units
      }));
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error('Üniteler alınırken bir hata oluştu');
      // Hata durumunda boş dizi ata
      setRelatedData(prev => ({
        ...prev,
        units: []
      }));
    }
  };

  // Konu veya sınıf seviyesi değiştiğinde üniteleri getir
  useEffect(() => {
    const subjectId = watch("subject_id");
    console.log('Subject ID or grade changed:', { subjectId, grade });
    
    if (subjectId && grade) {
      console.log('Calling fetchUnitsForSubjectAndGrade');
      fetchUnitsForSubjectAndGrade(subjectId, grade);
    } else {
      // Eğer eksik parametreler varsa units'i boş bir dizi olarak ayarla
      setRelatedData(prev => ({
        ...prev,
        units: []
      }));
    }
  }, [watch("subject_id"), grade]);


  

  // Yapay zeka modalını açan fonksiyon
  const handleOpenAIModal = () => {
    console.log('Opening AI modal with unit ID:', selectedUnitId);
    
    if (!selectedUnitId) {
      toast.error('Lütfen önce bir ünite seçin');
      return;
    }
    
    if (!session?.user.accessToken) {
      toast.error('Oturum bilginiz eksik. Lütfen tekrar giriş yapın.');
      return;
    }
    
    setIsAIModalOpen(true);
  };

  // AI'dan gelen fikri forma uygulayan fonksiyon


  const aiLanguageContent = language === "en" ? {
    ai_homework_idea: "Get AI Homework Idea",
    select_unit: "Select Unit",
    select_grade: "Select Grade",
    ai_idea_applied: "AI idea applied to the form!",
    ai_feature: "AI Feature",
    ai_help_text: "Get creative homework ideas with AI",
    additional_requirements: "Additional Requirements (Optional)"
  } : {
    ai_homework_idea: "Arf ile Ödev Fikri Al",
    select_unit: "Ünite Seçin",
    select_grade: "Sınıf Seviyesi Seçin",
    ai_idea_applied: "Arf fikri forma uygulandı!",
    ai_feature: "ARF ile İnovatif Ödev Fikri Üretme",
    ai_help_text: "Arf ile yaratıcı ödev fikirleri alın",
    additional_requirements: "Ek İstekler (İsteğe Bağlı)"
  };

  const applyAIHomeworkIdea = (idea) => {
    if (idea) {
      // Başlık için öncelikle title değerini kullan
      setValue("header", idea.title || "");
      
      // Yapılandırılmış verileri kullanarak formatlı bir açıklama oluştur
      let formattedDescription = `# ${idea.title || ""}\n\n`;
      
      if (idea.summary) formattedDescription += `**Özet:** ${idea.summary}\n\n`;
      if (idea.purpose) formattedDescription += `**Amaç:** ${idea.purpose}\n\n`;
      
      if (idea.steps && idea.steps.length > 0) {
        formattedDescription += `**Uygulama Adımları:**\n`;
        idea.steps.forEach((step, index) => {
          formattedDescription += `${index + 1}. ${step}\n`;
        });
        formattedDescription += '\n';
      }
      
      if (idea.evaluation_criteria && idea.evaluation_criteria.length > 0) {
        formattedDescription += `**Değerlendirme Kriterleri:**\n`;
        idea.evaluation_criteria.forEach(criterion => {
          formattedDescription += `- ${criterion}\n`;
        });
      }
      
      // Eğer yapılandırılmış veri eksikse ve content varsa, onu kullan
      if ((!idea.summary || !idea.steps || idea.steps.length === 0) && idea.content) {
        console.log("Fallback içeriği kullanılıyor", idea.content);
        formattedDescription = idea.content;
      }
      
      setValue("description", formattedDescription);
      toast.success(aiLanguageContent.ai_idea_applied);
    }
  };


  
  
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

        <AIHomeworkIdeaModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        unitId={selectedUnitId}
        additionalRequirements={additionalRequirements}
        token={session?.user.accessToken}
        onApplyIdea={applyAIHomeworkIdea}
        language={language}
      />

  
        {/* Main Content - Made responsive with flex-col on mobile */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

        <div className="flex flex-col lg:flex-col p-4 lg:p-6 gap-6">
          <div className="flex flex-row">

            
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
                
                
          {/* Publish and Test Selection Row - Stack on mobile */}
          <div className="w-full bg-white p-4 rounded-lg shadow-sm mt-3">
          <label className="block mb-2 text-sm font-medium">{currentLanguageContent.publish_and_tests_selection}</label>
            <div className="flex flex-col sm:flex-row gap-4 mt-3">
              <div className="w-full sm:flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {currentLanguageContent.publish_selection || "Yayın Seçimi"}
                  </label>
                  <select
                    className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedPublishId || ""}
                    onChange={(e) => {
                      const publishId = e.target.value ? parseInt(e.target.value) : null;
                      setSelectedPublishId(publishId);
                      setSelectedTests([]); // Publish değişince seçili testleri sıfırla
                    }}
                  >
                    <option value="">Yayın Seçiniz</option>
                    {relatedData.publishes
                      .filter((publish: any) => publish.subject_id === watch("subject_id"))
                      .map((publish: { id: number, publisher: string }) => (
                        <option key={publish.id} value={publish.id}>
                          {publish.publisher} - {publish.curriculum_year} / {publish.grade === 0 ? "Hazırlık" : publish.grade}. Sınıf
                        </option>
                      ))}
                  </select>
                </div>

                {/* Çoklu test seçimi */}
               
              </div>

              {selectedPublishId && (
                <div className="flex flex-col sm:flex-row gap-4 mt-3">

                  <div className="w-full sm:flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {currentLanguageContent.test_selection || "Test Seçimi (Birden fazla seçilebilir)"}
                    </label>
                    <select
                      multiple
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      {...register("test_ids")}
                      value={selectedTests.map(String)}
                      onChange={(e) => handleTestSelect(parseInt(e.target.value))}
                    >
                      {relatedData.publishes
                        .find((publish: any) => publish.id === selectedPublishId)
                        ?.tests?.map((test: { id: number, name: string }) => (
                          <option key={test.id} value={test.id}>
                            {test.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  </div>
                )}

            <div className="mt-3 mb-2">
                <h3 className="font-sm text-green-600">{currentLanguageContent.selected_tests}:</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedTests.map((id) => {
                    const test = relatedData.publishes
                      .find((publish: any) => publish.id === selectedPublishId)
                      ?.tests?.find((test: any) => test.id === id);
                    return (
                      test && (
                        <span key={id} className="flex items-center gap-2 p-1 bg-blue-200 rounded-md">
                          {(test as any).name}
                          <button
                            type="button"
                            onClick={() => handleTestRemove(id)}
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

              {/* Description Row */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-2 ">
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
              <div className="flex flex-col gap-2 mt-3">
                <label className="block text-sm font-medium text-gray-700">
                  {currentLanguageContent.document_selection}
                </label>
                
                <div className="flex items-center gap-4 border p-4 rounded-md border-dashed focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    type="file"
                    className="w-full cursor-pointer text-sm text-gray-700"
                    multiple
                    onChange={handleFileChange}
                  />
                  <span className="text-gray-500 hidden sm:inline">
                    {currentLanguageContent.drop_or_select}
                  </span>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <h2 className="text-sm font-semibold text-red-600">{currentLanguageContent.uploaded_documents}</h2>
                    <ul className="list-disc mt-2">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="flex flex-row gap-1 items-center text-sm">
                          <div className="flex w-full mt-1 justify-between items-center">
                            <div className="flex flex-row gap-2 items-center">
                              <Image
                                src="/icons/pdf.svg"
                                alt="pdf icon"
                                width={24}
                                height={24}
                              />
                              <span>{file.name}</span>
                            </div>
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
                <h3 className="font-sm text-green-600">{currentLanguageContent.selected_classes}:</h3>
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
              ❗{currentLanguageContent.notice_for_teachers}
              </p>
            </div>
  
            {/* Student Selection */}
            <div className="w-full bg-white p-4 rounded-lg shadow-sm">
            {!isLoading && relatedData.students && (
                            <>
                                <label className="block mb-2 text-sm font-medium">{currentLanguageContent.student_selection}</label>
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
                                <h3 className="font-sm text-green-600">
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


          {/* AI section */}
          <div className="w-full bg-white p-4 rounded-lg shadow-sm mt-3 border-2 border-purple-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-purple-700 flex items-center">
                  <EmojiObjectsIcon className="mr-1 text-yellow-500" />
                  {aiLanguageContent.ai_feature}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{aiLanguageContent.ai_help_text}</p>
              
              <div className="flex flex-col gap-4">
                {/* Sınıf Seviyesi Seçimi */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {aiLanguageContent.select_grade}
                  </label>
                  <select
                    className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setGrade(parseInt(e.target.value))}
                    value={grade || ""}
                  >
                    <option value="">Sınıf Seviyesi Seçin</option>
                    <option value="0">Hazırlık</option>
                    <option value="1">1. Sınıf</option>
                    <option value="2">2. Sınıf</option>
                    <option value="3">3. Sınıf</option>
                    <option value="4">4. Sınıf</option>
                    <option value="5">5. Sınıf</option>
                    <option value="6">6. Sınıf</option>
                    <option value="7">7. Sınıf</option>
                    <option value="8">8. Sınıf</option>
                    <option value="9">9. Sınıf</option>
                    <option value="10">10. Sınıf</option>
                    <option value="11">11. Sınıf</option>
                    <option value="12">12. Sınıf</option>
                  </select>
                </div>
                
                {/* Ünite Seçimi */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {aiLanguageContent.select_unit}
                  </label>
                  <select
                    className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setSelectedUnitId(parseInt(e.target.value))}
                    value={selectedUnitId || ""}
                    disabled={!relatedData.units || relatedData.units.length === 0}
                  >
                    <option value="">Ünite Seçiniz</option>
                    {Array.isArray(relatedData.units) && relatedData.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                
                {/* Ekstra İstek Alanı */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {aiLanguageContent.additional_requirements}
                  </label>
                  <textarea
                    className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={language === "en" ? "e.g., Include group work, focus on creative writing..." : "örn. Grup çalışması içersin, yaratıcı yazma odaklı olsun..."}
                    rows={2}
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                  />
                </div>
                
                <div className="self-end">
                  <button
                    type="button"
                    onClick={handleOpenAIModal}
                    disabled={!selectedUnitId}
                    className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-md disabled:opacity-50 transition-colors flex items-center"
                  >
                    <EmojiObjectsIcon className="mr-1" fontSize="small" />
                    {aiLanguageContent.ai_homework_idea}
                  </button>
                </div>
              </div>
            </div>
          
          
        </div>
        </form> 

      </div>
    )
  }


  
  export default CreateAssignmentPage;


