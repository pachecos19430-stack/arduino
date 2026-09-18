# MicroLab Security Specification

## 1. Data Invariants
1. **User Profiles (`/users/{userId}`)**: Can only be created/updated by the authenticated user matching `request.auth.uid`. Role changes can only be performed by administrators.
2. **Projects (`/projects/{projectId}`)**: Must have a valid `userId` matching `request.auth.uid`. Cannot be accessed or modified by unauthorized third parties.
3. **Project Components (`/projectComponents/{id}`)**: Must reference an existing project owned by the user.
4. **Connections (`/connections/{id}`)**: Must reference a valid project owned by the user, with valid pin and wire color schemas.
5. **Tests (`/tests/{id}`)**: Belong to a valid project owned by the user.
6. **Test Results (`/testResults/{id}`)**: Must be linked to a valid test and project.
7. **Telemetry (`/telemetry/{id}`)**: Belongs to a project owned by the user.
8. **Logs (`/logs/{id}`)**: Audit entries must be bound to authentic user actions.
9. **Hardware Catalog (`/boards/{id}`) & Component Catalog (`/components/{id}`)**: Publicly readable for all authenticated users to assemble circuits, but creation and mutation restricted to authorized users/admins.

## 2. Dirty Dozen Malicious Payloads
1. **Unauthenticated Project Creation**: Attempting to create a project without authentication.
2. **User Impersonation Write**: Creating a project with `userId: "another_user_id"`.
3. **Cross-User Project Access**: Reading or updating another user's private circuit project.
4. **ID Poisoning Attack**: Injecting a 2KB malicious string as `{projectId}` or `{connectionId}`.
5. **Catalog Overwrite**: Malicious modification of the shared `/boards` or `/components` database.
6. **Negative Pin Count**: Writing a board with negative analog/digital pins.
7. **Role Escalation**: Regular maker updating their user profile with `role: "admin"`.
8. **Orphaned Connection Write**: Adding a connection with a non-existent `projectId`.
9. **Volumetric Denial-of-Wallet Payload**: Sending 2MB oversized text in `project.notes`.
10. **Ghost Field Injection**: Adding unverified keys like `isEnterprisePaid: true` into a project document.
11. **Timestamp Manipulation**: Submitting a fake historical timestamp `createdAt: "1990-01-01"` instead of validated time.
12. **Malicious Protocol Injection**: Inserting arbitrary code in `component.protocol`.
