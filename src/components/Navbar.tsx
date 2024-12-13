
//rounded full is a tailwindcss class that makes the div rounded, its rounded on all sides
// w-7 and h-7 are tailwindcss classes that set the width and height of the div to 7 
// gap-6 is a tailwindcss class that sets the gap between the divs to 6
// -top-3 is a tailwindcss class that sets the top of the div to -3, that means it will be 3 pixels above the top of the div
// ring-1 is a tailwindcss class that sets the ring around the div to 1 pixel, the ring is the border around the div


const Navbar = () => {
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
                <img src="/avatar.png" alt="" width={36} height={36} className="rounded-full" />
            </div>

        </div>
    );
    }

export default Navbar;
