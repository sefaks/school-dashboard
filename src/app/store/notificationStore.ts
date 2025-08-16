// store/notificationStore.ts
import { create } from 'zustand';

// Store'un state tipini tanımla
interface NotificationState {
  isModalOpen: boolean;
  notifications: any[]; // Notification tipinize göre düzenleyin
  openModal: () => void;
  closeModal: () => void;
}

// Store'u doğru tiplerle oluştur
export const useNotificationStore = create<NotificationState>((set) => ({
  isModalOpen: false,
  notifications: [],
  
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));