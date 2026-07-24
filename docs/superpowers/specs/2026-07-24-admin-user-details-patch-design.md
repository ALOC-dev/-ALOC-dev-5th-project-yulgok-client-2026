# ADMIN UserDetails PATCH Design

## Goal

Allow an ADMIN account to submit the UserDetails form without stopping after
`GET /api/auth/status`.

## Behavior

The submitter is selected from the current role returned by
`refreshCurrentUser()`:

- `GUEST` uses `POST /api/users/details`.
- `USER` uses `PATCH /api/users/details`.
- `ADMIN` uses `PATCH /api/users/details`.
- Missing or unknown roles continue to throw before submission.

ADMIN always uses PATCH. The client does not attempt to determine whether the
ADMIN account already has user details, and it does not fall back to POST when
PATCH fails.

## Scope

Change only the role-to-submitter selector and its focused unit tests.
`UserDetails.jsx`, request payloads, validation, navigation, and error handling
remain unchanged.

## Verification

Add a selector test proving that ADMIN resolves to `patchUserDetails`, retain
the existing GUEST and USER assertions, and keep the unsupported-role test for
missing and unknown roles. Run the focused UserDetails test suite and the
project build.
