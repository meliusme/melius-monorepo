# Melius TODO (EN)

Status: **IN PROGRESS**  
Last updated: **March 1, 2026**

## MVP (critical)

- [ ] Finalize email templates in Resend (operational task)

## DONE

- [x] Meetings: therapist dashboard scopes (`today`, `upcoming`, `past`, `cancelled`) + pagination
- [x] Payments: P24 webhook idempotency, amount/status sanity checks, status guards
- [x] Payments: TTL guard for `pending` meetings
- [x] Availability: time-range validation and overlap detection
- [x] Matches: date-range validation (`from <= to`, valid format, max 30 days)
- [x] Doc verification: documents + `draft -> submitted -> approved/rejected` workflow
- [x] Sessions: refresh-token rotation + expired-token cleanup

## IN PROGRESS

- [ ] Frontend: finalize flow after slot selection (`matchStepper.tsx`)
- [ ] Email flow: finish event wiring (listener exists; not all events are emitted in every path yet)
- [ ] Final operational documentation cleanup

## TODO LATER

- [ ] Public therapist profile endpoint: `GET /profiles/doc/:id`
- [ ] Email: user email-change flow
- [ ] Email: meeting reminders (for example 24h before)
- [ ] Email: therapist notification after admin approval
- [ ] Rating: require comment when rating <= 3
- [ ] Rating: comment moderation (report/hide)
- [ ] Matches: weighted scoring (instead of mostly filtering/sorting)
- [ ] Admin/Finance: therapist payment history, balance, payouts, stats
- [ ] Images: thumbnails + unused file cleanup
- [ ] Availability: optional min/max slot duration

## Backlog source file

- historical backlog: `melius-backend-todo-later.txt`

