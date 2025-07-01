// src/context/auth-context/index.jsx
import { createContext, useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  initialSignInFormData,
  initialSignUpFormData,
} from "@/config";
import {
  registerService,
  loginService,
  checkAuthService,
} from "@/services";

/* ───────────────────────────
   1 ▪ Context object
   ─────────────────────────── */
export const AuthContext = createContext(null);

/* ───────────────────────────
   2 ▪ Provider component
   ─────────────────────────── */
export function AuthProvider({ children }) {
  /* form state */
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);

  /* auth state */
  const [auth, setAuth] = useState({ authenticate: false, user: null });

  /* loading flag for very first auth-check */
  const [loading, setLoading] = useState(true);

  /* ---------- handlers ---------- */

  const handleRegisterUser = useCallback(
    async (e) => {
      e?.preventDefault?.();
      try {
        const { success, data, message } = await registerService(signUpFormData);
        if (!success) throw new Error(message);
        // 👉 you can auto-login here if you wish
        console.log("✅ Registered:", data);
      } catch (err) {
        console.error("Register error →", err.message);
      }
    },
    [signUpFormData]
  );

  const handleLoginUser = useCallback(
    async (e) => {
      e?.preventDefault?.();
      try {
        const { success, data, message } = await loginService(signInFormData);
        if (!success) throw new Error(message);

        /* store token (adjust storage as needed) */
        sessionStorage.setItem("accessToken", JSON.stringify(data.accessToken));

        setAuth({ authenticate: true, user: data.user });
      } catch (err) {
        console.error("Login error →", err.message);
        setAuth({ authenticate: false, user: null });
      }
    },
    [signInFormData]
  );

  const resetCredentials = useCallback(() => {
    setAuth({ authenticate: false, user: null });
    sessionStorage.removeItem("accessToken");
  }, []);

  /* ---------- silent auth check on first mount ---------- */

  useEffect(() => {
    async function checkAuth() {
      try {
        const { success, data } = await checkAuthService();
        if (success) {
          setAuth({ authenticate: true, user: data.user });
        } else {
          resetCredentials();
        }
      } catch (err) {
        resetCredentials();
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [resetCredentials]);

  /* ---------- provider value ---------- */

  const ctxValue = {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
    auth,
    resetCredentials,
  };

  /* ---------- render ---------- */

  return (
    <AuthContext.Provider value={ctxValue}>
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
