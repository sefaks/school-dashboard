// components/dashboardComponents/NotificationsModal.jsx
"use client";
import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '@/app/store/notificationStore';
import { Bell, Check, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '@/lib/apiClient';
import { useSession } from 'next-auth/react';

const NotificationsModal = () => {
  const { closeModal } = useNotificationStore();
  const [notifications, setNotifications] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    // Bildirimleri API'den al
    const fetchNotifications = async () => {
      try {
        console.log("Fetching notifications...");
        const role = session?.user?.role;
        let response;
        if (role && role== 'teacher'){
            response = await apiClient.get(`teachers/me/notifications`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.accessToken}`,
                },
                });
            console.log("Notifications response:", response.data);

        }
        else if (role && role == 'admin') {
            response = await apiClient.get(`admins/me/notifications`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.accessToken}`,
                },
            });
            console.log("Notifications response:", response.data);
        }
        else {
            console.error("Unknown role:", role);
            return;
        }
       
        
        if (response && response.status === 200) {
            setNotifications(response.data.notifications || []);
            console.log("Notifications", notifications);
        }
      } catch (error) {
        console.error('Bildirimler alınırken hata oluştu:', error);
      }
    };
    
    fetchNotifications();
  }, [session?.user?.accessToken, session?.user?.role]);

    // Okundu olarak işaretleme fonksiyonu
    const onRead = async (notificationId:number) => {
    try {
      console.log("Marking notification as read:", notificationId);
      console.log("Session access token:", session?.user?.accessToken);
      const response = await apiClient.post(`teachers/me/notifications/${notificationId}/read`, 
        {}, // body yoksa boş obje
      {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        });

      if (response.status === 200) {
        setNotifications((prev) => 
          prev.map((notif) => 
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        toast.success('Bildirim okundu olarak işaretlendi.');
      }
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata oluştu:', error);
    }
    }

    const onDelete = async (notificationId:number) => {
    try {
        const response = await apiClient.delete(
            `teachers/me/notifications/${notificationId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user?.accessToken}`,
              },
            }
          );
          
        
      if (response.status === 200) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));

        // silinme bildirimi ver
        toast.success('Bildirim başarıyla silindi!');
      }
    } catch (error) {
      console.error('Bildirim silinirken hata oluştu:', error);
    }
    }


  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 mb-4">
            <Bell className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold">Bildirimler</h2>
        </div>          <button 
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 border rounded-lg ${notification.is_read ? 'bg-gray-100' : 'bg-blue-50 border-blue-200'}`}
              >
                <p className="text-sm">
                <strong>{notification.content.split(":")[0]}</strong>{":"}
                {notification.content.split(":").slice(1).join(" ")}
                </p>
                <div className='flex flex-row justify-between'>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.date).toLocaleString()}
                </p>
                <div className="flex gap-3 mt-2">
                     {/* Okundu işareti */}
                     {!notification.is_read && (
                        <button
                        onClick={() => onRead(notification.id)}
                        className="flex items-center text-green-600 hover:text-green-800"
                        >
                        <Check size={18} />
                        <span className="ml-1 text-xs">Okudum</span>
                        </button>
                        )}

                    {/* Silme butonu */}
                    <button
                    onClick={() => onDelete(notification.id)}
                    className="flex items-center text-red-600 hover:text-red-800"
                    >
                    <Trash2 size={18} />
                    <span className="ml-1 text-xs">Sil</span>
                    </button>
                </div>

                </div>
               
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Bildirim bulunmuyor</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;