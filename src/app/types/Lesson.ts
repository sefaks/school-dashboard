export type Lesson = {
    name: string;
    grade: number;
    
    institution_id: number;
    subject_id: number;
    lesson_image: string;
    description: string;
    id: number;
    curriculum_year: Date;
    contents: Content[]; // Use the Content type here
    students_contents:students_contents[]
    publishes:publishes[]
};

// Define the Content type separately for better reusability
export type Content = {
    id: number;
    unit_no: number;
    lesson_id: number;
    content_id: string;
    content_count: number;
    content_name: string;
    level: number;
    unit_id: number;
    src:string;
    subcontents:subcontents[]

    
};
export interface StudentContent {
  id: number; // Unique identifier for the content
  student_id: number,
  content_id: string,
  name: string,

  unit_no: number,
  order: number,
 

  content_name: string; // Name of the content item
  level: number; // Level in the hierarchy (0 = top-level, 1 = one level nested, etc.)
  content_number: string; // Numbering system indicating hierarchy (e.g., "1", "1.1", "1.1.1")
  children?: StudentContent[]; // Optional array of child contents (nested content)
}


export type subcontents=
      {
        content_id: string,
        content_name: string,
        level: 1;
      }

 export type students_contents={
  id: number,
  student_id: 1,
  content_id: string,
  name: string,
  level: number,
  unit_no: number,
  order: number,
  content_number: string
 }     

 export type publishes=
  {
    id: number,
    curriculum_year: string,
    subject_id: number,
    publisher: string,
    grade: number,
    publisher_name:string,
   contents:StudentContent[]
    }