
//rounded full is a tailwindcss class that makes the div rounded, its rounded on all sides
// w-7 and h-7 are tailwindcss classes that set the width and height of the div to 7 
// gap-6 is a tailwindcss class that sets the gap between the divs to 6
// -top-3 is a tailwindcss class that sets the top of the div to -3, that means it will be 3 pixels above the top of the div
// ring-1 is a tailwindcss class that sets the ring around the div to 1 pixel, the ring is the border around the div

'use client'; // Bu satır, bileşeni istemci bileşeni olarak işaretler

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CgLogOut, CgProfile } from "react-icons/cg";


const Navbar = () => {

    // nextjs router

    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null); // Dropdown menüsünü referans olarak tutar


    const handleLogout = () => {
        // Çerezleri temizleme
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        
        // Kullanıcıyı login sayfasına yönlendirme
        router.push('/login');
    };

    // Dropdown menüsünü açıp kapatma fonksiyonu
    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);

        // Dropdown menüsü açıldığında, dışarıya tıklanırsa kapatma işlemi
        if (isDropdownOpen) {
            setIsDropdownOpen(false);
        }




    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        // Dışarıya tıklanmasını dinle
        document.addEventListener('mousedown', handleClickOutside);

        // Temizleme işlemi
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



    return (
        <div className="flex items-center justify-between p-4">
            {/* SEARCHBAR */}
            <div className="hidden md:flex items-center gap-2 text-cs rounded-full ring-[1.5px] ring-array-300 px-2">
                <img src="/search.png" alt="" width={14} height={14} />
                <input className="w-[200px] p-2 bg-transparent outline-none" type="text" placeholder="Search..." />
            </div>

            {/* ICONS AND USER */}
            <div className="flex items-center gap-6 justify-end w-full">
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer ">
                    <img src="/message.png" alt="" width={20} height={20} />
                </div>
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
                    <img src="/announcement.png" alt="" width={20} height={20} />
                    <div className="absolute -top-3 -right-3 h-5 w-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">1 </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs leading-3 font-medium">Sefa Kose</span>
                    <span className="test-[10px] text-gray-500 text-right" >Admin</span>
                </div>
                <button onClick={toggleDropdown}>
                    <img className="rounded-full" src="/avatar.png" alt="" width={40} height={40} />

                {/* Dropdown Menü */}
                {isDropdownOpen && (
                    <div  className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg z-10">
                        <ul className="flex flex-col items-center justify-start">
                            <li className=" py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer flex jusfify-start flex-row items-center gap-2" onClick={() => router.push('/profile')}>
                                Profile
                                <CgProfile color='bg-Purple' size={20}/>
                            </li>
                            <li className=" py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer flex justify-start flex-row items-center gap-2" onClick={handleLogout}>
                                Logout
                                <CgLogOut color='bg-Purple' size={20} />
                            </li>
                        </ul>
                    </div>
                )}
            </button>


        </div>
    </div>
    );
    }

export default Navbar;
