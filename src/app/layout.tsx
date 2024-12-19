import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Arf School Management Dashboard",
  description: "Next.js School Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) { 
  return (
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
      

      
  );
}
