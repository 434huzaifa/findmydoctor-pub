
"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { store } from "./index";
import type { AppDispatch, RootState } from "./index";
import { useMeQuery } from "./fmdApi";
import { hydrateAuth, loadPersistedAuth, logout, setCredentials } from "./authSlice";

function AuthHydrator() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((s: RootState) => s.auth);
  const { data, isError } = useMeQuery(undefined, { skip: !token || !!user });

  useEffect(() => {
    dispatch(hydrateAuth(loadPersistedAuth()));
  }, [dispatch]);

  useEffect(() => {
    if (token && data && !user) {
      dispatch(setCredentials({ user: data, token }));
    }
  }, [token, user, data, dispatch]);

  useEffect(() => {
    if (token && !user && isError) {
      dispatch(logout());
    }
  }, [token, user, isError, dispatch]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}
