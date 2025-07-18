import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4001/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  // Get the token from localStorage
  let token = null;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("apollo-token");
  }

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);

    // Handle authentication errors
    if ("statusCode" in networkError && networkError.statusCode === 401) {
      // Clear the token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          threads: {
            keyArgs: ["category_id"],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          posts: {
            keyArgs: ["thread_id"],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          products: {
            keyArgs: ["cropType", "farmerId"],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          searchProducts: {
            keyArgs: ["query"],
            merge(existing = [], incoming) {
              return incoming; // Replace existing results for new searches
            },
          },
          nearbyProducts: {
            keyArgs: ["latitude", "longitude", "maxDistance"],
            merge(existing = [], incoming) {
              return incoming; // Replace existing results for new location queries
            },
          },
        },
      },
      Thread: {
        fields: {
          posts: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      Post: {
        fields: {
          replies: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      Product: {
        fields: {
          // Add any specific product field policies if needed
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

export default client;
