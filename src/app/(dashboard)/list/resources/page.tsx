"use client"
import { Institution } from "@/app/types/Institution";
import InstituteCard from "@/components/InstituteCard";
import apiClient from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import en from "@/app/messages/en.json";
import tr from "@/app/messages/tr.json";

const Page = () => {
  const [institutes, setInstitutes] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get("redirectTo"); 
  const isExam = redirectTo === "tests"; // ✅ redirectTo'ya göre isExam belirledik

  const { data: session } = useSession(); 

  const [language, setLanguage] = useState("en");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language") || "en";
      setLanguage(storedLanguage);
    }
  }, []);
  const currentLanguageContent = language === "en" ? en : tr;

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
      <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
      <span className="mt-2 text-blue-500">{currentLanguageContent.loading}</span>
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
            {currentLanguageContent.no_insitution_found}
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
