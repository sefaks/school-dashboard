"use client";
import React, { useState, useEffect, KeyboardEvent } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import apiClient from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import NotesItem from "./NotesItem";
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json";

interface Note {
  id: number;
  note: string;
}

interface NotesProps {
  // string id
  id: string;
}

const Notes: React.FC<NotesProps> = ({ id }) => {
  // State to hold notes and input value
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputValue, setInputValue] = useState("");
  const params = useParams();
  const topicId = params.topicId || 1; // Use 1 as fallback if topicId is undefined
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr; 

  // Fetch notes when the component loads
  useEffect(() => {
    const fetchNotes = async () => {
      if (!id) {
        console.log("No content ID provided");
        setError("No content ID available");
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        
        const response = await apiClient.get(`/teachers/me/contents/${id}/notes`,
          {
            headers: {
              Authorization: `Bearer ${session.data?.user.accessToken}`,
            },
          }
        );
        console.log("Notes API response:", response.data);
        setNotes(response.data);
      } catch (error: any) {
        console.log("Error fetching notes:", error);
        
        // Enhanced error logging
        if (error.response) {
          console.log("Error status:", error.response.status);
          console.log("Error data:", error.response.data);
          
          if (error.response.status === 422) {
            setError("The server couldn't process the content ID. Please check the format.");
          } else {
            setError(`Error fetching notes: ${error.response.status}`);
          }
        } else if (error.request) {
          setError("No response from server. Please check your connection.");
        } else {
          setError(`Request error: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, [id]);

  // Add a new note
  const handleAddNote = async () => {
    if (!inputValue.trim()) return;

    console.log("id is", id);

    // give content id to the id
    const contentId = id;

   
    try {
      const response = await apiClient.post(
        `/teachers/me/contents/${id}/add-note`,
        {
          note: inputValue.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${session.data ? session.data.user.accessToken : ''}`
          }
        });
        
      const newNote = response.data; // Assuming the API returns the created note
      setNotes((prev) => [...prev, newNote]);
      toast.success(currentLanguageContent.noteAddedSuccessfully || "Note added successfully");
      setInputValue("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Delete a note (local state update for now)
  const handleDeleteNote = async (noteId: number) => {
    try {
      // Add API call to delete if needed
      const response = await apiClient.delete(`/teachers/me/delete-note/${noteId}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });

      // if response is successful, remove the note from local state
      if (response.status === 200) {
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
        toast.success(currentLanguageContent.noteDeletedSuccessfully || "Note deleted successfully");
      } else {
        toast.error("Failed to delete note");
      }


      
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };
  // Edit a note (update via API)
  const handleEditNote = async (id: number, newText: string) => {
    try {
      const response = await apiClient.patch(`/teachers/me/update-note/${id}`, {
        note: newText,
      },
      {        headers: {
        Authorization: `Bearer ${session.data?.user.accessToken}`,


      }
      }

      );

      if (response.status === 200) {
        // Update the note in the local state after successful update
        setNotes((prev) =>
          prev.map((note) =>
            note.id === id ? { ...note, note: newText } : note
          )
        );
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  // Handle Enter key to add a note
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddNote();
    }
  };

  return (
    <>
      <div className="flex flex-col flex-grow mt-[14px] justify-between">
        {/* Notes list */}
        <div className="flex flex-col h-[60vh] overflow-auto gap-4">
          {notes.map((note) => (
            <NotesItem
              key={note.id}
              note={note}
              onDelete={handleDeleteNote}
              onEdit={handleEditNote}
            />
          ))}
        </div>

        {/* Input area */}
        <div className="bg-[#FBF5DB] gap-2 rounded-[16px] flex items-center p-[16px] mt-4">
          <button onClick={handleAddNote}>
            <Image src="/icons/plus.svg" width={28} height={28} alt="add" />
          </button>
          <input
            type="text"
            placeholder="Yazmak istediğiniz notu girin..."
            className="bg-transparent outline-none w-full"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </>
  );
};

export default Notes;
