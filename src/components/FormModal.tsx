"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { deleteAnnoucementAdmin, deleteAnnoucementTeacher, deleteClass, deleteStudent, deleteTeacher } from "@/lib/actions";
import React from "react";
import { useSession } from "next-auth/react";

// Dynamically imported forms
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <h1>Loading...</h1>,
});

const ActivateForm = dynamic(() => import("./forms/ActivateForm"), {
  loading: () => <h1>Loading...</h1>,
});

// Dynamically map forms
const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  activate : (setOpen, type, data, relatedData) => (
    <ActivateForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  )
};
const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {

// Form component as a functional component
const Form = ({
  table,
  type,
  id,
  setOpen,
  router,
}: {
  table: string;
  type: "create" | "update" | "delete";
  id: number | string | undefined;
  setOpen: Dispatch<SetStateAction<boolean>>;
  router: ReturnType<typeof useRouter>;
}) => {
  let { data: session } = useSession();
  let token = session?.user.accessToken;
  let role = session?.user.role;

  const [state, setState] = useState({
    success: false,
    error: false,
    message: "",
  });

  const deleteActionMap = {
    
    student: deleteStudent,
    teacher: deleteTeacher,
    announcement: (announcementId: number, token: string) => {
      if (role === 'teacher') {
        return deleteAnnoucementTeacher(announcementId, token);
      } else if (role === 'admin') {
        return deleteAnnoucementAdmin(announcementId, token);
      } else {
        throw new Error("Invalid role for deleting announcement");
      }
    },
    class: deleteClass,
  }; 

  const handleDelete = async () => {
    if (!token) {
      toast.error("No token found. Please log in again.");
      return;
    }

    try {
      const deleteAction = deleteActionMap[table as keyof typeof deleteActionMap];
      if (deleteAction && id) {
        await deleteAction(id as number, token);
        setState({ success: true, error: false, message: `${table} deleted successfully!` });
        toast.success(`${table} deleted successfully!`);
        setOpen(false);
        router.refresh();
      } else {
        throw new Error(`Delete action not found for ${table}`);
      }
    } catch (error: any) {
      setState({ success: false, error: true, message: error.message });
      toast.error(error.message || `Failed to delete ${table}`);
    }
  };

  return type === "delete" && id ? (
    <form
      className="p-4 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleDelete();
      }}
    >
      <input type="text | number" name="id" value={id} hidden />
      <span className="text-center font-medium">
        All data will be lost. Are you sure you want to delete this {table}?
      </span>
      <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
        Delete
      </button>
    </form>
  ) : type === "create" || type === "update" ? (
    forms[table](setOpen, type, data, relatedData)
    ) : (
    "Form not found!"
  );
};


  const router = useRouter();

  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form
              table={table}
              type={type}
              id={id}
              setOpen={setOpen}
              router={router}
            />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
