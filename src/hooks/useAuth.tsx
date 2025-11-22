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
  // 초기값을 true로 설정하여 Auth 체크가 끝나기 전까지는 앱이 로딩 상태로 유지되게 함
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
        // 1. 인증 지속성(Persistence)을 로컬로 강제 설정 (새로고침 해도 로그인 유지)
        try {
            await setPersistence(auth, browserLocalPersistence);
        } catch (e) {
            console.error("Persistence error:", e);
        }

        // 2. Redirect 결과 처리 (모바일/PC 리다이렉트 복귀 시)
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                console.log("↪️ [Auth Hook] Redirect Login Success:", result.user.email);
                await syncUserProfile(result.user);
            }
        } catch (error) {
            console.error("🚨 [Auth Hook] Redirect Login Error:", error);
        }

        // 3. 인증 상태 실시간 감지 (가장 중요)
        // onAuthStateChanged는 초기 실행 시, 현재 상태를 파악하고 콜백을 줍니다.
        // 이 콜백이 실행된 후에야 loading을 false로 바꿔야 깜빡임이 없습니다.
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("👤 [Auth Hook] Auth State Changed:", currentUser ? `Logged in as ${currentUser.email}` : "Logged out");
            
            if (currentUser) {
                setUser(currentUser);
                // 이미 위에서 sync를 했더라도, 상태 변화 시 한 번 더 체크 (안전장치)
                await syncUserProfile(currentUser);
            } else {
                setUser(null);
            }
            
            // 인증 상태가 확정되었으므로 로딩 해제
            setLoading(false);
        });

        return unsubscribe;
    };

    // initAuth 실행 및 cleanup 처리
    let unsubscribeFunc: (() => void) | undefined;
    initAuth().then(unsub => { unsubscribeFunc = unsub; });

    return () => {
        if (unsubscribeFunc) unsubscribeFunc();
    };
  }, []);

  // 로그인 함수 (Promise<string> 반환)
  const login = async (): Promise<string> => {
    const ua = navigator.userAgent.toLowerCase();
    
    const isMobile = /iphone|ipad|ipod|android/i.test(ua);
    const isInApp = /kakaotalk|instagram|naver|snapchat|line|fban|fbav/i.test(ua);

    console.log(`🚀 [Auth Hook] Login Request. Mobile: ${isMobile}, InApp: ${isInApp}`);

    try {
      if (isInApp) {
        // CASE A: 인앱 브라우저
        if (/android/i.test(ua)) {
            // 안드로이드: 크롬 강제 실행 (현재 URL 유지)
            const url = window.location.href.replace(/^https?:\/\//, '');
            const intentUrl = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end`;
            window.location.href = intentUrl;
            return 'IN_APP_BROWSER'; // 가이드도 띄워줌 (혹시 실패할 경우 대비)
        }
        // 아이폰: 강제 실행 불가 -> 가이드 표시
        return 'IN_APP_BROWSER';
      } 
      else if (isMobile) {
        // CASE B: 모바일 (Redirect)
        // 모바일에서는 팝업이 차단될 확률이 높으므로 리다이렉트 사용
        await signInWithRedirect(auth, provider);
        return 'SUCCESS';
      } 
      else {
        // CASE C: PC (Popup 우선 시도)
        console.log("💻 PC detected, attempting Popup...");
        try {
            await signInWithPopup(auth, provider);
            return 'SUCCESS';
        } catch (popupError: any) {
            console.warn("⚠️ Popup failed on PC, falling back to Redirect...", popupError);
            // 팝업 실패 시 (차단 등) 리다이렉트로 재시도
            await signInWithRedirect(auth, provider);
            return 'SUCCESS';
        }
      }
    } catch (error: any) {
      console.error("🚨 [Auth Hook] Login Failed:", error);
      const firebaseError = error as AuthError;
      
      if (firebaseError.code === 'auth/popup-blocked') {
        alert("⚠️ 팝업이 차단되었습니다. 주소창 설정을 확인해주세요.");
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        console.warn("User closed the popup.");
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        alert(`⚠️ 도메인 승인 필요: Firebase Console에 ${window.location.hostname}을 등록해주세요.`);
      } else {
        // alert(`로그인 오류: ${firebaseError.message}`);
      }
      return 'ERROR';
    }
  };

  const logout = async () => {
    console.log("👋 [Auth Hook] Logout initiated...");
    try {
      await signOut(auth);
      setUser(null); // 즉시 UI 반영
      console.log("✅ [Auth Hook] Logout successful");
    } catch (error) {
      console.error("❌ [Auth Hook] Logout failed", error);
    }
  };

  return { user, loading, login, logout };
};