import { authOptions } from "@/app/auth";
import {getRoleAndUserIdAndInstitutionId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MENÜ",
    items: [
      {
        icon: "/home.png",
        label: "Ana Sayfa",
        href: "/",
        visible: ["admin", "teacher", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "Öğretmenler",
        href: "/list/teachers",
        visible: ["admin",],
      },
      {
        icon: "/student.png",
        label: "Öğrenciler",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/class.png",
        label: "Sınıflar",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Dersler",
        href: "/list/resources?redirectTo=lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "Sınavlar",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Ödevler",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/calendar.png",
        label: "Takvimler",
        href: "/list/schedules",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/attendance.png",
        label: "Yoklama",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/parent.png",
        label: "Veliler",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "Testler",
        href: "/list/resources?redirectTo=tests",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/message.png",
        label: "Mesajlar",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Duyurular",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "HESAP",
    items: [
      {
        icon: "/profile.png",
        label: "Profilim",
        href: "/my-profile",
        visible: [ "teacher", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Ayarlar",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      }
    ],
  },
];

const Menu = async () => {

  const { role, current_user_id, institution_id } = await getRoleAndUserIdAndInstitutionId();

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role ?? "")) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;