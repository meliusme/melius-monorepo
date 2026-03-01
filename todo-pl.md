# Melius TODO (PL)

Stan: **IN PROGRESS**  
Ostatnia aktualizacja: **1 marca 2026**

## MVP (krytyczne)

- [ ] Dokończenie template'ów email w Resend (operacyjnie)

## DONE

- [x] Meetings: scope'y dashboardowe terapeuty (`today`, `upcoming`, `past`, `cancelled`) + paginacja
- [x] Payments: idempotencja webhooków P24, sanity checks kwoty/statusu, blokady statusów
- [x] Payments: TTL dla spotkań `pending` (ochrona przed opóźnioną płatnością)
- [x] Availability: walidacja zakresu czasu i wykrywanie nakładających się slotów
- [x] Matches: walidacja dat (`from <= to`, poprawny format, max 30 dni)
- [x] Doc verification: dokumenty + workflow `draft -> submitted -> approved/rejected`
- [x] Sesje: refresh token rotation + cleanup wygasłych tokenów

## IN PROGRESS

- [ ] Frontend: dokończenie flow po wyborze slotu (`matchStepper.tsx`)
- [ ] Email flow: pełne spięcie eventów (listener jest, nie wszystkie eventy są emitowane we wszystkich ścieżkach)
- [ ] Uporządkowanie końcowe dokumentacji operacyjnej

## TODO LATER

- [ ] Publiczny endpoint profilu terapeuty: `GET /profiles/doc/:id`
- [ ] Email: flow zmiany emaila użytkownika
- [ ] Email: przypomnienia o spotkaniu (np. 24h przed)
- [ ] Email: mail do terapeuty po akceptacji profilu przez admina
- [ ] Rating: wymagany komentarz przy ocenie <= 3
- [ ] Rating: moderacja komentarzy (zgłaszanie/ukrywanie)
- [ ] Matches: scoring i wagi (zamiast tylko filtrowania/sortowania)
- [ ] Admin/Finance: historia płatności terapeuty, saldo, payouty, statystyki
- [ ] Images: miniaturki + cleanup nieużywanych plików
- [ ] Availability: opcjonalna min/max długość slotu

## Plik źródłowy backlogu

- historyczny backlog: `melius-backend-todo-later.txt`

