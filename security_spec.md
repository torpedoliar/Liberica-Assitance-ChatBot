# Security Specification

## 1. Data Invariants
- A `Session` belongs strictly to a single user and is stored as a subcollection under the `/users/{userId}/sessions` path.
- A `Session` must have exact schema keys: `currentMode`, `messages`, `appState`, `updatedAt`, `title`, and `isPinned`.
- System updates are limited to `updatedAt` which must strictly enforce the `request.time` invariant.
- Action-Based updating strictly binds modification pathways (Save, Pin, Rename).

## 2. The "Dirty Dozen" Payloads

1. **Missing Required Fields**: Payload with no `title`.
2. **Missing Required Fields**: Payload with no `isPinned`.
3. **Ghost Field Update**: Sending `{ isVerified: true }`.
4. **Spoofed User ID**: Modifying another user's subcollection `{ userId: "otherAdmin" }`.
5. **No Auth Update**: Unauthenticated updates to public-looking sessions.
6. **Type Violation**: A `title` provided as a number instead of a string.
7. **Type Violation**: `isPinned` provided as a string "true" instead of boolean.
8. **Size Limit Violation**: String fields like `title` over 100 characters.
9. **Size Limit Violation**: String fields like `messages` over 1MB.
10. **Timestamp Manipulation**: Sending `updatedAt` as a client-side timestamp (e.g. `1600000000`) instead of `serverTimestamp()`.
11. **Improper Action Combination**: Updating `messages` and `isPinned` at the exact same time (only one action allowed per update branch).
12. **Path Parameter Overflow (Denial of Wallet)**: `userId` being a 1MB string (fails `isValidId`).

## 3. Test Runner
Included in `firestore.rules.test.ts`.
