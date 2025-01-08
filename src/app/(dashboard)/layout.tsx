import Menu from "@/components/Menu";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SessionExpiryModal from "@/components/SessionExpiryModal";

export default function DashboardLayout({ 
    children }
    :Readonly< { children: React.ReactNode }>) {
    
    return (
        <div className="h-screen flex">

            {/* LEFT */}
            <div className="w-[14%] md:w[8%] lg:w-[16%] xl:w-[14%] p-4 ">

                <Link href="/" className="flex items-center justify-center gap-2 lg:justify-start ">
                    <span className="hidden lg:block font-bold">Arf Management</span>
                </Link>
                <Menu/>
            
            </div> 
                
            {/* RIGHT */}
            <div className="w-[86%] md:[92%] lg:w-[86%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll ">
                <Navbar />
                {children}
            </div>
                
            
        </div>
    )
}

