import React, { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AssignmentSchema, assignmentSchema } from '@/lib/formValidationSchemas';
import { addAssignment, updateAssignment } from '@/lib/actions';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import InputField from '../InputField';
import { useSession } from 'next-auth/react';
import { useFormState } from 'react-dom';
import { Trash2, Upload, File } from 'lucide-react';



const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;  // 'classes' and 'students' will be passed in this prop
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }, // we define errors in formState, because we will use it for validation
    setValue, 
    getValues,
    watch
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: data,
  });

  const router = useRouter();
  const { data: session } = useSession(); // Get the session (which includes the token)

  const [state, formAction] = useFormState(async (prevState: any, formData: string) => {
    try {
      console.log("Form Action Triggered"); // Form action'ın tetiklendiğini kontrol et

      const parsedData = JSON.parse(formData);
      const response = type === "create"
        ? await addAssignment(parsedData, parsedData.token)
        : await updateAssignment(parsedData, parsedData.token);
      
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

  const [selectedStudents, setSelectedStudents] = useState<number[]>(data?.student_ids || []);
  const [selectedClasses, setSelectedClasses] = useState<number[]>(data?.class_ids || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<any[]>(data?.documents || []);

  

  // Handle student selection and removal
  const handleStudentSelect = (studentId: number) => {
    // Prevent adding duplicates
    if (!selectedStudents.includes(studentId)) {
      setSelectedStudents((prev) => [...prev, studentId]);
    }
  };

  const handleStudentRemove = (studentId: number) => {
    setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
  };

  // Handle class selection and removal
  const handleClassSelect = (classId: number) => {
    // Prevent adding duplicates
    if (!selectedClasses.includes(classId)) {
      setSelectedClasses((prev) => [...prev, classId]);
    }
  };

  const handleClassRemove = (classId: number) => {
    setSelectedClasses((prev) => prev.filter((id) => id !== classId));
  };

  const handleUploadDocument = async (file: File) => {
    const documentName = file.name;
    const uploadedAt = new Date().toISOString();
    const url = URL.createObjectURL(file); // Mock URL for demo purposes (Replace with actual URL after uploading)
    const content = await convertFileToBase64(file);

    const newDocument = {
      name: documentName,
      content: content,
      uploaded_at: uploadedAt,
      url: url,

    };
  
    setDocuments((prevDocuments) => [...prevDocuments, newDocument]);
    setSelectedFiles((prevFiles) => prevFiles.filter((f) => f !== file)); // Remove file from selected files
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file); // File'ı Base64 formatında okur
    });
  };
  

  // Remove document from the list
  const handleRemoveDocument = (index: number) => {
    setDocuments((prevDocuments) => prevDocuments.filter((_, i) => i !== index));
  };



   // Use useEffect to handle state changes
   React.useEffect(() => {
    if (state.success) {
      toast.success(type === "create" ? "Assignment added successfully!" : "Assignment updated successfully!");
      // wait for 2 seconds
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 2000);
     
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, type, setOpen, router]);



  const onSubmit = async (data: AssignmentSchema) => {

    console.log(errors);

    if (!session?.user.accessToken) {
        toast.error("No authentication token found");
        return;
      }

    const fullFormData = {
      ...data,  // Contains the form data (start_date, deadline_date, etc.)
      token: session?.user.accessToken,  // Add the token to the data
      student_ids: selectedStudents,    // Include the selected students
      class_ids: selectedClasses,       // Include the selected classes
      documents: documents.length > 0 ? documents : undefined // undefined olarak gönderirsek optional alan boş geçilebilir
    };

    formAction(JSON.stringify(fullFormData));

    console.log("Full Form Data:", fullFormData);

  };


  const classes = relatedData?.classes || [];
  const subjects = relatedData?.subjects || [];
  const students = relatedData?.students || [];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
  
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  
      // Her bir dosyayı Base64 formatına dönüştürüp ekliyoruz
      for (const file of newFiles) {
        try {
          const content = await convertFileToBase64(file);
  
          // 'data:application/pdf;base64,' kısmını çıkar
          const base64Data = content.split(",")[1];  // Verinin geri kalan kısmı
  
          const newDocument = {
            name: file.name,
            content: base64Data,  // Base64 string'i veritabanına bu şekilde göndereceğiz
            uploaded_at: new Date().toISOString(),
            url: URL.createObjectURL(file),
          };
  
          setDocuments(prevDocs => [...prevDocs, newDocument]);
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error(`Failed to process file: ${file.name}`);
        }
      }
    }
    // Reset the input
    event.target.value = '';
  };
  
  // Dosya kaldırma
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


  const isValid = Object.keys(errors).length === 0;

  console.log("Is Form Valid?", isValid);
  // if not isValid, console.log the errors
  if (!isValid) {
    console.log("Errors:", errors);
  }
 
  return (
    <form className="flex flex-col gap-8 max-h-screen overflow-y-auto p-4" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">Add a new assignment</h1>
      <div className="flex flex-col gap-4">

        <div className='flex flex-row w-full '>
          {/* Start Date */}
          <div className="w-1/2">
            <InputField
              label="Start Date"
              name="start_date"
              type="datetime-local"
              register={register}
              error={errors.start_date}
            />
          </div>

          {/* Deadline Date */}
          <div className="w-1/2">
            <InputField
              label="Deadline Date"
              name="deadline_date"
              type="datetime-local"
              register={register}
              error={errors.deadline_date}
            />
          </div>
        </div>

        {/* Description */}
        <div className="w-full">
          {/* Textarea */}
          <label className="block mb-2 text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Subject Selection */}
        <div className="w-full">
          <label className="block mb-2 text-sm font-medium">Select Subject</label>
          <select
            {...register("subject_id", { valueAsNumber: true })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a subject</option>
            {subjects.map((subject: any) => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
          {errors.subject_id && (
            <span className="text-red-500 text-sm">{errors.subject_id.message}</span>
          )}
        </div>

        {/* Students Selection */}
        <div className="w-full">
          <label className="block mb-2 text-sm font-medium">Select Students</label>
          <select
          {...register("student_ids", { valueAsNumber: true })}  // valueAsNumber özelliği ile string'i number'a dönüştür
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          multiple
          onChange={(e) => handleStudentSelect(parseInt(e.target.value))}
        >
          {students.map((student: any) => (
            <option key={student.id} value={student.id}>
              {`${student.name} ${student.surname}`}
            </option>
          ))}
        </select>

          {errors.student_ids && (
            <span className="text-red-500 text-sm">{errors.student_ids.message}</span>
          )}

          {/* Show selected students */}
          <div className="mt-2">
            <h3 className="font-medium text-green-600">Selected Students:</h3>
            <div className="flex gap-2 flex-wrap">
              {selectedStudents.map((studentId) => {
                const student = relatedData?.students?.find((s: any) => s.id === studentId);
                return (
                  student && (
                    <span key={studentId} className="flex items-center gap-2 p-1 bg-blue-200 rounded-md">
                      {student.name} {student.surname}
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
        </div>

        {/* Classes Selection */}
        <div className="w-full">
          <label className="block mb-2 text-sm font-medium">Select Classes</label>
          <select
          {...register("class_ids", { valueAsNumber: true })}  // valueAsNumber özelliği ile string'i number'a dönüştür
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          multiple
          onChange={(e) => handleClassSelect(parseInt(e.target.value))}
        >
          {classes.map((classItem: any) => (
            <option key={classItem.id} value={classItem.id}>
              {`${classItem.class_code}`}
            </option>
          ))}
        </select>

          {errors.class_ids && (
            <span className="text-red-500 text-sm">{errors.class_ids.message}</span>
          )}

          {/* Show selected classes */}
          <div className="mt-2">
            <h3 className="font-medium text-green-600">Selected Classes:</h3>
            <div className="flex gap-2 flex-wrap">
              {selectedClasses.map((classId) => {
                const cls = relatedData?.classes?.find((c: any) => c.id === classId);
                return (
                  cls && (
                    <span key={classId} className="flex items-center gap-2 p-1 bg-blue-200 rounded-md">
                      {cls.class_code}
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
      </div>

      <div className="w-full mt-4">
  <label className="block mb-2 text-sm font-medium text-gray-700">Upload Document(s)</label>
  <div className="flex items-center gap-4 border p-4 rounded-md border-dashed focus-within:ring-2 focus-within:ring-blue-500">
    <input
      // register'ı kaldırıyoruz çünkü documents state'ini manuel yönetiyoruz
      type="file"
      className="w-full cursor-pointer text-sm text-gray-700"
      multiple
      onChange={handleFileChange}
    />
    <span className="text-gray-500">Drag & Drop or Browse</span>
  </div>
  {errors.documents && (
    <span className="text-red-500 text-sm">{errors.documents.message}</span>
  )}
</div>

      {/* Yüklenen Dosyalar */}
      {selectedFiles.length > 0 && (
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Uploaded Documents:</h2>
        <ul className="list-disc pl-6">
          {selectedFiles.map((file, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}


      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md disabled:opacity-50 mt-4 transition-colors"
        disabled={!isValid}
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );

}

  export default AssignmentForm;
