/**
 * useUserAuth — restores the session on app mount.
 *
 * Strategy:
 *  1. If we already have a user in context, do nothing (already authenticated).
 *  2. If we have an access token in localStorage, call GET /api/auth/getInfo.
 *     - success → store user in context.
 *     - 401     → the axios interceptor will try POST /api/auth/refresh
 *                 (httpOnly cookie) and retry automatically.
 *                 If that also fails, the interceptor clears the token; we
 *                 just set isAuthLoading=false and let the PrivateRoute redirect.
 *  3. If no token at all, skip the network call and mark loading done.
 *
 * We never do window.location.href here — that causes the loop.
 */
import { useContext, useEffect } from "react";
import { UserContext } from "../context/Context";
import axiosInstance from "../utils/axiosInstances";
import { API_PATH } from "../utils/apiPath";

const useUserAuth = () => {
  const { user, token, isAuthLoading, setIsAuthLoading, updateUser } =
    useContext(UserContext);

  useEffect(() => {
    // Already have user — nothing to do
    if (user) {
      setIsAuthLoading(false);
      return;
    }

    // No token at all — skip network call
    if (!token) {
      setIsAuthLoading(false);
      return;
    }

    let cancelled = false;

    const restoreSession = async () => {
      try {
        const res = await axiosInstance.get(API_PATH.AUTH.GET_USER_INFO);
        if (!cancelled && res.data) {
          updateUser(res.data);
        }
      } catch {
        // Axios interceptor already handled refresh + retry.
        // If we're here the token is invalid — just let PrivateRoute redirect.
      } finally {
        if (!cancelled) setIsAuthLoading(false);
      }
    };

    restoreSession();
    return () => { cancelled = true; };
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return { user, isAuthLoading };
};

export default useUserAuth;
