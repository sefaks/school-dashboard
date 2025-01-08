import React, { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeacherActivateSchema } from '@/lib/formValidationSchemas'; // Schema
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const AccountActivationModal = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TeacherActivateSchema>({
    resolver: zodResolver(TeacherActivateSchema),
    defaultValues: data,
  });

  const { data: session } = useSession();
  const router = useRouter();

  const [selectedSubjects, setSelectedSubjects] = React.useState<number[]>(data?.subjects || []);

  const handleSubjectSelected = (id: number) => {
    if (!selectedSubjects.includes(id)) {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const handleSubjectRemove = (id: number) => {
    setSelectedSubjects(selectedSubjects.filter((subject_id) => subject_id !== id));
  };

  const onSubmit = async (formData: any) => {
    console.log('Form Data:', formData);
    if (!session?.user.accessToken) {
      toast.error("No authentication token found");
      return;
    }

    // Assuming you send this formData to an API endpoint
    // Example form data with selected subjects and access token
    const dataToSubmit = {
      ...formData,
      token: session.user.accessToken,
      subjects: selectedSubjects,
    };

    // Placeholder: Add your API call for account activation here

    toast.success(type === "create" ? "Account created successfully!" : "Account updated successfully!");
    setTimeout(() => setOpen(false), 2000); // Close modal after 2 seconds
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create Account" : "Update Account"}
        </h1>

        <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Title Input */}
          <div>
            <label className="block mb-2 text-sm font-medium">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block mb-2 text-sm font-medium">Gender</label>
            <select
              {...register("gender", { required: "Gender is required" })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
            {errors.gender && <span className="text-red-500 text-sm">{errors.gender.message}</span>}
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block mb-2 text-sm font-medium">Subjects</label>
            <div className="flex gap-4 flex-wrap">
              {["TURKCE", "MATEMATIK", "FEN_B_LG_S_", "SOSYAL_BILGILER", "INGILIZCE", "DIN_BILGISI", "COGRAFYA", "TAR_H"].map((subject, index) => (
                <button
                  type="button"
                  key={subject}
                  onClick={() => handleSubjectSelected(index)}
                  className={`p-2 rounded-md border ${selectedSubjects.includes(index) ? 'bg-blue-400' : 'bg-gray-200'}`}
                >
                  {subject}
                </button>
              ))}
            </div>
            {errors.subjects && <span className="text-red-500 text-sm">{errors.subjects.message}</span>}
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

        <button
          onClick={() => setOpen(false)}
          className="mt-4 text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AccountActivationModal;
