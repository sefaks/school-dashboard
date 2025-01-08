import React, { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { useFormState } from 'react-dom';
import { useSession } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeacherSchema, teacherSchema } from '@/lib/formValidationSchemas';
import { addTeacherToInstitution, updateTeacher } from '@/lib/actions';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import InputField from '../InputField';

const TeacherForm = ({
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
    watch
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: data,
  });
  
  const { data: session } = useSession();
  const router = useRouter();

  const [state, formAction] = useFormState(async (prevState: any, formData: string) => {
    try {
      const parsedData = JSON.parse(formData);
      const response = type === "create"
        ? await addTeacherToInstitution(parsedData, parsedData.token)
        : await updateTeacher(parsedData);
      
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

  // Use useEffect to handle state changes
  React.useEffect(() => {
    if (state.success) {
      toast.success(type === "create" ? "Teacher added successfully!" : "Teacher updated successfully!");
      // wait for 2 seconds
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 2000);
     
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, type, setOpen, router]);

  const onSubmit = async (data: TeacherSchema) => {
    if (!session?.user.accessToken) {
      toast.error("No authentication token found");
      return;
    }
    
    const formData = {
      ...data,
      token: session.user.accessToken
    };
    
    formAction(JSON.stringify(formData));
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">Add a new teacher</h1>
      <div className="flex justify-start flex-wrap gap-4">
        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors.email}
        />
        <InputField
          label="Validation Code"
          name="validation_code"
          register={register}
          error={errors.validation_code}
        />
        <p className="text-xs text-green-600">
          The code will be the 5-digit sharing code found in the teacher's "My Codes" section.
        </p>
      </div>
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

export default TeacherForm;