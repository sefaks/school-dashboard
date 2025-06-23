"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

const RecentAssignments = ({ language = 'tr' }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const session = useSession();
  const router = useRouter();
  
  // Veri çekme işlemi
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        console.log('Requesting last three assignment submissions');
        const response = await apiClient.get('/teachers/me/last-three-assignment-submissions',
                {
                    headers: {
                    Authorization: `Bearer ${session.data?.user.accessToken}`,
                    },
                }
            );        
        console.log('Son gönderilen ödevler:', response.data);
          setAssignments(response.data);
          setLoading(false);
        
      } catch (error) {
        console.error('Ödevler yüklenirken hata oluştu:', error);
        setAssignments([]);
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [session]);
  
  // Ödevi görüntüleme işlevi
  const handleViewAssignment = (assignmentId) => {
    if (assignmentId === 'all') {
      router.push('/assignments');
    } else {
      router.push(`/assignments/${assignmentId}`);
    }
  };

  return (
    <div className="bg-white rounded-md p-4 shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Son Teslim Edilen Ödevler</h3>
        
        <button 
          onClick={() => handleViewAssignment('all')}
          className="text-[#514EF3] text-sm font-medium hover:underline flex items-center"
        >
          Tümünü Gör
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#514EF3]"></div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Henüz gönderilmiş ödev bulunmamaktadır.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.slice(0, 3).map((assignment, index) => {
            
            return (
              <div 
                key={assignment.id || index} 
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar veya ödev ikonu */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {assignment.student_avatar ? (
                      <Image 
                        src={assignment.student_avatar} 
                        width={40} 
                        height={40} 
                        alt={assignment.student_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#514EF320] text-[#514EF3] font-semibold">
                        {assignment.student_name?.charAt(0) || 'Ö'}
                      </div>
                    )}
                  </div>
                  
                  {/* Ödev bilgileri */}
                  <div>
                    <h4 className="font-medium text-gray-900 line-clamp-1">
                      {assignment.assignment_name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="line-clamp-1">{assignment.student_name}</span>
                      <span className="mx-1">•</span>
                      <span className="whitespace-nowrap">{assignment.submitted_at ? new Date(assignment.submitted_at).toLocaleDateString("tr-TR") : 'Tarih bilgisi yok'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  
                  {/* Görüntüleme butonu */}
                  <button
                    onClick={() => handleViewAssignment(assignment.id)}
                    className="ml-2 p-2 rounded-md text-gray-600 hover:bg-gray-100"
                    aria-label="Ödevi görüntüle"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentAssignments;