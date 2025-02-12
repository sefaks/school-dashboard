'use client'
import { useRouter } from 'next/navigation'
import { Edit, Plus, View } from 'lucide-react'
import page from '@/app/(dashboard)/list/resources/[Inst_id]/tests/page';

export type AssignmentCreateUpdateProps = {
  type: "create" | "update" 
  id?: number | string;
  page_type?: string;
};

const RedirectButton = ({ type, id,page_type }: AssignmentCreateUpdateProps) => {
  const router = useRouter()


  const getRedirectUrl = () => {

    let baseUrl = ""; // baseUrl'i fonksiyonun başında tanımlıyoruz
    
    if(page_type === "assignments") {
       baseUrl = `/list/assignments/create`
    }
    else if(page_type === "schedules") {
      baseUrl = `/list/schedules/create`
    }


    if(page_type === "assignments" && type === "update" && id) {
      return `/list/assignments/create?id=${id}`
    }
    else if(page_type === "schedules" && type === "update" && id) {
      return `/list/schedules/create/${id}`
    }
    else if (page_type === "assignments" && type === "create") {
      return baseUrl;
    }

    return baseUrl;
    
  }

  return (
    <button
      onClick={() => router.push(getRedirectUrl())}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-400 transition-colors"
    >
      {type === "create" ? (
        <Plus className="w-5 h-5 text-gray-700" />
      ) : (
        <Edit className="w-5 h-5 text-gray-700" />
      )}

     

    </button>
  )
}

export default RedirectButton