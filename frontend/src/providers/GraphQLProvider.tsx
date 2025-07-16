"use client";

import { ApolloProvider } from "@apollo/client";
import client from "@/lib/apollo-client";

interface GraphQLProviderProps {
  children: React.ReactNode;
}

export default function GraphQLProvider({ children }: GraphQLProviderProps) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
