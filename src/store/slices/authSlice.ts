import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { AuthUser, LoginCredentials, RegisterPayload } from "../../features/auth/authTypes";
import { authService } from "../../services/auth";
import { toAuthErrorMessage } from "../../services/auth/errors";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function applySession(state: AuthState, user: AuthUser | null) {
  state.user = user;
  state.isAuthenticated = user !== null;
  state.isLoading = false;
}

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async () => authService.restoreSession(),
);

export const login = createAsyncThunk<
  AuthUser,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    return await authService.login(credentials);
  } catch (error) {
    return rejectWithValue(toAuthErrorMessage(error, "Sign in failed."));
  }
});

export const register = createAsyncThunk<
  AuthUser,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload);
  } catch (error) {
    return rejectWithValue(toAuthErrorMessage(error, "Registration failed."));
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        applySession(state, action.payload);
      })
      .addCase(restoreSession.rejected, (state) => {
        applySession(state, null);
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        applySession(state, action.payload);
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        applySession(state, action.payload);
      })
      .addCase(logout.fulfilled, (state) => {
        applySession(state, null);
      })
      .addCase(logout.rejected, (state) => {
        applySession(state, null);
      });
  },
});

export default authSlice.reducer;
