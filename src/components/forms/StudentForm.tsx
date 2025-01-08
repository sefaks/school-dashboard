"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import InputField from "@/components/InputField";
import { StudentSchema, studentSchema } from "@/lib/formValidationSchemas";
import { addStudentToInstitution, updateStudent } from "@/lib/actions"; // Keeping the original methods
import { useFormState } from "react-dom";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

const StudentForm = ({
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
} = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: data,
});


  const { data: session } = useSession(); // Get the session (which includes the token)
  const router = useRouter();

  const [state, formAction] = useFormState(
    type === "create" ? addStudentToInstitution : updateStudent,
    {
      success: false,
      error: false,
    }
  );

 const onSubmit = async (formData: StudentSchema) => {
  const formattedData = {
    ...formData,
    parents: formData.parents
      ? formData.parents.map((parent) => ({
          ...parent,
          phone: parent.phone.replace(/\s+/g, ""), // Telefon numarasındaki boşlukları kaldır
        }))
      : undefined,
  };

  console.log("Formatted Data to send:", formattedData); // Veriyi yazdır

  try {
    if (type === "create") {
      const response = await addStudentToInstitution(
        formattedData,
        session?.user.accessToken || ""
      );
      console.log("Response from server:", response); // Sunucu yanıtını yazdır
    } else {
      const response = await updateStudent(formattedData, session?.user.accessToken || "");
      console.log("Response from server:", response); // Sunucu yanıtını yazdır
    }

    // Başarılı olduğunda kullanıcıya mesaj göster
    toast.success(
      `Student has been ${type === "create" ? "created" : "updated"}!`
    );

    // Bir süre bekleyin ve sonra yenileyin
    setTimeout(() => {
      setOpen(false);
      router.refresh();
    }, 2000); // 2 saniye bekle
  } catch (error: any) {
    console.error("Error Details:", error); // Hata detaylarını yazdır
    if (error.response?.data?.detail) {
      toast.error(error.response.data.detail);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred!");
    }
  }
};

  useEffect(() => {
    if (state.success) {
      toast.success(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();

    }
  }, [state, router, type, setOpen]);

  const { classes }: { classes: any[] } = relatedData || {};

  //import getValues, setValue, watch from react-hook-form
  const handleAddParent = () => {
    const currentParents = getValues('parents') || [];
    setValue('parents', [...currentParents, {
        name: "",
        surname: "",
        email: "",
        phone: ""
    }]);
};

const handleRemoveParent = (index: number) => {
    const currentParents = getValues('parents') || [];
    setValue('parents', currentParents.filter((_, i) => i !== index));
};

  const formParents = watch('parents') || [];

  const isValid = Object.keys(errors).length === 0;


  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update student"}
      </h1>

      {/* Authentication Information */}
      <span className="text-sm text-gray-400 font-medium">Authentication Information</span>

      <div className="flex justify-start flex-wrap gap-4">
        <InputField label="Email" name="email" register={register} error={errors?.email} />
        <InputField label="Student Code" name="student_code" register={register} error={errors?.student_code} />
        <p className="text-xs text-green-600">
          The code will be the 5-digit sharing code found in the student's "My Codes" section.
        </p>
      </div>

      {/* Class Selection */}
      <span className="text-sm text-gray-400 font-medium">Class Selection</span>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Class</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("class_id")}
        >
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.class_code}
            </option>
          ))}
        </select>
        {errors.class_id?.message && <p className="text-xs text-red-400">{errors.class_id.message}</p>}
      </div>

      {/* Parent Information */}
      <span className="text-sm text-gray-400 font-medium">Add Parents</span>
      {formParents.map((parent, index) => (
        <div key={index} className="flex flex-row justify-start gap-4">
          <InputField
            label={`Parent - Name`}
            name={`parents[${index}].name`}
            register={register}
            error={errors?.parents?.[index]?.name}
          />
          <InputField
            label={`Parent  - Surname`}
            name={`parents[${index}].surname`}
            register={register}
            error={errors?.parents?.[index]?.surname}
          />
          <InputField
            label={`Parent - Email`}
            name={`parents[${index}].email`}
            register={register}
            error={errors?.parents?.[index]?.email}
          />
          <InputField
            label={`Parent  - Phone`}
            name={`parents[${index}].phone`}
            register={register}
            error={errors?.parents?.[index]?.phone}
          />
          <button
            type="button"
            className="text-sm text-red-500"
            onClick={() => handleRemoveParent(index)}
          >
            Remove Parent
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddParent}
        className="text-sm text-blue-500"
      >
        Add Another Parent
      </button>


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

export default StudentForm;