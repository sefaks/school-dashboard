'use client'
import { useRouter } from 'next/navigation'
import { Edit, Plus } from 'lucide-react'
import page from '@/app/(dashboard)/list/resources/[Inst_id]/tests/page';

export type AssignmentCreateUpdateProps = {
  type: "create" | "update";
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

    
    if (type === "create") {
      return `${baseUrl}?type=${type}`;
    } else if (type === "update" && id) {
      return `${baseUrl}?type=${type}&id=${id}`;
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