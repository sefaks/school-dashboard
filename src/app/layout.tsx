import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Session } from "@clerk/nextjs/server";
import SessionExpiryModal from "@/components/SessionExpiryModal";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Arf School Management Dashboard",
  description: "Next.js School Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (

    <Providers>
    
        <html lang="en">
          <body className={inter.className}>
          <SessionExpiryModal />
              {children}  <ToastContainer position="bottom-right" theme="dark" />
          </body>
        </html>  
      </Providers>
 
  );
}