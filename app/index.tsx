import { Redirect } from "expo-router";

import { SessionLoader } from "../src/features/auth/SessionLoader";
import { useAuth } from "../src/features/auth/useAuth";

export default function IndexRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SessionLoader />;
  }

  return <Redirect href={isAuthenticated ? "/chats" : "/login"} />;
}
