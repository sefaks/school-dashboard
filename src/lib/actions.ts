// app/actions/student.actions.tsx
'use server'

import { revalidatePath } from 'next/cache';
import { AnnouncementSchema, AssignmentSchema, ClassSchema, StudentSchema, TeacherSchema, studentSchema } from './formValidationSchemas';
import { toast } from 'react-toastify';
import axios from "axios";

// request for add student to institution 

const API_BASE_URL = "http://127.0.0.1:8000";


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


export const addAssignment = async (formData: AssignmentSchema, token: string) => {

  try {
    const response = await axios.post(`${API_BASE_URL}/teachers/create-assignment`, formData, {
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
      throw new Error(error.response.data.detail || "Failed to add assignment!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}

export const updateAssignment = async (formData: AssignmentSchema, token: string) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admins/update-assignment`, formData, {
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
      throw new Error(error.response.data.detail || "Failed to update assignment!");
    } else if (error.request) {
      console.error("No response received from server:", error.request);
      throw new Error("No response from server.");
    } else {
      console.error("Error during setup:", error.message);
      throw new Error("An unexpected error occurred!");
    }
  }
}

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




