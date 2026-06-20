"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { hydrateAuth, loadPersistedAuth } from "@/store/authSlice";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const persisted = loadPersistedAuth();
    dispatch(hydrateAuth(persisted));
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}
