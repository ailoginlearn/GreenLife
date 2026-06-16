# Hospital Portal Firestore Security Specification

This security specification details the access control policies, data invariants, and defensive validation rules mapped over our Firestore collection schema.

## 1. Data Invariants

- **Users**:
  - `userId` path variable must match the user's authentic `request.auth.uid`.
  - Roles are restricted to `patient`, `admin`, and `doctor`. A user cannot upgrade their own role to `admin` or `doctor` unless verified by an existing admin. By default on registration, users are registered as `patient`.
  - Profile metadata fields like `createdAt` are immutable after creation.
  
- **Doctors**:
  - Readable by anyone, including unauthenticated users, to support listing doctors on the homepage.
  - Creatable, updatable, and deletable ONLY by verified `admin` users.
  - Document IDs must conform to `isValidId()`.

- **Appointments**:
  - Users can read and query (`allow list`) ONLY appointments where `userId == request.auth.uid`.
  - Admins can read, query (`allow list`), and write ALL appointments.
  - Users can create assignments if `request.auth.uid == incoming().userId`.
  - Users can update their own appointments ONLY for specific keys (e.g., cancelling: updating `status` to `'cancelled'` and setting `updatedAt`).
  - Immutability: Patients cannot change `userId`, `doctorId`, `doctorName`, `department`, `createdAt` after creation.

- **Reports**:
  - Users can read, create, and delete their own medical reports where `userId == request.auth.uid`.
  - Admins can read, update, or manage ALL files during medical review.
  - Users cannot read other patients' reports.

---

## 2. The "Dirty Dozen" Payloads (Defensive Attack Matrix)

Here are the 12 malicious payload signatures blocked completely by our Fortress security rule bounds:

1. **Self-Assigned Admin Escalation**: A malicious patient tries to write a `users` document setting the role field to `admin`.
2. **Ghost-Field Injection**: Triggering a user profile edit with extra shadow fields (e.g., `isVerified: true`).
3. **Orphaned Profile Creation**: Submitting profile documentation without `createdAt` or setting it to a vintage client timezone timestamp.
4. **Physician Hijacking**: An authenticated patient attempts to overwrite a doctor's specialties or add a new doctor record.
5. **Session Interception**: Booking an appointment under another patient's `userId`.
6. **Denial of Wallet Document ID Flood**: Booking a report document with an ID consisting of a massive 15KB junk string.
7. **Retroactive Timestamp Falsification**: Specifying a future or historical clock value for `updatedAt` instead of `request.time`.
8. **Anarchic Status Flip**: A patient trying to modify an appointment status from `cancelled` back to `completed` after completion.
9. **Blanket Query Scraping**: Triggering a search query for appointments without setting `userId == uid`, trying to extract and scrape random patient listings.
10. **Foreign Medical Records Intrusion**: An authenticated user attempting a direct `get()` fetch on a diagnostic report owned by another patient.
11. **Immortals Field Overwrite**: Attempting to alter `createdAt` on an existing appointment to wipe history.
12. **Doctor Availability Deletion**: A patient triggering a delete instruction on a designated doctor document in the medical registry.

---

## 3. Test Invariant Outlines (Simulation Checks)

```typescript
// firestore.rules.test.ts (Validation Simulator)
describe("Hospital Portal Security Rules Verification", () => {
  it("forces authenticated clients to read ONLY their matching user profile block", async () => {
    // Assert user `alice` can retrieve `users/alice` but receives PERMISSION_DENIED on `users/bob`
  });

  it("blocks unauthenticated / guest writes back to the doctor directory", async () => {
    // Assert write to `doctors/dr_jones` fails
  });

  it("blocks any user role setting to 'admin' during onboarding", async () => {
    // Assert creation of role: 'admin' for normal patient accounts fails
  });

  it("permits database reads of doctors collection without authentication", async () => {
    // Assert guest can fetch `doctors/`
  });

  it("prohibits users from reading other accounts' diagnostic reports", async () => {
    // Assert alice is blocked from reading `reports/bob_diagnostic_xray`
  });
});
```
