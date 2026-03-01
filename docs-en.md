# Melius Backend - Technical Documentation (EN)

Last updated: March 1, 2026
Status: IN PROGRESS

## General Overview

Melius is an online platform that connects patients with therapists.
The backend is built with NestJS, TypeScript, PostgreSQL, and Prisma ORM.

The system supports three user roles:
- `user` (patient)
- `doc` (therapist)
- `admin` (administrator)

## Technology Stack

- Framework: NestJS
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma 7
- Authentication: JWT + cookies
- Payments: Stripe, Przelewy24
- Email: Resend
- File Storage: AWS S3 (avatars and therapist verification documents)
- Scheduling: `@nestjs/schedule` (cron jobs)

## Database Structure

### Enum Types

- `Role`: `user`, `doc`, `admin`
- `Sex`: `male`, `female`, `other`
- `MeetingStatus`: `pending`, `confirmed`, `cancelled_by_user`, `cancelled_by_doc`, `cancelled_by_system`, `completed`
- `PaymentStatus`: `pending`, `succeeded`, `failed`, `refunded`
- `PaymentProvider`: `stripe`, `p24`
- `Profession`: `psychologist`, `psychotherapist`, `sexologist`
- `Language`: `pl`, `en`
- `DocVerificationStatus`: `draft`, `submitted`, `approved`, `rejected`

### Main Models

1. `RefreshToken` (refresh session)
- `tokenHash`, `expiresAt`, `revokedAt`, `replacedByTokenId`
- `userAgent`, `ip`
- Relations: `user`, `replacedBy`, `replaces`

2. `User`
- `id`, `email`, `password`, `role`
- `emailConfirmed`
- `language`
- `tokenActivatedAt`
- Relations: `avatar`, `userProfile`, `docProfile`, `adminProfile`

3. `UserProfile` (patient profile)
- `firstName`, `lastName`, `published` (legacy, not used in core logic)
- `consentTerms`, `consentAdult`, `consentHealthData`
- Relations: `user`, `meetings`, `problems`, `ratings`

4. `DocProfile` (therapist profile)
- `firstName`, `lastName`, `profession`
- `rate` (average rating), `ratesLot` (rating count)
- `unitAmount` (session price), `currency`
- `docTermsAccepted`
- `verificationStatus`: `draft`, `submitted`, `approved`, `rejected`
- `submittedAt`, `reviewedAt`, `rejectionReason`
- Relations: `user`, `meetings`, `specializations`, `availabilitySlots`, `ratings`, `docVerificationDocuments`

5. `DocVerificationDocument`
- `fileKey`, `mimeType`, `sizeBytes`, `originalName`, `uploadedAt`
- Relation: `doc`

6. `AdminProfile`
- `firstName`, `lastName`
- Relation: `user`

7. `Avatar`
- `key`, `url`
- Relation: `user`

8. `Meeting`
- `startTime`, `endTime`, `status`
- `clientMessage`
- Relations: `user`, `doc`, `slot`, `payments`, `ratings`

9. `AvailabilitySlot`
- `startTime`, `endTime`, `booked`
- Relations: `doc`, `meetings`

10. `Payment`
- `unitAmount`, `currency`, `status`, `provider`
- Stripe fields: `stripePaymentIntentId`, `stripeCheckoutId`
- P24 fields: `p24SessionId`, `p24OrderId`, `p24Token`
- Relation: `meeting`

11. `Rating`
- `rate` (1-5), `comment`
- Relations: `user`, `doc`, `meeting`

12. `Problem`
- `problemKey`
- Relations: `specializations`, `userProfiles`, `matches`

13. `Specialization`
- `specializationKey`
- Relations: `problems`, `docProfiles`, `matches`

14. `Match`
- `problemId`, `specializationId`

## Modules and API Endpoints

### 1. Auth Module (`/auth`)

Handles registration, login, logout, and password setup.

Endpoints:

- `POST /auth/login`
- Body: `{ email, password }`
- Returns: `role`, `userId`
- Logic: verifies credentials, checks confirmed email
- Cookies: `access_token`, `refresh_token`, auth flags/exp timestamps

- `POST /auth/register-light`
- Body: `{ email, firstName?, lastName?, consentTerms, consentAdult, consentHealthData }`
- Returns: `role`, `userId`
- Logic: light registration without password, logs user in immediately
- If user exists with unconfirmed email, profile is updated and session is issued
- Sends confirmation email

- `POST /auth/set-password` (JWT required)
- Body: `{ password }`
- Returns: `role`, `userId` + refreshed auth cookies
- Logic: sets password and marks email as confirmed

- `POST /auth/refresh`
- Returns: `{ ok: true }` + refreshed auth cookies
- Logic: refresh-token rotation

- `POST /auth/logout`
- Returns: `{ ok: true }`
- Logic: clears cookies and revokes refresh token if present

Auth service methods:
- `login(email, password)`
- `registerLight(email, firstName?, lastName?, ...)`
- `setPassword(userId, password)`
- `refreshSession(refreshToken)`
- `revokeRefreshToken(refreshToken)`

### 2. Users Module (`/users`)

User CRUD + avatar management.

Endpoints:

- `POST /users`
- Body: `CreateUserDto`
- Returns created user (without password)

- `GET /users/me` (JWT)
- Returns currently logged-in user

- `GET /users` (JWT + admin)
- Returns all users

- `GET /users/:id` (JWT + admin)
- Returns selected user

- `PATCH /users/:id` (JWT, own account only)
- Body: `UpdateUserDto`
- Updates own account data

- `DELETE /users/:id` (JWT, own account only)
- Deletes own account + cascade-related data

- `POST /users/avatar` (JWT)
- Multipart file upload (2MB limit)
- Uploads to S3 and updates avatar record

- `DELETE /users/avatar/:userId` (JWT)
- Deletes own avatar from S3 + DB

Users service methods:
- `create(dto)`
- `findAll()`
- `findOne(id)`
- `update(id, dto)`
- `remove(id)`
- `addAvatar(userId, file)`
- `deleteAvatar(userId)`

### 3. Profiles Module (`/profiles`)

Patient, therapist, and admin profile management.

Endpoints:

- `PUT /profiles/user` (JWT + user)
- Body: `UpdateUserProfileDto`
- Updates patient profile + selected problems

- `PUT /profiles/doc` (JWT + doc)
- Body: `UpdateDocProfileDto`
- Updates therapist profile, specializations, price
- Does not allow direct `verificationStatus` changes

- `POST /profiles/doc/submit` (JWT + doc)
- Submits therapist profile for review (`verificationStatus=submitted`)
- Requires complete profile, therapist terms accepted, and at least 1 verification document

- `POST /profiles/admin` (JWT + admin)
- Body: `UpdateAdminProfileDto`

- `GET /profiles/user` (JWT + user)
- Returns patient profile with problems

- `GET /profiles/doc` (JWT + doc)
- Returns therapist profile with specializations

- `POST /profiles/rate` (JWT + user)
- Body: `CreateDocRateDto`
- Creates rating and updates therapist average

- `GET /profiles/doc/:docId/ratings`
- Query: `page`, `limit`
- Returns therapist ratings with pagination

Profiles service methods:
- `updateUserProfile(userId, dto)`
- `updateDocProfile(userId, dto)`
- `submitDocProfile(userId)`
- `updateAdminProfile(userId, dto)`
- `getUserProfile(userId)`
- `getDocProfile(userId)`
- `getNewDocsProfiles()`
- `getBestDocsProfiles()`

Rating service methods:
- `addDocRate(user, dto)`
- `getDocRatings(docId, page, limit)`

### 4. Matches Module (`/matches`)

Patient-to-therapist matching based on problems and specializations.

Endpoints:

- `GET /matches` (JWT + user)
- Returns matched therapists
- Filters therapists with `verificationStatus=approved`

- `GET /matches/problems`
- Public endpoint returning all problems

- `POST /matches/search-with-slots`
- Body: `SearchMatchesDto { problemId, from, to }`
- Returns therapists with free slots in the given range
- Filters therapists with `verificationStatus=approved`

Matches service methods:
- `getMatchedDocs(userId)`
- `getProblems()`
- `searchDocsWithSlots(dto)`

### 5. Availability Module (`/availability`)

Therapist availability slot management.

Endpoints:

- `POST /availability` (JWT + doc)
- Body: `{ startTime, endTime }`
- Creates availability slot
- Requires `verificationStatus=approved`
- Validates overlap and time range

- `GET /availability/my` (JWT + doc)
- Returns all own slots

- `GET /availability/doc/:docId`
- Returns free future slots for a therapist

- `DELETE /availability/:slotId` (JWT + doc)
- Deletes own unbooked slot
- Requires `verificationStatus=approved`

Availability service methods:
- `create(docId, dto)`
- `findForDoc(docId)`
- `findFreeSlotsForDoc(docId)`
- `remove(docId, slotId)`

### 6. Meetings Module (`/meetings`)

Meeting lifecycle between patient and therapist.

Endpoints:

- `POST /meetings` (JWT + user)
- Body: `{ slotId, clientMessage? }`
- Creates `pending` meeting and marks slot as booked
- Requires accepted consents

- `GET /meetings/me` (JWT + user)
- Query `scope`: `upcoming | past | all`

- `GET /meetings/doc` (JWT + doc)
- Query `scope`: `today | upcoming | past | cancelled`
- Optional pagination: `page`, `limit`
- Returns: `{ items, page, limit, total }`

- `POST /meetings/:id/cancel` (JWT + user)
- Cancels with `cancelled_by_user`
- Releases slot
- For confirmed meetings, cancellation allowed only if more than 24h before start

- `POST /meetings/doc/:id/cancel` (JWT + doc)
- Cancels with `cancelled_by_doc`
- Releases slot

Meetings service methods:
- `createMeeting(userId, dto)`
- `getUserMeetings(userId, scope)`
- `getDocMeetingsListForUser(docUserId, scope, page, limit)`
- `cancelMeetingByUser(meetingId, userId)`
- `cancelMeetingByDocUser(meetingId, docUserId)`

Meetings cron service:
- `markCompletedMeetings()` every 5 minutes (`confirmed` -> `completed` when ended)
- `autoCancelUnpaidMeetings()` every 5 minutes (old `pending` -> `cancelled_by_system`, release slot, P24 pending payments -> failed)

### 7. Payments Module (`/payments`)

Stripe and Przelewy24 payment handling.

Endpoints:

- `POST /payments/checkout` (JWT + user)
- Stripe checkout creation
- Body: `{ meetingId }`
- Returns: `{ url, sessionId }`

- `POST /payments/p24/start` (JWT + user)
- Przelewy24 payment initialization
- Body: `{ meetingId }`
- Returns: `{ url, token, sessionId }`

- `POST /payments/webhook` (Stripe webhook)
- Verifies signature and handles `checkout.session.completed`
- Updates payment to `succeeded` and meeting to `confirmed`

- `POST /payments/p24/webhook` (P24 webhook)
- Verifies data
- Marks payment `succeeded`/`failed`
- Confirms meeting when applicable

Payments service methods:
- `createCheckoutSessionForMeeting(userId, meetingId)`
- `startP24PaymentForMeeting(userId, meetingId)`
- `handleStripeWebhook(rawBody, signature)`
- `handleP24Webhook(body)`
- `refundPaymentForMeeting(meetingId, reason)`
- `p24SignRegister(params)`

### 8. Email Module (`/email`)

Email confirmation and password reset (Resend).

Endpoints:

- `POST /email/confirm`
- Body: `{ token }`
- Confirms email

- `POST /email/resend-confirm`
- Body: `{ email }`
- Resends confirmation link (with cooldown)

- `POST /email/password`
- Body: `{ email }`
- Sends password reset link (with cooldown)

- `PATCH /email/password-change`
- Body: `{ token, newPassword }`
- Changes password

Email service methods:
- `confirmEmail(email)`
- `decodeConfirmationToken(token)`
- `resendConfirmationLink(email)`
- `sendPasswordLink(email)`
- `changePassword(dto)`

### 9. Admin Module (`/admin`)

Admin moderation of therapist verification.

Endpoints:

- `GET /admin/documents/:id/url` (JWT + admin)
- Returns signed URL for therapist verification document

- `POST /admin/docs/:docProfileId/approve` (JWT + admin)
- Sets therapist profile to `approved`

- `POST /admin/docs/:docProfileId/reject` (JWT + admin)
- Body: `{ reason }`
- Sets therapist profile to `rejected` and stores reason

Admin service methods:
- `approveDocProfile(docProfileId)`
- `rejectDocProfile(docProfileId, reason)`

### 10. Doc Module (`/doc`)

Therapist-specific features (calendar + verification documents).

Endpoints:

- `GET /doc/calendar/week` (JWT + doc)
- Query: `from`, `to`
- Returns weekly calendar with meetings

- `POST /doc/verification-documents` (JWT + doc)
- Multipart file upload (`pdf/jpg/png`, max 10MB)
- Required for profile submission

- `GET /doc/verification-documents` (JWT + doc)
- Lists therapist verification documents

- `DELETE /doc/verification-documents/:id` (JWT + doc)
- Deletes selected verification document

Doc service methods:
- `getWeekCalendar(docId, from, to)`
- `uploadVerificationDocument(docId, file)`
- `listVerificationDocuments(docId)`
- `deleteVerificationDocument(docId, id)`
- `getVerificationDocumentUrl(id)`

### 11. Image Module

S3 file handling.

Image service methods:
- `uploadObject(...)`
- `deleteObject(key)`
- `normalizeAvatar(buffer)`
- `getObjectSignedUrl(key, ttlSec)`

### 12. Cleanup (legacy service)

Legacy cleanup service exists in code but is not mounted as a dedicated Nest module.

- `CleanupService` has commented-out daily cleanups for unconfirmed users.
- Active cleanup cron currently used in production code: refresh-token cleanup in `AuthCleanupService` (daily at 03:00).

## Application Flows

### Registration and Login Flow

1. Light registration (patient)
- `POST /auth/register-light`
- Creates user/profile with required consents
- Issues auth cookies immediately
- Sends email confirmation link

2. Email confirmation
- `POST /email/resend-confirm`
- `POST /email/confirm`

3. Password setup
- `POST /auth/set-password` (JWT)

4. Login
- `POST /auth/login`

5. Session refresh
- `POST /auth/refresh`

### Patient Flow (`user`)

1. Register and complete profile
- `POST /auth/register-light`
- `PUT /profiles/user`

2. Therapist search
- `GET /matches/problems`
- `POST /matches/search-with-slots`

3. Check availability
- `GET /availability/doc/:docId`

4. Book meeting
- `POST /meetings`

5. Pay
- Stripe: `POST /payments/checkout`
- or P24: `POST /payments/p24/start`

6. Manage meetings
- `GET /meetings/me?scope=upcoming`
- `GET /meetings/me?scope=past`
- `POST /meetings/:id/cancel`

7. Rate therapist
- `POST /profiles/rate`

8. Browse ratings
- `GET /profiles/doc/:docId/ratings`

### Therapist Flow (`doc`)

1. Therapist account creation (admin assigns role)
- `POST /users { role: "doc" }`

2. Complete profile
- `PUT /profiles/doc`

3. Upload verification documents
- `POST /doc/verification-documents`
- `GET /doc/verification-documents`

4. Submit for review
- `POST /profiles/doc/submit`

5. Admin review
- Approve: `POST /admin/docs/:id/approve`
- Reject: `POST /admin/docs/:id/reject`

6. Manage availability (approved therapists only)
- `POST /availability`
- `GET /availability/my`
- `DELETE /availability/:slotId`

7. Manage meetings
- `GET /meetings/doc?scope=today|upcoming|past|cancelled`
- `POST /meetings/doc/:id/cancel`

8. Weekly calendar
- `GET /doc/calendar/week?from=...&to=...`

9. Ratings visibility
- `GET /profiles/doc`
- `GET /profiles/doc/:docId/ratings`

### Payments Flow

Stripe:
1. User books meeting (`pending`)
2. `POST /payments/checkout`
3. User pays on Stripe
4. Stripe webhook `/payments/webhook`
5. Backend updates payment to `succeeded` and meeting to `confirmed`

Przelewy24:
1. User books meeting (`pending`)
2. `POST /payments/p24/start`
3. Frontend redirects to P24
4. User pays on P24
5. P24 webhook `/payments/p24/webhook`
6. Backend verifies + updates payment/meeting statuses

### Cancellation Flow

1. User or therapist cancels
- `POST /meetings/:id/cancel` or `POST /meetings/doc/:id/cancel`

2. Backend:
- sets meeting status (`cancelled_by_user` or `cancelled_by_doc`)
- releases slot (`booked=false`)
- for succeeded P24 payments, performs refund

## Automations (Cron Jobs)

1. Meetings completion (every 5 minutes)
- finds ended confirmed meetings
- marks them as `completed`

2. Auto-cancel unpaid pending meetings (every 5 minutes)
- finds `pending` meetings older than 15 min
- marks as `cancelled_by_system`
- releases slots
- marks related pending P24 payments as `failed`

3. Cleanup (legacy)
- legacy unconfirmed-user cleanup remains disabled/commented

## Security

### Guards
- `JwtAuthGuard`: validates JWT from cookies
- `RolesGuard`: validates role requirements

### Authentication
- Access token in httpOnly cookie
- Refresh token in httpOnly cookie (`path=/auth/refresh`)
- Access default TTL: 15 minutes
- Refresh default TTL: 7 days
- Refresh token rotation + active session cap (`MAX_SESSIONS_PER_USER`)

### Authorization
- `@Roles(...)` decorators define required roles
- Guards enforce role checks
- Users can modify only their own data

### Passwords
- `bcrypt` hashing (10 rounds)

### Webhooks
- Stripe signature verification
- P24 verification/signature checks

### Validation
- Global `ValidationPipe` (`class-validator`)
- DTO-level validation
- `whitelist: true` behavior

### Throttling
- Default: 60 requests / 60 seconds
- Login: 5 / 15 minutes
- Register-light: 5 / 15 minutes
- Set-password: 3 / 15 minutes
- Logout/refresh: throttle bypass where configured

### Therapist Verification Rules
- Only admins can approve/reject therapist profiles.
- `verificationStatus` controls public visibility and permissions:
- `draft`: editing, not public
- `submitted`: pending review, not public
- `approved`: public, can manage slots
- `rejected`: not public, requires edits/resubmission

Approved therapists only can:
- create/delete availability slots
- appear in search results
- be matched with patients
- receive reservations

### CORS
- Origin: `process.env.CLIENT_URL`
- Credentials: `true`

## Environment Variables

### Database
- `DATABASE_URL=postgresql://user:password@host:port/database`

### JWT
- `JWT_SECRET`
- `JWT_SECRET_TIME=900`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_SECRET_TIME=604800`
- `MAX_SESSIONS_PER_USER=5`

### Resend (email)
- `RESEND_API_KEY`
- sender/template aliases

### AWS S3
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_BUCKET_NAME`
- `S3_ENDPOINT` (optional)
- `S3_FORCE_PATH_STYLE`
- `S3_PUBLIC_BASE_URL`

### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Przelewy24
- `P24_MERCHANT_ID`
- `P24_POS_ID`
- `P24_CRC`
- `P24_API_KEY`
- `P24_BASE_URL`
- `P24_GATEWAY_URL`
- `P24_RETURN_URL`
- `P24_STATUS_URL`
- `P24_REFUND_STATUS_URL`

### App
- `PORT=3000`
- `CLIENT_URL=http://localhost:3001`
- `MEETING_PENDING_TTL_MINUTES=15`

## Run and Development

### Docker
- `docker compose up -d`
- Starts PostgreSQL and backend containers

### Prisma
- `pnpm prisma:migrate`
- `pnpm prisma:generate`
- `pnpm prisma:studio`
- `pnpm prisma:push`

### Seed
- `pnpm seed`
- `pnpm seed2`
- `pnpm seed:docs`
- `pnpm db:seed:all`

### DB Cleanup
- `pnpm db:clean`

### Development
- `pnpm dev:backend`

## Example Code Flows

### Example: Meeting Creation

1. Request: `POST /meetings { slotId, clientMessage? }`
2. `MeetingsController.createMeeting()`
- JWT + role guards
- forwards to service
3. `MeetingsService.createMeeting()`
- checks slot + consents
- atomically books slot and creates `pending` meeting
4. Response: serialized meeting DTO/entity

### Example: Stripe Webhook

1. Request: `POST /payments/webhook` + `stripe-signature`
2. `PaymentsController.handleStripeWebhook()`
- reads raw body + signature
3. `PaymentsService.handleStripeWebhook()`
- verifies signature
- handles `checkout.session.completed`
- updates payment + meeting in transaction
4. Response: `{ received: true }`

## Most Important Files

`/apps/backend/src/`
- `main.ts` - entrypoint and app setup
- `app.module.ts` - root module
- `auth/*` - auth flow and JWT strategy
- `users/*` - user management + avatars
- `profiles/*` - role-specific profile management
- `matches/*` - matching logic
- `availability/*` - availability slots
- `meetings/*` - meetings + cron automation
- `payments/*` - Stripe and P24 logic
- `email/*` - email sending + listeners
- `rating/*` - rating logic
- `admin/*` - verification moderation
- `doc/*` - therapist-specific APIs
- `image/*` - S3 upload/delete/sign URLs
- `cleanup/*` - legacy cleanup service
- `prisma/*` - Prisma service/module
- `guards/*`, `decorators/*`, `middlewares/*`, `common/*`

`/apps/backend/prisma/`
- `schema.prisma`
- `prisma.config.ts`
- `seed.ts`
- `seed2.ts`
- `seed-docs.ts`
- `migrations/`

## Module Summary

Backend modules:
1. AuthModule
2. UsersModule
3. ProfilesModule
4. MatchesModule
5. AvailabilityModule
6. MeetingsModule
7. PaymentsModule
8. EmailModule
9. RatingModule
10. AdminModule
11. DocModule
12. ImageModule
13. PrismaModule

Note:
- `CleanupService` exists but is not mounted as a dedicated Nest module.
- Active cleanup cron currently handles refresh tokens (`AuthCleanupService`, daily at 03:00).

Counts:
- Controllers: 11
- DB models: 14
- Enums: 8

## Core Features

- JWT + cookie auth
- Three roles (`user`, `doc`, `admin`)
- Therapist verification workflow (`draft -> submitted -> approved/rejected`)
- Public visibility only for approved therapists
- Patient-therapist matching
- Availability slot management
- Booking and payment handling
- Automated meeting status updates (cron)
- Rating system
- Email notifications (confirmation/reset + transactional foundation)
- Avatar upload to S3
- Security controls (guards, throttling, validation)
- Stripe + P24 support
- Refresh token rotation
- Therapist verification documents upload and admin preview

## Project Status

- IN PROGRESS (actively developed)
- Core MVP backend flows are working end-to-end
- Critical MVP endpoints are implemented
- Stripe + P24 payment paths are implemented
- Cron automations are in place
- Rating and matching systems are functional
- Admin therapist verification panel is implemented
- Verification logic is based on `verificationStatus` (not `published`)

## Important Dependencies and Rules

Approved therapists only can:
- be publicly visible
- manage availability slots
- receive reservations
- appear in matching/search results

The system does not rely on `published` for visibility logic.

## TODO Status Snapshot (Actual)

DONE:
- therapist dashboard meeting scopes (`/meetings/doc` with pagination)
- P24 webhook idempotency + status/amount sanity checks + TTL guard
- availability overlap/time validations
- matches date-range validation
- document upload + verification workflow
- refresh-token rotation + cleanup

IN PROGRESS:
- frontend match stepper final transition after slot selection
- full transactional email event wiring across all paths
- final operations/docs cleanup

TODO LATER:
- public therapist profile endpoint (`GET /profiles/doc/:id`)
- expanded email flows (email change, reminders, approval notifications)
- rating moderation rules
- weighted matching/scoring
- admin finance features (balance, payout, history, stats)
- image thumbnails + orphan file cleanup
- optional min/max slot duration rules
