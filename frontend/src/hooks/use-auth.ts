import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import { GET_ME } from "@/lib/graphql/queries";
import {
  getStoredUser,
  getStoredToken,
  isAuthenticated as checkIsAuthenticated,
} from "@/lib/graphql-auth";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  is_verified?: boolean;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [graphqlUser, setGraphqlUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // GraphQL user query
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery(GET_ME, {
    skip: !checkIsAuthenticated(),
    errorPolicy: "ignore",
  });

  useEffect(() => {
    if (status === "loading" || meLoading) {
      setIsLoading(true);
      return;
    }

    // Check if we have both NextAuth session and GraphQL token
    const hasGraphqlToken = checkIsAuthenticated();
    const hasNextAuthSession = !!session?.user;

    if (hasGraphqlToken && hasNextAuthSession) {
      // User is fully authenticated
      if (meData?.me) {
        setGraphqlUser(meData.me);
      } else {
        // Try to get user from localStorage as fallback
        const storedUser = getStoredUser();
        if (storedUser) {
          setGraphqlUser(storedUser);
        }
      }
    } else {
      // User is not authenticated
      setGraphqlUser(null);
    }

    setIsLoading(false);
  }, [session, status, meData, meLoading]);

  const isAuthenticated = () => {
    return !!session?.user && !!getStoredToken();
  };

  const getUser = () => {
    if (graphqlUser) {
      return {
        // Merge NextAuth user data with GraphQL user data
        ...graphqlUser,
        name: graphqlUser.name || session?.user?.name || "",
        email: graphqlUser.email || session?.user?.email || "",
        image: graphqlUser.avatar_url || session?.user?.image || "",
      };
    }
    return null;
  };

  return {
    user: getUser(),
    graphqlUser,
    nextAuthUser: session?.user,
    isAuthenticated: isAuthenticated(),
    isLoading,
    token: getStoredToken(),
    error: meError,
  };
}
