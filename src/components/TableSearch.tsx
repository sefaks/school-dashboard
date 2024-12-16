"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const TableSearch = () => {

  const router = useRouter();

  // we create a function that will be called when the form is submitted
  // this function will change the query params of the url
  const handleSubmit=(e:React.FormEvent<HTMLFormElement>)=>{

    e.preventDefault(); // we prevent the default behavior of the form, which is to refresh the page
    const value = (e.currentTarget[0] as HTMLInputElement).value; // we get the value of the input

    const params=new URLSearchParams(window.location.search); // we get the query params
    params.set("search", value); // we set the page to the query params
    router.push(`${window.location.pathname}?${params}`); // we push the new query params to the url
  }
  return (
    <form 
    onSubmit={handleSubmit} // we call the function when the form is submitted
    className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </form>
  );
};

export default TableSearch;