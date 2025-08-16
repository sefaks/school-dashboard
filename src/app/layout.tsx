// app/layout.tsx (server component)
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AccountActivationModal from "@/components/AccountActivationModal";
import SessionExpiryModal from "@/components/SessionExpiryModal";
import NotificationLayout from "@/components/NotificationLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Arf - Okul",
  description: "Next.js School Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <html lang="en">
        <body className={inter.className}>
          <AccountActivationModal />
          <SessionExpiryModal />
          <NotificationLayout>
            {children}
          </NotificationLayout>
          <ToastContainer position="bottom-right" theme="dark" />
        </body>
      </html>
    </Providers>
  );
}