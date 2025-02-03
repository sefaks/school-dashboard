"use client"
import { Institution } from "@/app/types/Institution";
import InstituteCard from "@/components/InstituteCard";
import apiClient from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Page = () => {
  const [institutes, setInstitutes] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get("redirectTo"); 
  const isExam = redirectTo === "tests"; // ✅ redirectTo'ya göre isExam belirledik

  const { data: session } = useSession(); 

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        setLoading(true);

        if (!session?.user?.accessToken) {
          toast.error("Unauthorized Access");
          return;
        }

        const response = await apiClient.get("/teachers/me/institutions", {
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });

        console.log("Institutes from API:", response.data);

        const data = Array.isArray(response.data) ? response.data : [response.data];

        setInstitutes(data);
      } catch (err) {
        console.error("Error fetching institutes:", err);
        toast.error("Failed to fetch institutions");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchInstitutes();
    }
  }, [session]); 

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loader border-t-2 border-b-2 border-[#702DFF] w-10 h-10 rounded-full animate-spin mr-2"></div>
        <span className="text-[#702DFF]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="px-[22px] xl:px-[30px] rounded-[14px] py-[25px]">
      {institutes.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[20px]">
          {institutes.map((inst) => (
            <InstituteCard
              key={inst?.id}
              image={inst?.image || "/instituteLogo.svg"}
              name={inst?.name}
              link={`/list/resources/${inst?.id}?redirectTo=${redirectTo || ""}`} // ✅ Artık sadece redirectTo'yu gönderiyoruz
            />
          ))}
        </div>
      ) : (
        <div>
          <p className="text-black text-[18px] font-semibold italic">
            Herhangi bir kurum bulunamadı.
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
