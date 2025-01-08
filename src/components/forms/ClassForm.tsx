import { addClassToInstitution, updateClass } from "@/lib/actions";
import { ClassSchema, classSchema } from "@/lib/formValidationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Dispatch, SetStateAction } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { useForm } from 'react-hook-form';
import InputField from "../InputField";


const ClassForm = ({
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
    } = useForm<ClassSchema>({
      resolver: zodResolver(classSchema),
      defaultValues: data,
    });
  
    const { data: session } = useSession();
    const router = useRouter();
  
    // Watch the 'grade' value
    const grade = watch("grade");
  
    // Automatically update the class code when grade changes
    React.useEffect(() => {
      if (grade) {
        // Set class code based on the grade
        setValue("class_code", `${grade}-`);
      }
    }, [grade, setValue]);
  
   
  
    const [state, formAction] = useFormState(async (prevState: any, formData: string) => {
      try {
        const parsedData = JSON.parse(formData);
        const response =
          type === "create"
            ? await addClassToInstitution(parsedData, parsedData.token)
            : await updateClass(parsedData, parsedData.token, data.id);
  
        return {
          success: true,
          error: false,
          data: response,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "An error occurred",
          data: null,
        };
      }
    }, {
      success: false,
      error: false,
      data: null,
    });
  
    React.useEffect(() => {
      if (state.success) {
        toast.success(type === "create" ? "Class added successfully!" : "Class updated successfully!");
        setTimeout(() => {
          setOpen(false);
          router.refresh();
        }, 2000);
      } else if (state.error) {
        toast.error(state.error);
      }
    }, [state, type, setOpen, router]);
  
    const onSubmit = async (data: ClassSchema) => {
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
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create Class" : "Update Class"}
        </h1>     
           <div className="flex justify-start flex-wrap gap-4">
          <InputField
            label="Grade"
            name="grade"
            register={register}
            error={errors.grade}
          />
          <InputField
            label="Class Code"
            name="class_code"
            register={register}
            error={errors.class_code}
          />
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
  
  export default ClassForm;
  

