"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { graphQLLogout, getStoredToken } from "@/lib/graphql-auth";

export function AuthSync() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const syncAuthentication = async () => {
      if (status === "loading") return;

      const hasGraphqlToken = !!getStoredToken();
      const hasNextAuthSession = !!session?.user;

      // If we have NextAuth session but no GraphQL token, try to get one
      if (hasNextAuthSession && !hasGraphqlToken && session?.user?.email) {
        try {
          // This would require the user to re-authenticate via GraphQL
          // For now, we'll redirect to login to re-authenticate
          console.log(
            "NextAuth session exists but no GraphQL token, redirecting to login"
          );
          router.push("/login");
        } catch (error) {
          console.error("Failed to sync GraphQL authentication:", error);
          router.push("/login");
        }
      }

      // If we have GraphQL token but no NextAuth session, clear GraphQL token
      if (hasGraphqlToken && !hasNextAuthSession) {
        console.log(
          "GraphQL token exists but no NextAuth session, clearing GraphQL token"
        );
        graphQLLogout();
      }
    };

    syncAuthentication();
  }, [session, status, router]);

  return null; // This component doesn't render anything
}

export default AuthSync;
