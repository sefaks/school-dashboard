import AssignmentTests from "@/components/AssignmentPage/AssignmentTests";
import DownloadDocumentButton from "@/components/DownloadDocumentButton";
import SubmissionFeedbackForm from "@/components/SubmissionFeedbackForm";
import CommentForm from "@/components/forms/CommentForm";
import EditCommentForm from "@/components/forms/EditCommentForm";
import prisma from "@/lib/prisma";
import { getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { assignments, classes, comments, documents, tests } from "@prisma/client";
import { DateTime } from "luxon";
import Image from "next/image";
import { FaFilePdf } from "react-icons/fa";

const SingleAssignmentPage = async ({
    params: { id },
}: {
    params: { id: string };
}) => {
    const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

    
    interface Documents {
        id: number;
        name: string;
        url: string;
    }
    
    interface Classes {
        id: number;
        class_code: string;
        grade: number;
        institution_id: number;
    }
    
    interface Tests {
        id: number;
        name: string;
        test_no: number;
    }
    
    interface Comments {
        id: number;
        content: string;
        user_type: string;
        user_id: number;
        created_at: DateTime;
        user: {
            name: string;
            surname: string;
            photo: string | null;
        } | null;
    }
    
    interface StudentSubmission {
        id: number;
        submitted_at: DateTime | null;
        documents: Documents[];
        assignment_id: number;
        score: number | null;
        feedback: string | null;
        is_graded: boolean;
    }
    
    interface Student {
        id: number;
        name: string;
        surname: string;
        student_submissions: StudentSubmission[];
    }
    
    // Ana assignment interface'i
    interface Assignment {
        id: number;
        start_date: Date;
        deadline_date: Date;
        assignee_id: number | null;
        assignee_type: string;
        description: string | null;
        status: string;
        header: string | null;
        subject_id: number | null;
        assignment_class: Array<{
            classes: Classes;
            assignment_id: number;
            class_id: number;
        }>;
        assignment_document: Array<{
            documents: Documents;
            assignment_id: number;
            document_id: number;
        }>;
        assignment_student: Array<{
            students: Student;
            assignment_id: number;
            student_id: number;
        }>;
        assignment_test: Array<{
            tests: Tests;
            assignment_id: number;
            test_id: number;
        }>;
        comments: Comments[];
    }
    
    // Prisma sorgusu
    let assignment: Assignment | null = null;
    
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
                //get assignment_student from assignment_student table
                assignment_student: {
                    include: {
                        students: {
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                                student_submissions: {
                                    select: {
                                        id: true,
                                        submitted_at: true,
                                        assignment_id: true,
                                        feedback: true,
                                        score: true,
                                        is_graded: true,
                                        documents: {
                                            select: {
                                                name: true,
                                                url: true,
                                                id: true,
                                            },
                                        },
                                    },
                                    orderBy: {
                                        submitted_at: "desc",
                                    },
                                },
                            },
                        },
                    },
                },

                assignment_test: {
                    include: {
                        tests: {
                            select: {
                                id: true,
                                name: true,
                                test_no: true,
                            },
                        },
                    },
                },



                comments: true,
            },
        }) as Assignment | null;
    } else if (role === "teacher" && current_user_id) {
        assignment = await prisma.assignments.findUnique({
            where: { id: parseInt(id) },
            include: {
               
                assignment_document: {
                    include: {
                        documents: true,
                    },
                },
                assignment_student: {
                    include: {
                        students: {
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                                student_submissions: {
                                    select: {
                                        id: true,
                                        submitted_at: true,
                                        assignment_id: true,
                                        feedback: true,
                                        score: true,
                                        is_graded: true,
                                        documents: {
                                            select: {
                                                name: true,
                                                url: true,
                                                id: true,
                                            },
                                        },
                                    },
                                    orderBy: {
                                        submitted_at: "desc",
                                    },
                                },
                            },
                        },
                    },
                },
                comments: true,
                assignment_test: {
                    include: {
                        tests: {
                            select: {
                                id: true,
                                name: true,
                                test_no: true,
                            },
                        },
                    },
                },
               
                assignment_class: {
                        include: {
                            classes: {
                                select: {
                                    id: true,
                                    class_code: true,
                                },
                            }
                        },
                    },

        }
        }) as Assignment | null;
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
            let user: { name: string; surname: string; photo: string | null } | null = null;
        
            // Öğretmen için user bilgisi ekliyoruz
            if (comment.user_type === "TEACHER") {
                const teacher = teacherMap.get(comment.user_id);
                if (teacher) {
                    user = {
                        name: teacher.name ?? "Bilinmiyor",
                        surname: teacher.surname ?? "Bilinmiyor",
                        photo: teacher.photo ?? null,
                    };
                }
            }
        
            // Öğrenci için user bilgisi ekliyoruz
            if (comment.user_type === "STUDENT") {
                const student = studentMap.get(comment.user_id);
                if (student) {
                    user = {
                        name: student.name ?? "Bilinmiyor",
                        surname: student.surname ?? "Bilinmiyor",
                        photo: student.photo ?? null,
                    };
                }
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
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>  
                                    <span className="text-md"> {new Date(assignment.start_date).toLocaleDateString("tr-TR")} - {new Date(assignment.deadline_date).toLocaleDateString("tr-TR")} </span>
                                    </div>
                                   
                                </div>
                            </div>
                            <p className="text-md text-gray-500 mt-2">{assignment.description}</p>
                        </div>

                        <div className="bg-white p-6 rounded-md shadow">
                            <h2 className="text-lg font-semibold">Atanan Sınıflar</h2>
                            <ul className="mt-4 space-y-2">
                                {assignment.assignment_class.map((classItem) => (
                                    <li key={classItem.classes.id} className="text-sm text-gray-700">
                                        {classItem.classes.class_code}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Öğrenciler */}
        <div className="bg-white p-6 rounded-md shadow relative ">
        <h2 className="text-lg font-semibold">Öğrenci Teslimler</h2>
        
            <table className="w-full mt-4 min-w-[600px]">
                <thead>
                <tr className="bg-gray-100 text-left">
                    <th className="p-2 text-sm sm:text-base">Öğrenci</th>
                    <th className="p-2 text-sm sm:text-base">Durum</th>
                    <th className="p-2 text-sm sm:text-base">Teslim Tarihi</th>
                    <th className="p-2 text-sm sm:text-base">Döküman</th>
                    <th className="p-2 text-sm sm:text-base">Not ve Geri Bildirim</th>

                </tr>
                </thead>
                <tbody>
                {assignment.assignment_student.map((studentItem) => (
                    <tr key={studentItem.students.id} className="border-b">
                    {/* Öğrenci Bilgisi */}
                    <td className="p-2 whitespace-nowrap">
                        {studentItem.students.name} {studentItem.students.surname}
                    </td>

                    {/* Teslim Durumu */}
                    <td className="p-2 text-sm sm:text-base ">
                        <span className="sm:hidden"> {/* Mobilde kısa versiyon */}
              {studentItem.students.student_submissions
                .filter(submission => submission.assignment_id === parseInt(id))
                [0]?.submitted_at ? "✓" : "✗"}
            </span>
            <span className="hidden sm:inline"> {/* Normalde tam metin */}
              {studentItem.students.student_submissions
                .filter(submission => submission.assignment_id === parseInt(id))
                [0]?.submitted_at ? "Teslim Edildi" : "Teslim Edilmedi"}
            </span>
                    </td>

                    {/* Teslim Tarihi */}
                    <td className="p-2">
                        {(() => {
                            const latestSubmission = studentItem.students.student_submissions
                                .filter(submission => submission.assignment_id === parseInt(id))
                                .sort((a, b) => {
                                    if (!a.submitted_at || !b.submitted_at) return 0;
                                    return new Date(b.submitted_at.toString()).getTime() - new Date(a.submitted_at.toString()).getTime();
                                })[0];

                            if (!latestSubmission?.submitted_at) {
                                return "Belirtilmemiş";
                            }

                            // submitted_at'i Date objesine çevirip kullanıyoruz
                            return new Date(latestSubmission.submitted_at.toString()).toLocaleDateString("tr-TR");
                        })()}
                        </td>

                         {/* Dokümanlar */}
                         <td className="p-2">
                            {studentItem.students.student_submissions
                                .filter(submission => submission.assignment_id === parseInt(id))
                                .sort((a, b) => {
                                // Null check yapıyoruz
                                if (!a.submitted_at || !b.submitted_at) return 0;
                                // Tarihleri getTime() ile milisaniye cinsinden karşılaştırıyoruz
                                return new Date(b.submitted_at.toString()).getTime() - new Date(a.submitted_at.toString()).getTime();
                                }).length > 0 ? (
                                (() => {
                                // En son tarihli submission'ı alıyoruz
                                const latestSubmission = studentItem.students.student_submissions
                                    .filter(submission => submission.assignment_id === parseInt(id))
                                    .sort((a, b) => {
                                    if (!a.submitted_at || !b.submitted_at) return 0;
                                    return new Date(b.submitted_at.toString()).getTime() - new Date(a.submitted_at.toString()).getTime();
                                    })[0];


                                return latestSubmission.documents.length > 0 ? (
                                    <div className="flex flex-wrap mb-2">
                                        {latestSubmission.documents.map((doc, docIndex) => {
                                            // Doküman adını kısaltma
                                            const maxNameLength = 10; // Maksimum karakter sayısı
                                            const shortenedName =
                                                doc.name.length > maxNameLength
                                                    ? doc.name.substring(0, maxNameLength) + "..."
                                                    : doc.name;

                                            return (
                                                <DownloadDocumentButton
                                                    key={docIndex}
                                                    documentId={doc.id}
                                                    assignmentId={parseInt(id)} // Ödev ID'si
                                                    teacherId={parseInt(current_user_id)} // Kullanıcı ID'si
                                                    documentName={shortenedName} // Kısaltılmış doküman adı
                                                    downloadType="submission" // Öğrenci Teslim Dokümanları için
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <span>Döküman Yok</span>
                                );
                            })()
                        ) : (
                            <span>Döküman Yok</span>
                        )}
                    </td>


                        
                       

                    <td className="p-2 flex flex-col xs:flex-row items-start xs:items-center gap-1">
{studentItem.students.student_submissions
    .filter((submission) => submission.assignment_id === parseInt(id)) // Bu assignment'a ait olan submissions'ı filtreliyoruz
    .sort((a, b) => {
        const dateA = a.submitted_at ? new Date(a.submitted_at.toString()) : new Date(0);
        const dateB = b.submitted_at ? new Date(b.submitted_at.toString()) : new Date(0);
        return dateB.getTime() - dateA.getTime(); // En son teslimatı almak için tarihe göre sıralama
    })[0] && (  // İlk öğe (en son teslimat) alınıyor
    <>
      <div className="relative"> {/* wrapper div eklendi */}
        <div className="flex items-center gap-1">
          {/* Her öğrencinin doğru teslimatını ve geri bildirimini almak için şu şekilde düzenliyoruz */}
        <SubmissionFeedbackForm
            submissionId={studentItem.students.student_submissions
                .filter((submission) => submission.assignment_id === parseInt(id))[0]?.id.toString()}
            currentScore={parseInt(studentItem.students.student_submissions
                .filter((submission) => submission.assignment_id === parseInt(id))[0]?.score?.toString() || "")}
            currentFeedback={studentItem.students.student_submissions
                .filter((submission) => submission.assignment_id === parseInt(id))[0]?.feedback || ""}
            currentStudentName={`${studentItem.students.name} ${studentItem.students.surname}`}
        />

          {studentItem.students.student_submissions
            .filter((submission) => submission.assignment_id === parseInt(id))[0]?.is_graded && (
            <span className="text-green-600" title="Değerlendirme tamamlandı">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
                        )}
                        </div>
                    </div>
                    </>
                )}
                </td>
            </tr>
                ))}
        </tbody>
    </table>
            </div>
                        {/* Yorumlar */}
    <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
                    <h2 className="text-xl font-semibold text-lamaPurple">Yorumlar</h2>
                    {assignment.comments.length > 0 ? (
                        <ul className="mt-4 space-y-4">
                            {assignment.comments.map((comment) => (
                                <li key={comment.id} className="flex items-start space-x-4 border p-4 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300">
                                    {/* Avatar */}
                                    <Image
                                        src={comment.user?.photo || "/noAvatar.png"}
                                        alt={`${comment.user?.name} ${comment.user?.surname}`}
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
                                                    {comment.user && comment.user.name} {comment.user && comment.user.surname}
                                                </span>
                                                {comment.user_type === "TEACHER" && (
                                                    <span className="text-xs text-white bg-lamaPurple px-2 py-1 rounded-md">
                                                    Teacher
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {comment.created_at ? new Date(String(comment.created_at)).toLocaleString("tr-TR") : ""}
                                            </span>
                                        </div>
                                                    <EditCommentForm
                                                    commentId={comment.id}
                                                    initialContent={comment.content}
                                                    isOwner={comment.user_id === Number(current_user_id) && comment.user_type === "TEACHER"} 
                                                    />
                                        {/* Yorum İçeriği */}
                                        <p className="text-gray-700 text-sm">{comment.content}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 mt-2">Henüz bir yorum yapılmamış.</p>
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
                    <div className="w-full xl:w-1/3  flex flex-col gap-4">

                          {/* Dokümanlar */}
                          <div className="bg-white p-4 rounded-md shadow">
                            <h2 className="text-lg font-semibold text-lamaRed">Dokümanlar</h2>
                            {assignment.assignment_document.length > 0 ? (
                               <ul className="mt-4 space-y-2">
                               {assignment.assignment_document.map((docItem) => (
                                 <DownloadDocumentButton
                                    downloadType="assignment"
                                   key={docItem.documents.id}
                                   documentId={docItem.documents.id}
                                   assignmentId={parseInt(id)} // assignment.id'yi parent component'ten alıyoruz
                                   teacherId={parseInt(current_user_id)} // current_user_id prop olarak gelmeli
                                   documentName={docItem.documents.name}
                                 />
                               ))}
                             </ul>
                            ) : (
                                <p className="text-gray-500 text-sm mt-2 p-2">Henüz bir doküman bu ödeve eklenmemiş.</p>
                            )}
                        </div>

                        {/* Testler */}
                    <AssignmentTests 
                    assignment={assignment} 
                    />

                        


                        
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
