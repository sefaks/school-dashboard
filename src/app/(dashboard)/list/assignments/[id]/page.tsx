import CommentForm from "@/components/forms/CommentForm";
import prisma from "@/lib/prisma";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { assignments, classes, comments, documents } from "@prisma/client";
import Image from "next/image";

const SingleAssignmentPage = async ({
    params: { id },
}: {
    params: { id: string };
}) => {
    const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

    let assignment:
        | (assignments & {
              assignment_class: Array<{
                  classes: classes;
              }>;
              assignment_document: Array<{
                  documents: documents;
              }>;
              comments: comments[]; // Yorumlar burada sadece basic comment objesi
          })
        | null = null;

    if (role === "admin" && institution_id) {
        assignment = await prisma.assignments.findUnique({
            where: { id: parseInt(id) },
            include: {
                assignment_class: {
                    where: {
                        classes: {
                            institution_id: parseInt(institution_id),
                        },
                    },
                    take: 1,
                    include: {
                        classes: true,
                    },
                },
                assignment_document: {
                    include: {
                        documents: true,
                    },
                },
                comments: true, // Sadece comment'ler çekilecek
            },
        });
    } else if (role === "teacher" && current_user_id) {
        assignment = await prisma.assignments.findUnique({
            where: { id: parseInt(id) },
            include: {
                assignment_class: {
                    where: {
                        classes: {
                            teacher_class: {
                                some: {
                                    teacher_id: parseInt(current_user_id),
                                },
                            },
                        },
                    },
                    include: {
                        classes: true,
                    },
                },
                assignment_document: {
                    include: {
                        documents: true,
                    },
                },
                comments: true, // Yine sadece comment'ler çekilecek
            },
        });
    }

    if (assignment && assignment.comments) {
        // İlk olarak, yorumlarda kullanılan user_id'leri toplamak
        const teacherIds = new Set<number>();
        const studentIds = new Set<number>();

        // Yorumlarda user_type'a göre id'leri ayırıyoruz
        assignment.comments.forEach(comment => {
            if (comment.user_type === "TEACHER") {
                teacherIds.add(comment.user_id);
            } else if (comment.user_type === "STUDENT") {
                studentIds.add(comment.user_id);
            }
        });

        // Kullanıcı bilgilerini toplamak
        const [teachers, students] = await Promise.all([
            prisma.teachers.findMany({
                where: {
                    id: {
                        in: Array.from(teacherIds),
                    },
                },
            }),
            prisma.students.findMany({
                where: {
                    id: {
                        in: Array.from(studentIds),
                    },
                },
            }),
        ]);

        // Kullanıcıları map yapmak
        const teacherMap = new Map(teachers.map(t => [t.id, t]));
        const studentMap = new Map(students.map(s => [s.id, s]));

        // Yorumları güncellemek ve her birine user bilgisi eklemek
        assignment.comments = assignment.comments.map(comment => {
            let user = null;

            // Öğretmen için user bilgisi ekliyoruz
            if (comment.user_type === "TEACHER") {
                user = teacherMap.get(comment.user_id);
            }

            // Öğrenci için user bilgisi ekliyoruz
            if (comment.user_type === "STUDENT") {
                user = studentMap.get(comment.user_id);
            }

            return { ...comment, user };
        });
    }

    
    return (
        <div className="flex flex-col xl:flex-row gap-4 p-4">
            {assignment ? (
                <>
                    {/* Sol Kısım: 2/3 */}
                    <div className="w-full xl:w-2/3 flex flex-col gap-4">
                        {/* Ödev Detayları */}
                        <div className="bg-white p-6 rounded-md shadow">
                            <div className="w-full flex flex-row items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-800">{assignment.header}</h1>
                                <div className="mt-4 flex flex-col gap-2">
                                    <div className="flex flex-row items-center gap-2">
                                                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>                      
                                    {new Date(assignment.start_date).toLocaleDateString("tr-TR")} - {new Date(assignment.deadline_date).toLocaleDateString("tr-TR")}
                                    </div>
                                   
                                </div>
                            </div>
                            <p className="text-md text-gray-500 mt-2">{assignment.description}</p>
                        </div>

                        <div className="bg-white p-6 rounded-md shadow">
                            <h2 className="text-lg font-semibold">Assigned Classes</h2>
                            <ul className="mt-4 space-y-2">
                                {assignment.assignment_class.map((classItem) => (
                                    <li key={classItem.classes.id} className="text-sm text-gray-700">
                                        {classItem.classes.class_code}
                                    </li>
                                ))}
                            </ul>
                        </div>

                      

                        {/* Yorumlar */}
                        <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
    <h2 className="text-xl font-semibold text-lamaPurple">Comments</h2>
    {assignment.comments.length > 0 ? (
        <ul className="mt-4 space-y-4">
            {assignment.comments.map((comment) => (
                <li key={comment.id} className="flex items-start space-x-4 border p-4 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300">
                    {/* Avatar */}
                    <Image
                        src={comment.user.photo || "/noAvatar.png"}
                        alt={`${comment.user.name} ${comment.user.surname}`}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    
                    {/* Yorum İçeriği */}
                    <div className="flex-1">
                        {/* Yorum Başlığı ve Kullanıcı Bilgisi */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                            <span
                                className={`text-sm font-medium ${
                                comment.user_type === "TEACHER" ? "text-black" : "text-black"
                                }`}
                            >
                                {comment.user.name} {comment.user.surname}
                            </span>
                            {comment.user_type === "TEACHER" && (
                                <span className="text-xs text-white bg-lamaPurple px-2 py-1 rounded-md">
                                Teacher
                                </span>
                            )}
                            </div>
                            <span className="text-xs text-gray-400">
                            {comment.created_at ? new Date(comment.created_at).toLocaleString("tr-TR") : ""}
                            </span>
                        </div>

                        {/* Yorum İçeriği */}
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>

                </li>
            ))}
        </ul>
    ) : (
        <p className="text-gray-500 mt-2">There is no comment yet.</p>
    )}

    {/* Yorum Ekleme Formu */}
    <div className="mt-4">
        {role === "teacher" && (
            <CommentForm assignmentId={id} userId={current_user_id} />
        )}
    </div>
</div>

                    </div>

                    {/* Sağ Kısım */}
                    <div className="w-full xl:w-1/3">

                          {/* Dokümanlar */}
                          <div className="bg-white p-6 rounded-md shadow">
                            <h2 className="text-lg font-semibold text-lamaRed">Documents</h2>
                            {assignment.assignment_document.length > 0 ? (
                                <ul className="mt-4 space-y-2">
                                    {assignment.assignment_document.map((docItem) => (
                                        <li
                                            key={docItem.documents.id}
                                            className="flex items-center gap-2 text-gray-700 text-sm"
                                        >
                                            <i className="fas fa-file text-gray-500"></i>
                                            <span>{docItem.documents.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 mt-2">No document has been assigned for this assignment.</p>
                            )}
                        </div>
                        
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-500">
                    Ödev bulunamadı veya erişim yetkiniz yok.
                </div>
            )}
        </div>
    );
};

export default SingleAssignmentPage;
