'use client';

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

const Pagination = ({page,count}:{page:number,count:number}) => {

    const router = useRouter();

    const hasPrev = ITEM_PER_PAGE * (page-1) > 0;
    const hasNext = ITEM_PER_PAGE * (page-1) + ITEM_PER_PAGE < count;
    
    const changePage = (page:number) => {
      const params = new URLSearchParams(window.location.search); // we get the query params
      params.set("page", page.toString()); // we set the page to the query params
      
      router.push(`${window.location.pathname}?${params}`); // we push the new query params to the url


    }
    return (
      <div className="p-4 flex items-center justify-between text-gray-500">
        <button
          onClick={() => changePage(page - 1)}
          disabled = {!hasPrev}
          className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >

          Prev
        </button>
        <div className="flex items-center gap-2 text-sm">

          {Array.from({length:Math.ceil(count/ITEM_PER_PAGE)},(_,i)=>i+1).map((item)=>(
            <button onClick={()=>changePage(item)}
            key={item}
            className={`px-2 rounded-sm ${
              item === page ? "bg-lamaSky" : "bg-slate-200"
            }`}
          >
            {item}
            
            </button>
          ))}
        
        </div>
        <button 
        onClick={()=>changePage(page+1)}
        disabled={!hasNext}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
       
      </div>
    );
  };
  
  export default Pagination;