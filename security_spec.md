# Security Specification - NewAra

This document outlines the security invariants, threat model, and test vectors for the NewAra application.

## 1. Data Invariants

- **User Profiles**: A user document in `/users/{userName}` can only be created by the user themselves. Updates to sensitive fields (`role`, `aras`, `isHelper`) are restricted.
- **Classrooms**: Only the `ownerName` of a class can modify its settings or delete it.
- **Members**: A user can join a class (create a member doc) but only the owner can remove members (or the member themselves).
- **Sub-resources**: Access to announcements, assignments, chat, and resources is restricted to members of the parent class.
- **Activities**: Only the creator can edit/delete their shared activities. Password protection is implemented for viewing if needed (though rules check identity).
- **Transactions**: `ara_transactions` are read-only for the user and system-write only (enforced by validating the sender/receiver).
- **Reports**: Any logged-in user can create a report, but only admins can read/update them.
- **Moderation**: `banned_users` and `admins` collections are read-only for users (to check status) and write-restricted to admins.

## 2. The "Dirty Dozen" Payloads (Threat Vectors)

1.  **Privilege Escalation**: Attempt to create a user with `role: "Moderator"`.
2.  **Identity Spoofing**: Attempt to update another user's bio.
3.  **Currency Hijacking**: Attempt to increment own `aras` balance without a transaction.
4.  **Class Takeover**: Attempt to change the `ownerName` of an existing class.
5.  **Ghost Member**: Attempt to add a message to a class chat without being in the `members` collection.
6.  **Unauth Deletion**: Attempt to delete an announcement created by someone else.
7.  **Resource Scraping**: Attempt to list all assignments across all classes without being a member.
8.  **Bypass Moderation**: Attempt to delete own report or self-resolve it.
9.  **Transaction Forgery**: Attempt to create a transaction record for someone else's account.
10. **State Corruption**: Attempt to update a game session status as a player (not host).
11. **PII Leak**: Attempt to read the `email` of all users.
12. **Spam Attack**: Attempt to create 1000 announcements in 1 second (Rate limiting - though rules are less effective here, size checks help).

## 3. Test Runner Implementation Plan

We will create `src/tests/firestore.rules.test.ts` to verify these invariants.

## 4. Implementation Strategy

- **Master Gate**: All sub-collections will check the parent document $(\text{e.g., classes})$ for membership.
- **Split PII**: Move sensitive user data if possible, or use field-level restrictions.
- **Validation Blueprints**: Use `isValidUser()`, `isValidClass()`, etc.
- **System Fields**: Protect `createdAt`, `updatedAt`, and `aras` from unsolicited client updates.
