# MyPage logout design

## Goal

Add a test-oriented logout button to MyPage. Logging out must ask the backend to invalidate the server-side session or refresh token and must always expire the client authentication state.

## Architecture

`AuthContext.logout()` owns the complete logout workflow so UI components do not need to know how authentication is stored or invalidated. It sends `POST /api/auth/logout` with credentials, then removes the local access token and marks authentication as finished and unauthenticated.

Local cleanup runs even when the backend request fails. This guarantees that a temporary network or server failure cannot trap the user in an authenticated UI. The backend error remains observable to the caller so MyPage can report the failure if needed, while navigation to `/login` is driven by the existing `ProtectedRoute` after the context state changes.

## Components and data flow

1. The user presses the logout button on MyPage.
2. MyPage disables the button while `logout()` is pending.
3. `AuthContext.logout()` calls `POST /api/auth/logout` with `withCredentials: true`.
4. In a `finally` block, it removes the access token and sets `isAuthenticated` and `isCheckingAuth` to `false`.
5. `ProtectedRoute` observes the unauthenticated state and redirects to `/login`.

## Error handling

Backend logout failure does not prevent client logout. `logout()` rethrows the backend error after local cleanup, allowing MyPage to log the failure. The component guards its pending state with `try/finally` so the button state cannot remain stuck if it is still mounted.

## Testing

Tests will verify that:

- a successful logout calls the correct backend endpoint with credentials, removes the access token, and expires authentication;
- a failed backend logout still removes the access token and expires authentication;
- the MyPage button invokes the context logout workflow and prevents repeated clicks while pending.

The implementation will use the smallest test setup compatible with the existing Vite and React project.
