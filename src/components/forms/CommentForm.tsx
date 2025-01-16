"use client";
import { teacherAddComment } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const CommentForm = ({ assignmentId, userId }: { assignmentId: string; userId: string }) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();


    const { data: session } = useSession();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError("Yorum boş olamaz.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const assignment_id = parseInt(assignmentId);
            const result = await teacherAddComment(
                { content }, 
                session?.user.accessToken ?? "", 
                assignment_id
            );
            
            if (result.success) {
                setContent(""); // Form temizleme
                toast.success("Yorum başarıyla eklendi!");
                
                // Sayfayı yenilemek yerine router.refresh() kullanabilirsiniz
                // window.location.reload() yerine:
                router.refresh();
            } else {
                setError(result.message || "Yorum eklenirken bir hata oluştu.");
                toast.error(result.message || "Yorum eklenirken bir hata oluştu.");
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setError("Yorum eklenirken bir hata oluştu.");
            toast.error("Yorum eklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
            <h2 className="text-lg font-semibold text-lamaPurple">Add Comment</h2>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-3">
                <textarea
                    name="commentContent"
                    className="w-full p-3 border rounded-lg focus:ring-lamaPurpleLight focus:border-lamaPurpleLight text-sm"
                    rows={2} // Küçük bir boyut, kullanıcı yazarken yükseklik artabilir
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Yorumunuzu yazın..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="w-24 bg-lamaPurple text-white p-2 rounded-lg transition-all duration-300 hover:bg-lamaSky"
                    disabled={loading}
                >
                    {loading ? "Yükleniyor..." : "Gönder"}
                </button>
            </form>
        </div>
    );
};

export default CommentForm;
