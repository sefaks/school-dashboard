import React, { useState } from 'react';
import Image from 'next/image';
import en from "@/app/messages/en.json";  
import tr from "@/app/messages/tr.json"; 

interface Note {
  id: number;
  note: string;
}

interface NotesItemProps {
  note: Note;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

const NotesItem: React.FC<NotesItemProps> = ({ note, onDelete, onEdit }) => {
  // For editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(note.note);
  const storedLanguage = localStorage.getItem("language") || "en";
  const [language, setLanguage] = useState(storedLanguage);
  const currentLanguageContent = language === "en" ? en : tr;

  const handleSave = () => {
    onEdit(note.id, editedText);
    setIsEditing(false);
  };

  return (
    <div className='bg-[#FBF5DB] p-[16px] rounded-[16px]'>
      {isEditing ? (
        <textarea
          className='bg-transparent outline-none w-full text-[#00000099] text-[14px] leading-[22px] rounded-[8px] border border-gray-300 p-2'
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
        />
      ) : (
        <p className='text-[#00000099] font-normal text-[14px] leading-[22px]'>
          {note.note}
        </p>
      )}

      <div className='flex justify-end'>
        <div className='flex items-center gap-3 mt-2'>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className='text-green-600 text-sm'
              >
                {currentLanguageContent.save || "Kaydet"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className='text-red-600 text-sm'
              >
                {currentLanguageContent.cancel || "İptal"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)}>
                <Image
                  src="/icons/blackEdit.svg"
                  width={15}
                  height={15}
                  alt='edit'
                />
              </button>
              <button onClick={() => onDelete(note.id)}>
                <Image
                  src="/icons/delIcon.svg"
                  width={15}
                  height={15}
                  alt='delete'
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesItem;
