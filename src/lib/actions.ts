// app/actions/student.actions.tsx
'use server'

import { revalidatePath } from 'next/cache';
import { AnnouncementSchema, AssignmentSchema, ClassSchema, CommentSchema, ScheduleCreateSchema, StudentSchema, TeacherRegisterSchema, TeacherSchema, TeacherUpdateSchema, studentSchema, } from './formValidationSchemas';
import { toast } from 'react-toastify';
import axios from "axios";

// request for add student to institution 

const API_BASE_URL = "http://127.0.0.1:8000";

interface FileWithBase64 {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  base64: string;
}


export const addStudentToInstitution = async (formData: StudentSchema, token: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/admins/add-student`, formData, {
            headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data;
    } catch (error: any) {
      // Hata mesajını daha ayrıntılı olarak konsola yazdırmak
      console.error("Error details:", error);
  
      if (error.response) {
        console.error("API Error:", error.response.data); // Sunucu hatası
        throw new Error(error.response.data.detail || "Failed to add student!");
      } else if (error.request) {
        console.error("No response received from server:", error.request); // Sunucudan cevap alınamamış
        throw new Error("No response from server.");
      } else {
        console.error("Error during setup:", error.message); // Başka bir hata
        throw new Error("An unexpected error occurred!");
      }
    }
  };
  
// request for update student
export const updateStudent = async (formData: StudentSchema,token:string) => {
  try {
    // Backend URL'ini ve endpoint'i tanımlayın
    const response = await axios.put("/admins/update-student", formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // İşlem başarılıysa yanıtı döndürün
    return response.data;
  } catch (error: any) {
    // Hata durumunda, detaylı bir mesaj döndürün
    if (error.response) {
      throw new Error(error.response.data.detail || "Failed to update student!");
    }
    throw new Error("An unexpected error occurred!");
  }
};

// teacher update
export const updateTeacher = async (formData: any) => {
    try {
      const response = await axios.put("/admins/update-teacher", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || "Failed to update teacher!");
      }
      throw new Error("An unexpected error occurred!");
    }
  };

export const fetchInstitutionClasses = async (institutionId: number) => {
    try {
      const response = await axios.get(`/api/institution/${institutionId}/classes`);
      return response.data; // Sınıf listesini döndürür
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || "Failed to fetch classes!");
      }
      throw new Error("An unexpected error occurred!");
    }
  };


export const deleteStudent = async (studentId: number, token:string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admins/delete-student/${studentId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || "Failed to delete student!");
      }
      throw new Error("An unexpected error occurred while deleting student!");
  }
}

// delete teacher
export const deleteTeacher = async (teacherId: number,token:string) => {
 
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/delete-teacher/${teacherId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Failed to delete teacher!");
    }
    throw new Error("An unexpected error occurred while deleting teacher!");
  }
}



export const addTeacherToInstitution = async (formData: TeacherSchema, token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admins/add-teacher`, formData, {
        headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
} catch (error: any) {
  // Hata mesajını daha ayrıntılı olarak konsola yazdırmak
  console.error("Error details:", error);

  if (error.response) {
    console.error("API Error:", error.response.data); // Sunucu hatası
    throw new Error(error.response.data.detail || "Failed to add student!");
  } else if (error.request) {
    console.error("No response received from server:", error.request); // Sunucudan cevap alınamamış
    throw new Error("No response from server.");
  } else {
    console.error("Error during setup:", error.message); // Başka bir hata
    throw new Error("An unexpected error occurred!");
  }
}
};


export const addClassToInstitution = async (formData: ClassSchema, token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admins/add-class`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      
      // Check for specific error details in the response
      if (error.response.data && error.response.data.detail) {
        // If the backend sends a detail message, use it
        console.log("Error details from server:", error.response.data.detail);
        throw new Error(error.response.data.detail || "Failed to add class!");
      } else {
        // Otherwise, send a generic error message
        throw new Error("An error occurred while adding the class!");
      }
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
};

export const updateClass = async (formData: ClassSchema, token: string, class_id: number) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/admins/update-class/${class_id}`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to update class!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}


export const addAssignment = async (
  formData: Omit<AssignmentSchema, 'documents'>,
  files: FileWithBase64[] | null,
  token: string
) => {
  const requestData = new FormData();
  
  requestData.append('start_date', new Date(formData.start_date).toISOString().split('.')[0]);
  requestData.append('deadline_date', new Date(formData.deadline_date).toISOString().split('.')[0]);
  
  
  if (formData.description) {
      requestData.append('description', formData.description);
  }
  if (formData.header) {
      requestData.append('header', formData.header);
  }
  
  if (formData.subject_id) {
      requestData.append('subject_id', formData.subject_id.toString());
  }
  
  if (formData.class_ids && formData.class_ids.length > 0) {
      requestData.append('class_ids', formData.class_ids.join(','));
  }
  
  if (formData.student_ids && formData.student_ids.length > 0) {
      requestData.append('student_ids', formData.student_ids.join(','));
  }
  if (formData.test_ids && formData.test_ids.length > 0) {
      requestData.append('test_ids', formData.test_ids.join(','));
  }
  
  // Dosya varsa ekle
  if (files && files.length > 0) {
    for (const file of files) {
      // Convert base64 to Blob
      const blob = base64ToBlob(file.base64);
      requestData.append('files', blob, file.name);
    }
  }

  console.log("files",files);

  try {
      const response = await axios.post(
          `${API_BASE_URL}/teachers/create-assignment`,
          requestData,
          {
              headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${token}`,
              }
          }
      );
      return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data || error;
    }
    console.error("Non-API Error:", error);
    throw error;
  }

}

const base64ToBlob = (base64: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'application/octet-stream' });
};

export const updateAssignment = async (
  formData: Omit<AssignmentSchema, "id">,
  files: FileWithBase64[] | null,
  token: string,
  assignment_id: number
) => {
  const requestData = new FormData();

  // Sadece değişen tarihleri gönder
  if (formData.start_date) {
    requestData.append('start_date', new Date(formData.start_date).toISOString().split('.')[0]);
  }
  if (formData.deadline_date) {
    requestData.append('deadline_date', new Date(formData.deadline_date).toISOString().split('.')[0]);
  }

  // Opsiyonel alanları kontrol et
  if (formData.description !== undefined) {
    requestData.append('description', formData.description);
  }

  if (formData.header !== undefined) {
    requestData.append('header', formData.header);
  }

  if (formData.subject_id) {
    requestData.append('subject_id', formData.subject_id.toString());
  }

  // Array türündeki verileri işle
  if (Array.isArray(formData.class_ids)) {
    requestData.append('class_ids', formData.class_ids.join(','));
  }

  if (Array.isArray(formData.student_ids)) {
    requestData.append('student_ids', formData.student_ids.join(','));
  }

  if (Array.isArray(formData.test_ids)) {
    requestData.append('test_ids', formData.test_ids.join(','));
  }

  // Dosyaları işle
  if (files?.length) {
    for (const file of files) {
      try {
        const blob = base64ToBlob(file.base64);
        requestData.append('files', blob, file.name || file.name);
      } catch (error) {
        console.error('Error converting file to blob:', file.name, error);
        throw new Error(`Failed to process file: ${file.name}`);
      }
    }
  }

  try {
    const response = await axios.put(
      `${API_BASE_URL}/teachers/update-assignment/${assignment_id}`,
      requestData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || "Failed to update assignment!";
      console.error("API Error:", {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      });
      throw new Error(errorMessage);
    }
    
    console.error("Unexpected Error:", error);
    throw new Error("An unexpected error occurred while updating the assignment!");
  }
};

export const createAnnouncementAdmin = async (formData: AnnouncementSchema, token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admins/me/create-announcement`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to create announcement!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}

export const createAnnouncementTeacher = async (formData: AnnouncementSchema, token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/teachers/me/create-announcement`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to create announcement!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}

export const deleteAnnoucementTeacher = async (announcementId: number, token: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/teachers/me/delete-announcement/${announcementId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to delete announcement!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}

export const deleteAnnoucementAdmin = async (announcementId: number, token: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/delete-announcement/${announcementId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to delete announcement!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}

export const deleteClass = async (classId: number, token: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/delete-class/${classId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to delete class!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}


export const activateTeacher = async (formData: any, token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/teacher/activate`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to activate teacher!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}

export const updateAnnouncementTeacher = async (formData: AnnouncementSchema, token: string, announcementId: number) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/teachers/me/update-announcement/${announcementId}`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to update announcement!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}


export const updateAnnouncementAdmin = async (formData: AnnouncementSchema, token: string, announcementId: number) => {

  try {
    const response = await axios.patch(`${API_BASE_URL}/admins/me/update-announcement/${announcementId}`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to update announcement!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}


export const teacherAddComment = async (formData: CommentSchema, token: string, assignment_id: number) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/teachers/me/assignments/${assignment_id}/add-comment`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("API Response:", response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      return { success: false, message: error.response.data.detail || "Yorum Eklenemedi." };
    } else if (error.request) {
      return { success: false, message: "No response from server." };
    } else {
      return { success: false, message: "An unexpected error occurred!" };
    }
  }
};

export const teacherUpdateProfile = async (formData: TeacherUpdateSchema, token: string) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/teachers/me/update-profile`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

  
    console.log("API Response:", response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error details:", error);

    if (error.response) {
      return { success: false, message: error.response.data.detail || "Failed to add comment!" };
    } else if (error.request) {
      return { success: false, message: "No response from server." };
    } else {
      return { success: false, message: "An unexpected error occurred!" };
    }
  }
};

export const forgetPassword = async (email: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/forget-password`, { email });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);  // Yanıtı logluyoruz
      throw new Error(error.response.data.detail || "Failed to reset password!");
    }
    console.error("Network Error:", error);  // Ağıt hatalarını logluyoruz
    throw new Error("An unexpected error occurred!");
  }
};

export const resetPassword = async (formData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, formData);
    return response.data;  // Yanıtın tamamını döndürür
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);  // Yanıtı logluyoruz
      // Hata mesajını doğrudan alıyoruz
      throw new Error(error.response.data?.detail || "Failed to reset password!");
    } else if (error.request) {
      console.error("No response received:", error.request);  // Yanıt alınamadıysa
      throw new Error("No response received from the server.");
    } else {
      console.error("Error:", error.message);  // Diğer hata türlerini yakalıyoruz
      throw new Error("An unexpected error occurred!");
    }
  }
};


export const teacherRegister = async (formData: TeacherRegisterSchema) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/teacher/register`, formData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);  // Yanıtı logluyoruz
      throw new Error(error.response.data.detail || "Failed to register teacher!");
    }
    console.error("Network Error:", error);  // Ağıt hatalarını logluyoruz
    throw new Error("An unexpected error occurred!");
  }
}

export const createSchedule = async (formData: ScheduleCreateSchema, token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admins/create-schedule`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to create schedule!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}

export const updateSchedule = async (formData: ScheduleCreateSchema, token: string, scheduleId: number) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/admins/update-schedule/${scheduleId}`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to update schedule!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}

export const teacherUpdateComment = async (content: string, token: string, commentId: number) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/teachers/me/update-comment/${commentId}`, 
      { content: content }, // content burada comment anahtarıyla gönderilmeli
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Başarı durumunda success: true döner
    return { success: true, message: "Yorum başarıyla güncellendi!", data: response.data };
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      return { success: false, message: error.response.data.detail || "Yorum düzenlenemedi!" };
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}


export const teacherGetWeeklyAnalysis = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers/me/students-weekly-analysis`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get weekly analysis!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}


export const teacherStudentsandClasses = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers/me/classes-students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get students and classes!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}

export const teacherSubjects = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers/me/subjects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
  catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get subjects!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }

}


export const getAssignment = async ( assignmentId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assignments/${assignmentId}`)

    console.log("API Response:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get assignment!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}

export const getTeacherProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers/my-profile/view`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get teacher profile!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}


export const getTeacherStudentsAndClasses = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers/me/classes-students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get students and classes!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}

export const addScheduleToStudent = async (formData: any, token: string, student_id: number) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/teachers/me/add-schedule-to-student/${student_id}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      console.log("API Error:", error.response.data);

      throw new Error(JSON.stringify({
        status: error.response.status,
        message: error.response.data.detail || "Failed to add schedule to student!"
      }));
      
    }
    console.error("Network Error:", error);
    throw { status: 500, message: "An unexpected error occurred!" };
  }
};

export const adminClasses = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admins/me/classes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;

  }
  catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get classes!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}

export const getStudentSchedule = async (student_id: number, token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers/me/student-schedule/${student_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get student schedule!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}

export const getTeacherPublishes = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers/me/publishes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get publishes!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}


export const getUnitsForSubjectAndGrade = async (subjectId:any, grade:any, token:string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/units/get-units/${subjectId}/${grade}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Üniteler alınırken bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('Üniteler alınırken hata oluştu:', error);
    throw error;
  }
};

export const getPublishTestTypes = async (token: string,publish_id:number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers/me/publishes/${publish_id}/test-types`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("API Response Error:", error.response);
      throw new Error(error.response.data.detail || "Failed to get test types!");
    }
    console.error("Network Error:", error);
    throw new Error("An unexpected error occurred!");
  }
}


export const getHomeworkIdeaWithAI = async (unitId:any, additionalRequirements:any, token:any) => {
  try {
    const payload = {
      additional_requirements: additionalRequirements || ""
    };
    
    const response = await fetch(`${API_BASE_URL}/teachers/create-homework-idea/${unitId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'AI fikir oluşturma sırasında bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('AI ödev fikri alınırken hata oluştu:', error);
    throw error;
  }
};




