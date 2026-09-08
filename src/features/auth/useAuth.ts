import { useAppSelector } from "../../store/hooks";
import {
  selectAuthIsLoading,
  selectAuthUser,
  selectIsAuthenticated,
} from "./authSelectors";

export function useAuth() {
  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthIsLoading);

  return { user, isAuthenticated, isLoading };
}
