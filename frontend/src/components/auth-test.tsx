"use client";

import { useQuery } from "@apollo/client";
import { GET_ME } from "@/lib/graphql/queries";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthTestComponent() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery(GET_ME, {
    errorPolicy: "all",
  });

  if (isLoading || meLoading) {
    return <div className="p-4">Loading authentication status...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test Dashboard</CardTitle>
        <CardDescription>
          Test the integration between NextAuth and GraphQL authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <h3 className="text-lg font-semibold">Authentication Status</h3>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">JWT Token</h3>
            <p className="text-sm text-muted-foreground break-all">
              {token ? `${token.substring(0, 50)}...` : "No token found"}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              User Data (NextAuth + GraphQL)
            </h3>
            {user ? (
              <div className="bg-muted p-3 rounded text-sm">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Bio:</strong> {user.bio || "No bio"}
                </p>
                <p>
                  <strong>Verified:</strong> {user.is_verified ? "Yes" : "No"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No user data available
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold">GraphQL ME Query</h3>
            {meError ? (
              <p className="text-sm text-red-500">Error: {meError.message}</p>
            ) : meData?.me ? (
              <div className="bg-muted p-3 rounded text-sm">
                <p>
                  <strong>ID:</strong> {meData.me.id}
                </p>
                <p>
                  <strong>Username:</strong> {meData.me.username}
                </p>
                <p>
                  <strong>Email:</strong> {meData.me.email}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(meData.me.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No GraphQL user data
              </p>
            )}
          </div>

          <div className="pt-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Refresh Test Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
