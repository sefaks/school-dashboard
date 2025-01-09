'use client';

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import path from "path";

const SessionExpiryModal = () => {
  const [showModal, setShowModal] = useState(false); // Modal'ın gösterilip gösterilmeyeceği
  const [isExpiring, setIsExpiring] = useState(false); // Oturum süresi dolmak üzere mi? Eğer true ise, oturum süresi dolmak üzere yazısı gösterilecek
  const { data: session, status } = useSession(); // Bu hook ile oturum bilgilerini alıyoruz. NextAuth tarafından sağlanıyor ve oturum bilgilerini içeriyor
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/new-user';


  useEffect(() => { // burada use effect hookunu kullanıyoruz çünkü sayfa yüklendiğinde oturum süresi kontrolü yapmak istiyoruz.
    // Login sayfasındaysa modal'ı gösterme
    if (isAuthPage || status === 'loading') {
      setShowModal(false);
      return;
    }
    const checkSessionExpiry = () => {
      if (!session || status !== 'authenticated') { // Oturum yoksa veya oturum açılmamışsa modal'ı gösterme
        setShowModal(true);
        return;
      }

      if (session.user.accessToken) { // Oturum süresi varsa
        const currentTime = Math.floor(Date.now() / 1000); // Şu anki zaman (saniye)
        // Token'daki süre bilgisini al
        const token = JSON.parse(atob(session.user.accessToken.split('.')[1]));
        const expirationTime = token.exp;

        if (expirationTime && expirationTime < currentTime) {
            // Token süresi dolmuşsa, oturumu sonlandır
            setShowModal(true);
            setIsExpiring(false);
          } else if (expirationTime && expirationTime - currentTime <= 300) {
            // Oturum süresi 5 dakikadan az kalmışsa, uyarıyı göster
            setShowModal(true);
            setIsExpiring(true);
          } else {
            // Süre bitmemişse modal'ı gizle
            setShowModal(false);
          }
        }
    };

    checkSessionExpiry();
    const interval = setInterval(checkSessionExpiry, 60000);

    return () => clearInterval(interval);
  }, [session, status, pathname]);

  const handleLogin = async () => {
    // Modal'ı kapat
    setShowModal(false);
    
    // Session'ı sonlandır ve yönlendir
    await signOut({ 
      redirect: true,
      callbackUrl: '/login'
    });
  };

  // Modal'ı gösterme koşulları
  if (!showModal || isAuthPage || status === 'loading') {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">
          {isExpiring ? 'Oturum Süresi Dolmak Üzere' : 'Oturum Süresi Doldu'}
        </h2>
        <p className="mb-4">
          {isExpiring
            ? 'Oturum süreniz dolmak üzere. Güvenliğiniz için lütfen tekrar giriş yapın.'
            : 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.'}
        </p>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={handleLogin}
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal;