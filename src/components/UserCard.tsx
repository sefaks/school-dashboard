

const UserCard = ({ type }: { type: string }) => {

    // odd:bg-[] is a tailwindcss class that sets the background color of the div to the color of the array at the index of the number
    // text color white in tailwindcss is text-white
    // capitalize is a tailwindcss class that capitalizes the text, it is used to uppercase the first letter of the type prop
  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaBlue p-4 flex-1  text-black min-w-[130px]">
        <div className="flex justify-between items-center">
            <span className="text-[10px] bg-white px-2 py-1 rounded-full text-black">2024/2025</span>
            <img src="/more.png" alt="" width={20} height={20} />
        </div>
        <h1 className="text-2xl font-semibold my-4">1,245</h1>
        <h1 className="capitalize text-sm font-medium text-white-500">{type}</h1>
    </div>
  );
}

export default UserCard;