
"use client";

import { FaFilePdf } from "react-icons/fa";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
const DownloadDocumentButton = ({
    documentId,
    assignmentId,
    teacherId,
    documentName,
    downloadType, // Yeni prop: hangi endpoint'e istek atılacağını belirler
  }: {
    documentId: number;
    assignmentId: number;
    teacherId: number;
    documentName: string;
    downloadType: "assignment" | "submission"; // "assignment" veya "submission" olabilir
  }) => {
    const [loading, setLoading] = useState(false);
  
    // Kullanıcı oturumunu al
    const { data: session } = useSession();
  
    const handleDownload = async () => {
      try {
        setLoading(true);
  
        let endpoint = "";
        if (documentId === undefined) {
            toast.error("Dosya bulunamıyor.");
            throw new Error("Dosya ID'si belirtilmemiş.");

            }



        // Endpoint, `downloadType` prop'una göre ayarlanır
        if (downloadType === "assignment") {
          endpoint = `http://arfbackend-h3g2bdftbxdffqcy.westeurope-01.azurewebsites.net/teachers/me/download-assignment-document/${assignmentId}/${documentId}`;
        } else if (downloadType === "submission") {
          endpoint = `http://arfbackend-h3g2bdftbxdffqcy.westeurope-01.azurewebsites.net/teachers/me/download-student-submission/${documentId}`;
        }
  
        // Endpoint'e istek atılır
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        });
  
        if (!response.ok) throw new Error("İndirme başarısız");
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
  
        const a = document.createElement("a");
        a.href = url;
        a.download = documentName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Dosya başarıyla indirildi.");
      } catch (error) {
        console.error("İndirme hatası:", error);
        toast.error("Dosya indirilemedi.");
      } finally {
        setLoading(false);
      }
    };
  

  return (
    <li
      onClick={handleDownload}
      className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer hover:bg-gray-100 p-2 rounded"
    >
      <div style={{ color: "red" }}>
        <FaFilePdf size={24} />
      </div>
      <span className={loading ? "text-gray-400" : ""}>
        {documentName}
        {loading && " (İndiriliyor...)"}
      </span>
    </li>
  );
};

export default DownloadDocumentButton;