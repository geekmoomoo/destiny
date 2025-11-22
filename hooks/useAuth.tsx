import { useState, useEffect } from 'react';
import { auth, provider, db } from '../firebaseConfig';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  setPersistence,
  browserLocalPersistence,
  type User, 
  type AuthError 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 프로필 동기화 함수
  const syncUserProfile = async (currentUser: User) => {
      const userRef = doc(db, "users", currentUser.uid);
      try {
           await setDoc(userRef, {
               uid: currentUser.uid,
               email: currentUser.email,
               displayName: currentUser.displayName,
               photoURL: currentUser.photoURL,
               lastLogin: new Date().toISOString()
           }, { merge: true });
           console.log("✅ [Auth Hook] User profile synced to Firestore");
      } catch (e) {
          console.error("❌ [Auth Hook] Error syncing profile:", e);
      }
  };

  useEffect(() => {
    console.log("🔌 [Auth Hook] Initializing Auth Listener...");

    const initAuth = async () => {
        // 1. 인증 지속성 설정 (새로고침 해도 로그인 유지)
        try {
            await setPersistence(auth, browserLocalPersistence);
        } catch (e) {
            console.error("Persistence error:", e);
        }

        // 2. Redirect 결과 처리 (팝업 차단으로 리다이렉트 했을 경우 대비)
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                console.log("↪️ [Auth Hook] Redirect Login Success:", result.user.email);
                await syncUserProfile(result.user);
            }
        } catch (error) {
            console.error("🚨 [Auth Hook] Redirect Login Error:", error);
        }

        // 3. 실시간 상태 감지
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("👤 [Auth Hook] Auth State Changed:", currentUser ? `Logged in as ${currentUser.email}` : "Logged out");
            setUser(currentUser);
            
            if (currentUser) {
                await syncUserProfile(currentUser);
            }
            setLoading(false);
        });

        return unsubscribe;
    };

    let unsubscribeFunc: (() => void) | undefined;
    initAuth().then(unsub => { unsubscribeFunc = unsub; });

    return () => {
        if (unsubscribeFunc) unsubscribeFunc();
    };
  }, []);

  // 로그인 함수
  const login = async (): Promise<string> => {
    const ua = navigator.userAgent.toLowerCase();
    const isInApp = /kakaotalk|instagram|naver|snapchat|line|fban|fbav/i.test(ua);

    // 1. 인앱 브라우저 처리 (기존 로직 유지)
    if (isInApp) {
        if (/android/i.test(ua)) {
            const url = window.location.href.replace(/^https?:\/\//, '');
            const intentUrl = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end`;
            window.location.href = intentUrl;
            // 안드로이드는 강제이동 시도 후에도 가이드를 보여주는게 안전함
            return 'IN_APP_BROWSER'; 
        }
        return 'IN_APP_BROWSER';
    }

    // 2. 일반 브라우저 (PC & Mobile Chrome/Safari)
    // 중요: 현재 Firebase Hosting 설정 문제(404)로 인해 Redirect 방식이 불안정하므로,
    // 모바일에서도 'Popup' 방식을 우선 시도합니다. Popup은 서버 핸들러 404 영향을 덜 받습니다.
    try {
        console.log("🔑 Attempting Login via Popup (Priority Strategy)...");
        await signInWithPopup(auth, provider);
        return 'SUCCESS';
    } catch (error: any) {
        console.warn("⚠️ Popup login failed. Checking fallback...", error.code);
        
        // 3. 팝업 차단 시 Fallback (Redirect 시도)
        // 모바일 등에서 팝업이 차단된 경우에만 최후의 수단으로 리다이렉트 사용
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
             console.log("↪️ Falling back to Redirect...");
             try {
                await signInWithRedirect(auth, provider);
                return 'SUCCESS';
             } catch (redirectError: any) {
                alert(`로그인 실패: ${redirectError.message}`);
                return 'ERROR';
             }
        }
        
        // 사용자가 닫은 경우
        if (error.code === 'auth/popup-closed-by-user') {
            return 'CANCELLED'; 
        }

        // 기타 오류
        if (error.code === 'auth/unauthorized-domain') {
            alert(`⚠️ 도메인 승인 필요: Firebase Console에 ${window.location.hostname}을 등록해주세요.`);
        } else {
            alert(`로그인 오류: ${error.message}`);
        }
        return 'ERROR';
    }
  };

  const logout = async () => {
    console.log("👋 [Auth Hook] Logout initiated...");
    try {
      await signOut(auth);
      setUser(null);
      console.log("✅ [Auth Hook] Logout successful");
    } catch (error) {
      console.error("❌ [Auth Hook] Logout failed", error);
    }
  };

  return { user, loading, login, logout };
};