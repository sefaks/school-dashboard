// components/NotificationLayout.tsx
"use client";

import { useNotificationStore } from "@/app/store/notificationStore";
import NotificationsModal from "./NotificationModal";



export default function NotificationLayout({ children }: { children: React.ReactNode }) {
  const { isModalOpen } = useNotificationStore();
  
  return (
    <div className="relative">
      {/* Ana içerik - modal açıkken blur efekti uygular */}
      <div
        className={`transition-all duration-300 ${
          isModalOpen ? 'blur-sm brightness-75' : ''
        }`}
      >
        {children}
      </div>
      
      {/* Bildirim modalı - sadece açıkken göster */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <NotificationsModal />
          </div>
        </div>
      )}
    </div>
  );
}