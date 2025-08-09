
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Loading from '../../loading';

const Page = () => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session } = useSession(); // Get the session (which includes the token)
    const [contentProgress, setContentProgress] = useState([]);
    const [testProgress, setTestProgress] = useState([]);

    // id from the URL, last segment of id is grade, before that is student_id
    const { searchParams } = new URL(window.location.href);
    const student_id = searchParams.get('student_id');
    const grade = searchParams.get('grade');
    


    useEffect(() => {
        const fetchContentProgress = async () => {
            try {
                const response = await fetch(`/teachers/students/${student_id}/content-progress`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.user.accessToken}`, 
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch progress data');
                }

                const data = await response.json();
                setContentProgress(data);
            } catch (error) {
                console.error('Error fetching progress:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchContentProgress();
    }
    , [student_id, session?.user.accessToken]); 

    useEffect(() => {
        const fetchTestProgress = async () => {
            try {
                const response = await fetch(`/teachers/students/${student_id}/test-progress`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.user.accessToken}`, 
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch progress data');
                }

                const data = await response.json();
                setTestProgress(data);
            } catch (error) {
                console.error('Error fetching progress:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTestProgress();
    }
    , [student_id, session?.user.accessToken]); 

    const handleBackClick = () => {
        router.back();
    };

    if (loading) {
        return (
           <Loading />
        );
    }


}