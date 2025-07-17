import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/lib/graphql/queries";
import client from "@/lib/apollo-client";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    bio: string;
    is_verified: boolean;
  };
}

export const graphQLLogin = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await client.mutate({
    mutation: LOGIN_MUTATION,
    variables: {
      input: {
        email,
        password,
      },
    },
  });

  if (data?.login?.token) {
    // Store the token in localStorage for Apollo Client
    localStorage.setItem("apollo-token", data.login.token);

    // Also store user info for easy access
    localStorage.setItem("apollo-user", JSON.stringify(data.login.user));
  }

  return data.login;
};

export const graphQLRegister = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await client.mutate({
    mutation: REGISTER_MUTATION,
    variables: {
      input: {
        username,
        email,
        password,
      },
    },
  });

  if (data?.register?.token) {
    // Store the token in localStorage for Apollo Client
    localStorage.setItem("apollo-token", data.register.token);

    // Also store user info for easy access
    localStorage.setItem("apollo-user", JSON.stringify(data.register.user));
  }

  return data.register;
};

export const graphQLLogout = () => {
  // Clear GraphQL tokens and user data
  localStorage.removeItem("apollo-token");
  localStorage.removeItem("apollo-user");
};

export const getStoredUser = () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("apollo-user");
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const getStoredToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("apollo-token");
  }
  return null;
};

export const isAuthenticated = () => {
  return !!getStoredToken();
};
