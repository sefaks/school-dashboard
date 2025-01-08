import React, { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { useFormState } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnnouncementSchema, TeacherSchema, announcementSchema, teacherSchema } from '@/lib/formValidationSchemas';
import { addTeacherToInstitution, createAnnouncementAdmin, createAnnouncementTeacher, updateTeacher } from '@/lib/actions';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import InputField from '../InputField';
import { useSession } from 'next-auth/react';
const AnnouncementForm = ({
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
      getValues,
      watch,
    } = useForm<AnnouncementSchema>({
      resolver: zodResolver(announcementSchema),
      defaultValues: data,
    });
  
    const { data: session } = useSession(); // Get the session (which includes the token)
    const router = useRouter();
  
    const [state, formAction] = useFormState(
      async (prevState: any, formData: string) => {
        try {
          const parsedData = JSON.parse(formData);

          console.log("parsedData", parsedData);
          console.log("parsedData.token", errors);
  
          // Kullanıcı rolüne göre uygun endpoint'i çağırıyoruz
          if (session?.user.role === "teacher") {
            const response =
              type === "create"
                ? await createAnnouncementTeacher(parsedData, parsedData.token)
                : await updateTeacher(parsedData);
  
            // Başarı durumunu dönüyoruz
            return {
              success: true,
              error: false,
              data: response,
            };
          } else if (session?.user.role === "admin") {
            const response =
              type === "create"
                ? await createAnnouncementAdmin(parsedData, parsedData.token)
                : await updateTeacher(parsedData);
  
            // Başarı durumunu dönüyoruz
            return {
              success: true,
              error: false,
              data: response,
            };
          }
  
          // Eğer hiçbir role uygun değilse
          throw new Error("User role not recognized");
        } catch (error: any) {
          return {
            success: false,
            error: error.message || "An error occurred",
            data: null,
          };
        }
      },
      {
        success: false,
        error: false,
        data: null,
      }
    );
  
    // useEffect ile state değişikliklerini ele alıyoruz
    React.useEffect(() => {
      if (state.success) {
        toast.success(
          type === "create"
            ? "Announcement added successfully!"
            : "Announcement updated successfully!"
        );
        // 2 saniye bekletip pencereyi kapatıyoruz
        setTimeout(() => {
          setOpen(false);
          router.refresh();
        }, 2000);
      } else if (state.error) {
        toast.error(state.error);
      }
    }, [state, type, setOpen, router]);

  const [selectedTeachers, setSelectedTeachers] = React.useState<number[]>(data?.teacher_ids || []);
  const [selectedParents, setSelectedParents] = React.useState<number[]>(data?.parent_ids || []);
  const [selectedClasses, setSelectedClasses] = React.useState<number[]>(data?.class_ids || []);

  const handleTeacherSelect = (id: number) => {
    if (!selectedTeachers.includes(id)) {
      setSelectedTeachers([...selectedTeachers, id]);
    }
  };

  const handleParentSelect = (id: number) => {
    if (!selectedParents.includes(id)) {
      setSelectedParents([...selectedParents, id]);
    }
  };

  const handleClassSelect = (id: number) => {
    if (!selectedClasses.includes(id)) {
      setSelectedClasses([...selectedClasses, id]);
    }
  };

  const handleTeacherRemove = (id: number) => {
    setSelectedTeachers(selectedTeachers.filter((teacherId) => teacherId !== id));
  };

  const handleParentRemove = (id: number) => {
    setSelectedParents(selectedParents.filter((parentId) => parentId !== id));
  };

  const handleClassRemove = (id: number) => {
    setSelectedClasses(selectedClasses.filter((classId) => classId !== id));
  };
  
    const onSubmit = async (data: AnnouncementSchema) => {
    
      console.log(errors);

      console.log("AnnouncementForm data:", data);
      if (!session?.user.accessToken) {
        toast.error("No authentication token found");
        return;
      }
  
      const formData = {
        ...data,
        token: session.user.accessToken,
        teachers: selectedTeachers,
        parents: selectedParents,
        classes: selectedClasses,
      };
  
      console.log("AnnouncementForm data:", formData);

      formAction(JSON.stringify(formData));
    };

  
    const isValid = Object.keys(errors).length === 0;
    return (
        <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create Announcement" : "Update Announcement"}
        </h1>
      
        {/* Title Input */}
        <div>
          <label className="block mb-2 text-sm font-medium">Title</label>
          <input
            {...register("title", { required: "Title is required" })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
        </div>
      
        {/* Content Input */}
        <div>
          <label className="block mb-2 text-sm font-medium">Content</label>
          <textarea
            {...register("content", { required: "Content is required" })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          {errors.content && <span className="text-red-500 text-sm">{errors.content.message}</span>}
        </div>
      
        {/* Teachers Selection */}
        <div>
          <label className="block mb-2 text-sm font-medium">Select Teachers</label>
          <select
            {...register("teacher_ids", { required: "Please select at least one teacher", valueAsNumber: true })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            multiple
          >
            {relatedData?.teachers?.map((teacher: any) => (
              <option key={teacher.id} value={teacher.id}>
                {`${teacher.name} ${teacher.surname}`}
              </option>
            ))}
          </select>
          {errors.teacher_ids && <span className="text-red-500 text-sm">{errors.teacher_ids.message}</span>}
          
          <div className="mt-2 flex gap-2 flex-wrap">
            {selectedTeachers.map((teacherId) => {
              const teacher = relatedData?.teachers?.find((t: any) => t.id === teacherId);
              return (
                teacher && (
                  <span key={teacherId} className="p-1 bg-blue-200 rounded-md flex items-center gap-2">
                    {teacher.name} {teacher.surname}
                    <button
                      type="button"
                      onClick={() => handleTeacherRemove(teacherId)}
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
      
        {/* Parents Selection */}
        <div>
          <label className="block mb-2 text-sm font-medium">Select Parents</label>
          <select
            {...register("parent_ids", { required: "Please select at least one parent", valueAsNumber: true })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            multiple
          >
            {relatedData?.parents?.map((parent: any) => (
              <option key={parent.id} value={parent.id}>
                {`${parent.name} ${parent.surname}`}
              </option>
            ))}
          </select>
          {errors.parent_ids && <span className="text-red-500 text-sm">{errors.parent_ids.message}</span>}
          
          <div className="mt-2 flex gap-2 flex-wrap">
            {selectedParents.map((parentId) => {
              const parent = relatedData?.parents?.find((p: any) => p.id === parentId);
              return (
                parent && (
                  <span key={parentId} className="p-1 bg-blue-200 rounded-md flex items-center gap-2">
                    {parent.name} {parent.surname}
                    <button
                      type="button"
                      onClick={() => handleParentRemove(parentId)}
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
      
        {/* Classes Selection */}
        <div>
          <label className="block mb-2 text-sm font-medium">Select Classes</label>
          <select
            {...register("class_ids", { required: "Please select at least one class", valueAsNumber: true })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            multiple
          >
            {relatedData?.announcementClasses?.map((classItem: any) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.class_code}
              </option>
            ))}
          </select>
          {errors.class_ids && <span className="text-red-500 text-sm">{errors.class_ids.message}</span>}
          
          <div className="mt-2 flex gap-2 flex-wrap">
            {selectedClasses.map((classId) => {
              const cls = relatedData?.announcementClasses?.find((c: any) => c.id === classId);
              return (
                cls && (
                  <span key={classId} className="p-1 bg-blue-200 rounded-md flex items-center gap-2">
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
      
        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50 mt-4"
          disabled={!isValid}
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </form>
      
      );
    };
    
    export default AnnouncementForm;