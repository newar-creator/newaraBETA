# Security Specification - NewAra Classroom

## 1. Data Invariants
- **Classes**: Must belong to an owner. Document ID should match the class name or be a unique ID. Codes must be 6-character alphanumeric.
- **Announcements**: Must be linked to a classId. Only class members (teachers or students) can read. Only teachers should be able to post if the app intended that, but current UI allows anyone to post (I should check the code).
- **Members**: userId in the subcollection path must match the actual user's ID.
- **ResourceCodes**: Only teachers can create. Anyone in the class can read.

## 2. The Dirty Dozen Payloads (Rejection Targets)
1. `{ "name": "A".repeat(1000), ... }` - Size rejection.
2. `{ "code": "HACKED", "ownerName": "OtherUser" }` - Spoof rejection.
3. `{ "createdAt": "2000-01-01T00:00:00Z" }` - Timestamp rejection (non-server time).
4. `update { "code": "NEWCODE" }` - Immutability rejection.
5. `delete /classes/someClassId` by a non-owner.
6. `create /announcements { "content": "spam", "classId": "validId" }` without class membership.

## 3. Implementation Plan
- Define `isValidClass`, `isValidAnnouncement`, `isValidResourceCode`.
- Enforce relational constraints using `get()`.
- Use `affectedKeys().hasOnly()` for updates (e.g., archiving).
