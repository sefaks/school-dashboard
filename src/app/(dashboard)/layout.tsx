import Menu from "@/components/Menu";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ 
    children }
    :Readonly< { children: React.ReactNode }>) {
        
        // in the below, the left side is 14% of the screen and the right side is 86% of the screen. Its changed for different screen sizes. This library is called tailwindcss.
        // lg:block means that the logo will be shown on screens larger than large.
        // the link is used to navigate to the home page.
        // overflow-scroll is used to make the page scrollable.
        // navbar children is used to display the navbar on the page for each page.
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

