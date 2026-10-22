"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/admin/db";

const AccessContext = createContext(null);

function hasPerm(perms, permission) {
  if (!perms) return false;
  const area = permission.split(":")[0];
  return perms.includes("*") || perms.includes(permission) || perms.includes(`${area}:*`);
}

export function AccessProvider({ children }) {
  const router = useRouter();
  const [access, setAccess] = useState(undefined);

  const load = useCallback(async () => {
    const { data, error } = await db().rpc("get_my_access");
    if (error) {
      setAccess(null);
      return;
    }
    setAccess(data);
  }, []);

  useEffect(() => {
    load();
    const { data: sub } = db().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/admin/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [load, router]);

  const value = useMemo(
    () => ({
      access,
      loading: access === undefined,
      reload: load,
      can: (permission) => hasPerm(access?.permissions, permission),
      isSuper: access?.role === "super_admin",
    }),
    [access, load],
  );
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  return useContext(AccessContext);
}

export async function signOut(router) {
  await db().auth.signOut();
  router.replace("/admin/login");
  router.refresh();
}
