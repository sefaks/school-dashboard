"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RedirectButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/admin/schedule/create")}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
    >
      <Image src="/add.png" alt="Ekle" width={14} height={14} />
    </button>
  );
}
