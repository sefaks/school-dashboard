

'use client'; 
import Image from "next/image";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CgLogOut, CgProfile } from "react-icons/cg";
import { authOptions } from '@/app/auth';
import { getSession, signOut, useSession } from 'next-auth/react';


const Navbar =  () => {

    const { data: session, status } = useSession();
    const role = session?.user.role;

    const router = useRouter();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null); // Dropdown menüsünü referans olarak tutar

    const [language, setLanguage] = useState<string>(() => {
        const savedLanguage = localStorage.getItem("language");
        return savedLanguage ? savedLanguage : "en"; // Default to English
      });


    const handleLogout = () => {
        // NextAuth ile logout işlemi
        signOut({
            redirect: false,  // Yönlendirme yapılmasın
            callbackUrl: '/auth/login',  // Çıkış yaptıktan sonra yönlendirilecek URL
        }).then(() => {
            // Logout işlemi başarılı ise yönlendirme yap
            router.push('/auth/login');
        });
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

    const handleLanguageSwitch = () => {
        const newLanguage = language === "en" ? "tr" : "en";
        localStorage.setItem("language", newLanguage);
        setLanguage(newLanguage);
        // reload the page to apply the new language
        window.location.reload();
      };


    const role_turkish = (role: string) => {
        if (role === 'admin') {
            return 'Yönetici';
        } else if (role === 'teacher') {
            return 'Öğretmen';
        } else if (role === 'student') {
            return 'Öğrenci';
        } else {
            return 'Rol bilinmiyor';
        }
    }



    return (
        <div className="flex items-center justify-between p-4">
            {/* SEARCHBAR */}
            <div className="hidden md:flex items-center gap-2 text-cs rounded-full ring-[1.5px] ring-array-300 px-2">
                <img src="/search.png" alt="" width={14} height={14} />
                <input className="w-[200px] p-2 bg-transparent outline-none" type="text" placeholder="Search..." />
            </div>

            {/* ICONS AND USER */}
            <div className="flex items-center gap-6 justify-end w-full">
            <div className="items-center lg:flex hidden mr-[30px] flex-shrink-0 cursor-pointer" onClick={handleLanguageSwitch}>
            <Image
              width={20}
              height={20}
              src={language === "en" ? "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" : "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg"}
              alt="flag"
              className="w-5 h-5 rounded-full mr-1"
            />
            <span className="font-semibold text-[13px] leading-[20px] text-[#374557]">
              {language === "en" ? "Eng (US)" : "Türkçe (TR)"}
            </span>
            <Image
              width={7.46}
              height={4.5}
              src="/downArrow.svg"
              alt="dropdown"
              className="rounded-full ml-3"
            />
          </div>
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer ">
                    <img src="/message.png" alt="" width={20} height={20} />
                </div>
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
                    <img src="/announcement.png" alt="" width={20} height={20} />
                    <div className="absolute -top-3 -right-3 h-5 w-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">1 </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs leading-3 font-medium">{session?.user.name}</span>
                    <span className="test-[10px] text-gray-500 text-right">{role_turkish(session?.user.role ?? '')}</span>
                </div>
                <button onClick={toggleDropdown}>
                    <img className="rounded-full" src="/avatar.png" alt="" width={40} height={40} />

                {/* Dropdown Menü */}
                {isDropdownOpen && (
                    <div  className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg z-10">
                        <ul className="flex flex-col items-center justify-start">
                            <li className=" py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer flex jusfify-start flex-row items-center gap-2" onClick={() => router.push('/my-profile')}>
                                Profilim
                                <CgProfile color='bg-Purple' size={20}/>
                            </li>
                            <li className=" py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer flex justify-start flex-row items-center gap-2" onClick={handleLogout}>
                                Çıkış Yap
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
