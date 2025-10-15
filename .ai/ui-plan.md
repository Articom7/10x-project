# Architektura UI dla SmartPantry

## 1. Przegląd struktury UI

SmartPantry to aplikacja webowa z podejściem mobile-first, zaprojektowana do zarządzania domową spiżarnią i automatycznego generowania list zakupów. Architektura UI opiera się na czterech głównych sekcjach dostępnych przez bottom navigation (mobile) lub sidebar (desktop):

- **Spiżarnia** - główny widok z produktami pogrupowanymi według kategorii
- **Dodaj produkty** - zunifikowany interfejs do dodawania produktów (LLM lub ręcznie)
- **Listy zakupów** - aktywne i archiwalne listy zakupów
- **Profil** - ustawienia użytkownika i opcja wylogowania

Aplikacja wykorzystuje responsywny layout z dwoma breakpointami:
- **Mobile** (< 768px): single column, bottom navigation, touch-optimized
- **Desktop** (≥ 768px): multi-column layout, sidebar navigation

### Kluczowe założenia architektoniczne:
- Aplikacja online-only (wymaga stałego połączenia)
- Uproszczone zarządzanie stanem bez zaawansowanych bibliotek
- Bezpośrednie wywołania API bez cache'owania
- Warstwowa obsługa błędów (inline, toasty, dedykowane ekrany)
- Semantyczny HTML i podstawowa dostępność (WCAG AA)

## 2. Lista widoków

### 2.1. Widok rejestracji (`/register`)

**Główny cel:** Umożliwienie nowym użytkownikom założenia konta

**Kluczowe informacje:**
- Formularz rejestracji (email, hasło, potwierdzenie hasła)
- Walidacja w czasie rzeczywistym
- Link do widoku logowania

**Kluczowe komponenty:**
- `RegisterForm` - główny formularz z walidacją
- `Input` - pola tekstowe (email, password)
- `Button` - przycisk "Zarejestruj się"
- `ErrorMessage` - komunikaty błędów inline
- `Toast` - powiadomienia o błędach API

**UX, dostępność i bezpieczeństwo:**
- Walidacja po stronie klienta i serwera
- Password input type="password" dla ukrycia hasła
- Komunikaty błędów ARIA-describedby przypisane do pól
- Focus state dla nawigacji klawiaturą
- Automatyczne przekierowanie do onboardingu po sukcesie
- Disabled state przycisku podczas przetwarzania

**Mapowanie API:** POST /api/auth/register (Supabase Auth)

---

### 2.2. Widok logowania (`/login`)

**Główny cel:** Uwierzytelnienie istniejących użytkowników

**Kluczowe informacje:**
- Formularz logowania (email, hasło)
- Link do rejestracji
- Komunikaty o błędach uwierzytelniania

**Kluczowe komponenty:**
- `LoginForm` - formularz logowania
- `Input` - pola email i password
- `Button` - przycisk "Zaloguj się"
- `ErrorMessage` - komunikaty błędów
- `Toast` - powiadomienia systemowe

**UX, dostępność i bezpieczeństwo:**
- Ukrywanie hasła (type="password")
- Czytelne komunikaty o błędach
- Utrzymywanie sesji po zamknięciu przeglądarki
- Auto-focus na pierwszym polu
- Enter key submission
- Informacja o wygaśnięciu sesji z opcją ponownego logowania

**Mapowanie API:** POST /api/auth/login (Supabase Auth)

---

### 2.3. Widok onboardingu (`/onboarding`)

**Główny cel:** Szybkie zapełnienie spiżarni nowemu użytkownikowi

**Kluczowe informacje:**
- Ekran powitalny z opisem aplikacji
- Lista popularnych produktów do wyboru (checkboxy)
- Opcja pominięcia onboardingu

**Kluczowe komponenty:**
- `WelcomeScreen` - ekran powitalny
- `ProductCheckboxList` - lista produktów z checkboxami
- `Checkbox` - pojedynczy checkbox przy produkcie
- `Button` - "Dodaj wybrane", "Pomiń"
- `Spinner` - loading state podczas dodawania

**UX, dostępność i bezpieczeństwo:**
- Opcjonalny onboarding (można pominąć)
- Wyraźny przycisk "Pomiń" zawsze widoczny
- Grupowanie produktów według kategorii dla lepszej czytelności
- Licznik wybranych produktów
- Confirmation toast po dodaniu produktów
- Automatyczne przekierowanie do spiżarni po zakończeniu
- Reminder dla nowych użytkowników (2-3 dni) jeśli pominęli

**Mapowanie API:** 
- GET /api/onboarding/products
- POST /api/pantry/quick-start

---

### 2.4. Widok spiżarni (`/pantry` lub `/`)

**Główny cel:** Przeglądanie i zarządzanie produktami w spiżarni

**Kluczowe informacje:**
- Lista produktów pogrupowana według kategorii
- Aktualna ilość każdego produktu
- Licznik produktów do kupienia
- Status produktów (dostępne, puste)

**Kluczowe komponenty:**
- `PantryHeader` - pasek wyszukiwania, filtry, licznik
- `SearchBar` - pole wyszukiwania produktów
- `FilterTabs` - filtry (wszystkie/puste/z zapasami)
- `CategoryAccordion` - rozwijana sekcja kategorii
- `ProductCard` - karta produktu z kontrolkami
- `QuantityControl` - przyciski +/- do zmiany ilości
- `Button` - "Zużyte", edycja, usuń
- `FAB` - Floating Action Button (koszyk + badge)
- `EmptyState` - stan pusty dla nowej spiżarni
- `SwipeableListItem` - wsparcie gestów swipe

**UX, dostępność i bezpieczeństwo:**
- Always-visible controls (+/-, "Zużyte") przy każdym produkcie
- Produkty z ilością 0 wyróżnione wizualnie (opacity 0.6, czerwony akcent, ikona koszyka)
- Swipe-to-edit/delete jako alternatywna metoda interakcji
- FAB w prawym dolnym rogu z badge'm liczby produktów do kupienia
- Confirmation modal dla operacji destrukcyjnych (usuń)
- Skeleton loading dla początkowego ładowania
- Mały spinner na górze dla odświeżania
- Empty state z ilustracją i dwoma CTA: "Dodaj tekstem", "Dodaj ręcznie", link do onboardingu
- Debouncing dla search bara (300ms)
- Lazy loading dla długich list (wirtualizacja)
- Accessibility: ARIA labels dla kontrolek, keyboard navigation

**Mapowanie API:**
- GET /api/pantry (pobieranie produktów)
- PATCH /api/pantry/:id (aktualizacja ilości)
- DELETE /api/products/:id (usuwanie produktu)

---

### 2.5. Widok dodawania produktów - tekst naturalny (`/add-products?mode=text`)

**Główny cel:** Szybkie dodanie wielu produktów przez LLM

**Kluczowe informacje:**
- Pole tekstowe do opisu zakupów
- Instrukcja dla użytkownika
- Toggle między trybem tekstowym a ręcznym

**Kluczowe komponenty:**
- `ModeToggle` - przełącznik "Tekst naturalny" / "Ręcznie"
- `Textarea` - pole do wprowadzenia tekstu
- `Button` - "Przetwórz"
- `Spinner` - loading podczas przetwarzania LLM
- `ErrorMessage` - komunikaty błędów (timeout, błąd API)

**UX, dostępność i bezpieczeństwo:**
- Placeholder z przykładem: "np. Kupiłem 2 mleka, chleb i 6 jajek"
- Maksymalna długość tekstu: 1000 znaków z licznikiem
- Timeout dla requestu LLM (30s) z komunikatem
- Disabled state podczas przetwarzania
- Retry button w przypadku błędu
- Auto-focus na textarea
- Clear button do czyszczenia pola

**Mapowanie API:** POST /api/products/parse-text

---

### 2.6. Widok dodawania produktów - ręcznie (`/add-products?mode=manual`)

**Główny cel:** Precyzyjne dodanie pojedynczego produktu

**Kluczowe informacje:**
- Formularz z nazwą, kategorią, ilością
- Toggle między trybem tekstowym a ręcznym

**Kluczowe komponenty:**
- `ModeToggle` - przełącznik trybu
- `Input` - nazwa produktu
- `Select` - wybór kategorii
- `QuantityControl` - liczba produktów (domyślnie 1)
- `Button` - "Dodaj produkt"
- `ErrorMessage` - walidacja inline

**UX, dostępność i bezpieczeństwo:**
- Kategoria opcjonalna (możliwość "Bez kategorii")
- Walidacja w czasie rzeczywistym
- Ilość domyślnie ustawiona na 1
- Clear feedback po dodaniu (toast + przekierowanie do weryfikacji)
- Disabled submit podczas przetwarzania
- Focus management (auto-focus na nazwę)
- Enter key submission

**Mapowanie API:** POST /api/products

---

### 2.7. Widok weryfikacji produktów (`/add-products/verify`)

**Główny cel:** Weryfikacja i edycja produktów przed zapisem do spiżarni

**Kluczowe informacje:**
- Lista sugestii z LLM lub produktu ręcznego
- Możliwość edycji każdej pozycji (nazwa, ilość, kategoria)
- Akcje globalne (Zatwierdź wszystkie, Anuluj)

**Kluczowe komponenti:**
- `VerificationList` - edytowalna lista produktów
- `ProductVerificationItem` - pojedynczy produkt do weryfikacji
- `Input` - edycja nazwy inline
- `QuantityControl` - edycja ilości inline
- `Select` - zmiana kategorii inline
- `Button` - usuń pozycję, "Zatwierdź wszystkie", "Anuluj"
- `Toast` - potwierdzenie zapisu

**UX, dostępność i bezpieczeństwo:**
- Inline edycja każdego pola bez dodatkowych modali
- Swipe-to-delete dla pojedynczych pozycji
- Wyraźne wizualne rozróżnienie kategorii (kolorowe tagi)
- Confirmation modal dla "Anuluj" jeśli są niezapisane zmiany
- Disabled "Zatwierdź" jeśli lista pusta
- Success toast z liczbą dodanych produktów
- Automatyczne przekierowanie do spiżarni po zatwierdzeniu
- Obsługa częściowych błędów (niektóre produkty dodane, inne nie)

**Mapowanie API:** POST /api/products/bulk

---

### 2.8. Widok edycji produktu (`/products/:id/edit`)

**Główny cel:** Edycja istniejącego produktu w spiżarni

**Kluczowe informacje:**
- Aktualne dane produktu
- Formularz edycji (nazwa, kategoria, ilość pożądana)
- Tooltip dla pola "Ilość pożądana"

**Kluczowe komponenty:**
- `EditProductForm` - formularz edycji
- `Input` - nazwa produktu
- `Select` - kategoria
- `Input` - ilość pożądana (z tooltip)
- `Button` - "Zapisz", "Anuluj"
- `Tooltip` - wyjaśnienie "ilości pożądanej"
- `ErrorMessage` - walidacja

**UX, dostępność i bezpieczeństwo:**
- Pre-filled formularz z aktualnymi danymi
- Tooltip przy "Ilość pożądana": "Ile sztuk tego produktu chcesz zawsze mieć w domu. Używane przy generowaniu listy zakupów."
- Walidacja w czasie rzeczywistym
- Unsaved changes warning przy opuszczeniu strony
- Success toast po zapisie
- Przekierowanie do spiżarni lub pozostanie na stronie (zależnie od kontekstu)
- Back button w header

**Mapowanie API:** PATCH /api/products/:id

---

### 2.9. Widok listy zakupów (`/shopping-lists/:id`)

**Główny cel:** Interaktywna lista zakupów do użycia w sklepie

**Kluczowe informacje:**
- Nazwa listy
- Produkty pogrupowane według kategorii
- Stan odhaczenia każdej pozycji
- Liczba odhaczonych/wszystkich pozycji

**Kluczowe komponenty:**
- `ShoppingListHeader` - nazwa, liczniki, menu (edycja nazwy, usuń)
- `CategoryGroup` - grupa produktów według kategorii
- `ShoppingListItem` - pozycja z checkbox, nazwą, ilością
- `Checkbox` - odhaczanie produktów
- `QuantityControl` - edycja ilości inline
- `Button` - "Zakończ zakupy"
- `SwipeableListItem` - swipe-to-delete
- `Modal` - potwierdzenie zakończenia zakupów

**UX, dostępność i bezpieczeństwo:**
- Touch-friendly checkboxy (duże hit areas)
- Przekreślenie odhaczonych produktów
- Edycja ilości inline bez dodatkowych kliknięć
- Swipe-to-delete dla usunięcia pozycji
- Grupowanie według kategorii (rozwijane akordeonny)
- Progress indicator (np. "5/10 kupionych")
- "Zakończ zakupy" zawsze widoczny na dole
- Confirmation modal przed zakończeniem z podsumowaniem:
  - "Dodać {X} odhaczonych produktów do spiżarni?"
  - Opcja "Usuń listę po zakończeniu"
- Success toast po zakończeniu
- Automatyczne przekierowanie do spiżarni
- Persistent state (zapisywanie odhaczenia na bieżąco)

**Mapowanie API:**
- GET /api/shopping-lists/:id
- PATCH /api/shopping-lists/:listId/items/:itemId
- POST /api/shopping-lists/:id/complete
- DELETE /api/shopping-lists/:id

---

### 2.10. Widok wszystkich list zakupów (`/shopping-lists`)

**Główny cel:** Przeglądanie aktywnych i archiwalnych list zakupów

**Kluczowe informacje:**
- Aktywna lista na górze (pełne detale lub karta)
- Poprzednie listy (max 10, kompaktowe karty)
- Przycisk generowania nowej listy

**Kluczowe komponenty:**
- `ActiveShoppingListCard` - rozbudowana karta aktywnej listy
- `ArchivedListCard` - kompaktowa karta archiwalnej listy
- `Button` - "Generuj nową listę"
- `EmptyState` - brak list zakupów
- `Modal` - potwierdzenie generowania listy

**UX, dostępność i bezpieczeństwo:**
- Aktywna lista wyróżniona wizualnie (większa, z preview pozycji)
- Archiwalne listy z datą utworzenia i liczbą pozycji
- Click na kartę → przekierowanie do szczegółów listy
- Przycisk "Generuj listę" z badge'm liczby produktów do kupienia
- Toast jeśli brak produktów do kupienia: "Wszystkie produkty na stanie! 🎉"
- Disabled state przycisku jeśli brak produktów (ilość 0)
- Modal z nazwą listy przed generowaniem
- Infinite scroll lub paginacja dla archiwalnych list
- Empty state z ilustracją i CTA "Generuj pierwszą listę"

**Mapowanie API:**
- GET /api/shopping-lists
- POST /api/shopping-lists/generate

---

### 2.11. Widok profilu (`/profile`)

**Główny cel:** Zarządzanie kontem użytkownika

**Kluczowe informacje:**
- Podstawowe informacje użytkownika (email)
- Data utworzenia konta
- Opcja wylogowania

**Kluczowe komponenty:**
- `ProfileInfo` - wyświetlanie danych użytkownika
- `Button` - "Wyloguj się"
- `Modal` - potwierdzenie wylogowania

**UX, dostępność i bezpieczeństwo:**
- Wyraźny przycisk "Wyloguj się" (destructive style)
- Confirmation modal: "Czy na pewno chcesz się wylogować?"
- Success toast po wylogowaniu
- Automatyczne przekierowanie do /login
- Sekcja dla przyszłych rozszerzeń (ustawienia, preferencje)
- Dostęp do statystyk (przyszłość): liczba produktów, list, czasu w aplikacji

**Mapowanie API:** 
- GET /api/profile
- POST /api/auth/logout (Supabase Auth)

---

## 3. Mapa podróży użytkownika

### 3.1. Główne przepływy użytkownika

#### Przepływ 1: Rejestracja i onboarding nowego użytkownika

```
1. Użytkownik wchodzi na stronę → przekierowanie do /login
2. Kliknięcie "Zarejestruj się" → /register
3. Wypełnienie formularza rejestracji
   - Walidacja w czasie rzeczywistym
   - Submit → POST /api/auth/register
4. Sukces → automatyczne przekierowanie do /onboarding
5. Onboarding:
   a. Ekran powitalny z opisem
   b. Lista popularnych produktów (checkboxy)
   c. Wybór produktów → "Dodaj wybrane"
      - POST /api/pantry/quick-start
   d. ALT: "Pomiń" → bezpośrednio do spiżarni
6. Przekierowanie do /pantry (główny widok)
   - Toast: "Witaj w SmartPantry! 🎉"
```

#### Przepływ 2: Dodawanie produktów przez LLM

```
1. Użytkownik w /pantry
2. Kliknięcie "Dodaj produkty" w bottom nav → /add-products?mode=text
3. Wpisanie tekstu naturalnego: "Kupiłem 2 mleka, chleb i 6 jajek"
4. Kliknięcie "Przetwórz"
   - Spinner z tekstem "Analizuję..."
   - POST /api/products/parse-text
5. Przekierowanie do /add-products/verify
   - Lista 3 sugestii:
     * Mleko (2 szt., Nabiał)
     * Chleb (1 szt., Pieczywo)
     * Jajka (6 szt., Nabiał)
6. Użytkownik weryfikuje i edytuje inline:
   - Zmienia "Jajka" na "Jaja" 
   - Zmienia ilość mleka na 3
   - Usuwa chleb (swipe-to-delete)
7. Kliknięcie "Zatwierdź wszystkie"
   - POST /api/products/bulk
   - Success toast: "Dodano 2 produkty"
8. Automatyczne przekierowanie do /pantry
   - Produkty widoczne w odpowiednich kategoriach
```

#### Przepływ 3: Oznaczanie zużycia i generowanie listy

```
1. Użytkownik w /pantry
2. Widzi produkt "Mleko" (3 szt.)
3. Kliknięcie przycisku "-" → 2 szt.
   - PATCH /api/pantry/:id (quantity: 2)
4. Ponowne kliknięcie "-" → 1 szt.
5. Kliknięcie "Zużyte" → 0 szt.
   - PATCH /api/pantry/:id (quantity: 0)
   - Produkt wyróżniony wizualnie (opacity, czerwony akcent, ikona koszyka)
   - Badge na FAB zwiększa się: "1" → "2" (jeśli były inne puste)
6. Kliknięcie FAB (koszyk + badge "2")
   - Modal z nazwą listy: "Lista zakupów"
   - Kliknięcie "Generuj"
   - POST /api/shopping-lists/generate
7. Przekierowanie do /shopping-lists/:id
   - Lista zawiera: Mleko (ilość z "pożądanej" lub historycznego max)
```

#### Przepływ 4: Zakupy z listą

```
1. Użytkownik w /shopping-lists/:id
2. W sklepie, lista pogrupowana według kategorii:
   - Nabiał: Mleko (3 szt.), Masło (1 szt.)
   - Pieczywo: Chleb (1 szt.)
3. Odhaczanie produktów:
   - Checkbox przy "Mleko" → przekreślenie
   - PATCH /api/shopping-lists/:listId/items/:itemId (is_checked: true)
4. Edycja ilości inline:
   - Zmiana "Masło" z 1 na 2
   - PATCH /api/shopping-lists/:listId/items/:itemId (quantity: 2)
5. Usunięcie produktu:
   - Swipe-to-delete "Chleb" (zdecydował nie kupować)
6. Kliknięcie "Zakończ zakupy"
   - Modal potwierdzenia:
     * "Dodać 2 odhaczone produkty do spiżarni?"
     * Checkbox: "Usuń listę po zakończeniu" (zaznaczony)
   - Kliknięcie "Potwierdź"
   - POST /api/shopping-lists/:id/complete (delete_list: true)
7. Success toast: "Zakupy zakończone! Spiżarnia zaktualizowana."
8. Automatyczne przekierowanie do /pantry
   - Produkty mają zaktualizowane ilości
```

#### Przepływ 5: Edycja produktu i ustawienie ilości pożądanej

```
1. Użytkownik w /pantry
2. Kliknięcie ikony edycji przy "Mleko"
3. Przekierowanie do /products/:id/edit
4. Formularz pre-filled:
   - Nazwa: "Mleko"
   - Kategoria: "Nabiał"
   - Ilość pożądana: 3 (z tooltip)
5. Użytkownik zmienia "Ilość pożądana" na 5
6. Kliknięcie "Zapisz"
   - PATCH /api/products/:id
   - Success toast: "Produkt zaktualizowany"
7. Przekierowanie do /pantry
   - Następnym razem gdy mleko się skończy, lista będzie sugerować 5 szt.
```

### 3.2. Przypadki brzegowe i stany błędów

#### Przypadek 1: Brak połączenia podczas LLM processing

```
1. Użytkownik w /add-products?mode=text
2. Wpisanie tekstu → kliknięcie "Przetwórz"
3. Brak połączenia → błąd API
4. Toast error: "Brak połączenia. Sprawdź internet i spróbuj ponownie."
5. Przycisk "Spróbuj ponownie" w miejscu spinnera
6. Retry → POST /api/products/parse-text
```

#### Przypadek 2: Timeout LLM (>30s)

```
1. Request do LLM trwa >30s
2. Timeout na kliencie
3. Toast error: "Przetwarzanie trwa zbyt długo. Spróbuj z krótszym tekstem."
4. Przycisk "Spróbuj ponownie"
5. Sugestia: "Lub dodaj produkty ręcznie" → link do /add-products?mode=manual
```

#### Przypadek 3: Pusta odpowiedź LLM

```
1. LLM zwraca pustą listę sugestii
2. Przekierowanie do /add-products/verify z pustą listą
3. Empty state: "Nie rozpoznano żadnych produktów. Spróbuj innaczej sformułować lub dodaj ręcznie."
4. Przyciski: "Wróć i spróbuj ponownie", "Dodaj ręcznie"
```

#### Przypadek 4: Brak produktów do listy zakupów

```
1. Użytkownik kliknie FAB (generuj listę)
2. Wszystkie produkty mają quantity > 0
3. Toast: "Wszystkie produkty na stanie! 🎉"
4. FAB disabled (wizualnie wyszarzony)
5. Badge na FAB: "0"
```

#### Przypadek 5: Błąd podczas bulk add (częściowy sukces)

```
1. Weryfikacja 5 produktów → "Zatwierdź wszystkie"
2. POST /api/products/bulk
3. 3 produkty dodane, 2 błędy (np. duplikaty)
4. Toast warning: "Dodano 3 produkty. 2 produkty pominięto (już istnieją)."
5. Automatyczne przekierowanie do /pantry
6. Dodane produkty widoczne w spiżarni
```

#### Przypadek 6: Wygaśnięcie sesji

```
1. Użytkownik nieaktywny >1h (token wygasł)
2. Próba akcji (np. PATCH /api/pantry/:id)
3. API zwraca 401 Unauthorized
4. Middleware wykrywa brak ważnej sesji
5. Toast: "Sesja wygasła. Zaloguj się ponownie."
6. Automatyczne przekierowanie do /login
7. Po zalogowaniu → przekierowanie do /pantry
```

#### Przypadek 7: Pusta spiżarnia (nowy użytkownik po pominięciu onboardingu)

```
1. Użytkownik pomija onboarding
2. Przekierowanie do /pantry
3. Empty state:
   - Ilustracja pustej spiżarni
   - Tekst: "Twoja spiżarnia jest pusta. Dodaj pierwsze produkty!"
   - Przyciski: "Dodaj tekstem", "Dodaj ręcznie"
   - Link: "Zobacz szybki start" → /onboarding
4. Reminder toast przez 2-3 dni: "Dodaj produkty do spiżarni, aby zacząć!"
```

## 4. Układ i struktura nawigacji

### 4.1. Nawigacja główna

#### Mobile (< 768px)

**Bottom Navigation Bar** (fixed, zawsze widoczny):
- **Spiżarnia** (ikona: home/pantry) → /pantry
- **Dodaj** (ikona: plus) → /add-products
- **Listy** (ikona: shopping cart) → /shopping-lists
- **Profil** (ikona: user) → /profile

Cechy:
- Fixed position na dole ekranu
- Ikony + tekst (zawsze widoczny)
- Active state wyraźnie zaznaczony (kolor, bold)
- Touch-optimized (min 44x44px hit areas)
- W zasięgu kciuka

#### Desktop (≥ 768px)

**Sidebar Navigation** (fixed po lewej stronie):
- Logo/nazwa aplikacji na górze
- Menu items:
  - **Spiżarnia** → /pantry
  - **Dodaj produkty** → /add-products
  - **Listy zakupów** → /shopping-lists
  - **Profil** → /profile
- Wyloguj się na dole sidebar

Cechy:
- Fixed position, zawsze widoczny
- Większa przestrzeń → pełne nazwy + ikony
- Hover states
- Active item wyróżniony (background, border)
- Możliwość collapse/expand (przyszłość)

### 4.2. Nawigacja kontekstowa

#### Back Button
- Lewny górny róg w widokach modalnych/podstron:
  - /add-products/verify
  - /products/:id/edit
  - /shopping-lists/:id
- Wsparcie natywnego gestu "back" przeglądarki
- Keyboard: Escape key zamyka modalne widoki

#### Header
- Logo/nazwa aplikacji (link do /pantry)
- Back button (kontekstowy)
- Menu actions (kontekstowe, np. edycja nazwy listy)
- Search (w /pantry)

#### FAB (Floating Action Button)
- Tylko w /pantry
- Prawy dolny róg
- Ikona koszyka + badge (liczba produktów do kupienia)
- Fixed position (scroll nie wpływa)
- Akcja: generowanie listy zakupów

### 4.3. Przepływ nawigacji

```
Logowanie/Rejestracja
    ↓
Onboarding (opcjonalny)
    ↓
┌─────────────────────────────────────┐
│         GŁÓWNA NAWIGACJA            │
│  (Bottom Nav / Sidebar)             │
├─────────────────────────────────────┤
│                                     │
│  Spiżarnia (/)                      │
│    ├→ Edycja produktu               │
│    │   (/products/:id/edit)         │
│    └→ FAB → Generuj listę           │
│        (modal → /shopping-lists/:id)│
│                                     │
│  Dodaj produkty (/add-products)     │
│    ├→ Tryb tekstowy (mode=text)     │
│    │   └→ Weryfikacja               │
│    │      (/add-products/verify)    │
│    └→ Tryb ręczny (mode=manual)     │
│        └→ Weryfikacja               │
│           (/add-products/verify)    │
│                                     │
│  Listy zakupów (/shopping-lists)    │
│    └→ Szczegóły listy               │
│        (/shopping-lists/:id)        │
│                                     │
│  Profil (/profile)                  │
│    └→ Wyloguj                       │
│                                     │
└─────────────────────────────────────┘
```

### 4.4. Nawigacja klawiaturowa (dostępność)

- **Tab/Shift+Tab**: przechodzenie między interaktywnymi elementami
- **Enter/Space**: aktywacja przycisków/checkboxów
- **Escape**: zamknięcie modali/powrót
- **Arrow keys**: nawigacja w listach (opcjonalnie)
- Focus trap w modalach
- Skip to main content link

## 5. Kluczowe komponenty

### 5.1. Layout Components

#### `PageLayout`
- **Opis**: Główny wrapper dla wszystkich widoków
- **Props**: `title`, `showBackButton`, `headerActions`
- **Zawiera**: Header, main content area, bottom nav (mobile) lub sidebar (desktop)
- **Użycie**: Wszystkie widoki

#### `BottomNavigation`
- **Opis**: Fixed bottom navigation dla mobile
- **Props**: `activeItem`
- **Zawiera**: 4 nav items (Spiżarnia, Dodaj, Listy, Profil)
- **Użycie**: Mobile layout

#### `Sidebar`
- **Opis**: Fixed sidebar navigation dla desktop
- **Props**: `activeItem`
- **Zawiera**: Logo, menu items, wyloguj
- **Użycie**: Desktop layout

#### `Header`
- **Opis**: Górny pasek z tytułem i akcjami
- **Props**: `title`, `showBackButton`, `actions`
- **Zawiera**: Back button, tytuł, context actions
- **Użycie**: Wszystkie widoki

### 5.2. Form Components

#### `Input`
- **Opis**: Uniwersalne pole tekstowe
- **Props**: `type`, `value`, `onChange`, `error`, `label`, `placeholder`
- **Warianty**: text, email, password, number
- **Użycie**: Wszystkie formularze

#### `Textarea`
- **Opis**: Pole wieloliniowe dla tekstu naturalnego
- **Props**: `value`, `onChange`, `maxLength`, `placeholder`
- **Zawiera**: Counter (np. "250/1000")
- **Użycie**: /add-products?mode=text

#### `Select`
- **Opis**: Dropdown do wyboru kategorii
- **Props**: `options`, `value`, `onChange`, `label`
- **Użycie**: Edycja produktu, dodawanie ręczne

#### `Checkbox`
- **Opis**: Checkbox z labelem
- **Props**: `checked`, `onChange`, `label`
- **Użycie**: Onboarding, lista zakupów

#### `QuantityControl`
- **Opis**: Przyciski +/- do zmiany ilości
- **Props**: `value`, `onChange`, `min`, `max`
- **Zawiera**: Button "-", liczba, Button "+"
- **Użycie**: Spiżarnia, edycja produktu, lista zakupów

### 5.3. Data Display Components

#### `ProductCard`
- **Opis**: Karta produktu w spiżarni
- **Props**: `product`, `onQuantityChange`, `onConsume`, `onEdit`, `onDelete`
- **Zawiera**: Nazwa, ilość, QuantityControl, przyciski akcji
- **Warianty**: empty (quantity 0), normal
- **Użycie**: /pantry

#### `CategoryAccordion`
- **Opis**: Rozwijana sekcja kategorii
- **Props**: `category`, `products`, `defaultExpanded`
- **Zawiera**: Header (nazwa, licznik), lista ProductCard
- **Użycie**: /pantry

#### `ShoppingListItem`
- **Opis**: Pozycja na liście zakupów
- **Props**: `item`, `onCheck`, `onQuantityChange`, `onDelete`
- **Zawiera**: Checkbox, nazwa, QuantityControl, swipe-to-delete
- **Użycie**: /shopping-lists/:id

#### `ShoppingListCard`
- **Opis**: Karta listy zakupów (w widoku wszystkich)
- **Props**: `list`, `isActive`
- **Warianty**: active (rozbudowana), archived (kompaktowa)
- **Użycie**: /shopping-lists

#### `EmptyState`
- **Opis**: Stan pusty z ilustracją i CTA
- **Props**: `illustration`, `title`, `description`, `actions`
- **Użycie**: Pusta spiżarnia, brak list, brak sugestii LLM

#### `Badge`
- **Opis**: Licznik/status indicator
- **Props**: `value`, `variant` (primary, danger, success)
- **Użycie**: FAB (liczba produktów), listy (liczba pozycji)

### 5.4. Feedback Components

#### `Toast`
- **Opis**: Powiadomienie wyskakujące (góra ekranu)
- **Props**: `message`, `type` (success, error, warning, info), `duration`
- **Warianty**: Success (zielony), Error (czerwony), Warning (żółty), Info (niebieski)
- **Użycie**: Wszystkie widoki (feedback po akcjach)

#### `Modal`
- **Opis**: Okno modalne z overlay
- **Props**: `isOpen`, `onClose`, `title`, `children`, `actions`
- **Zawiera**: Header, content, footer (przyciski)
- **Użycie**: Potwierdzenia (usuń, zakończ zakupy), generowanie listy

#### `Spinner`
- **Opis**: Wskaźnik ładowania
- **Props**: `size` (small, medium, large), `text`
- **Warianty**: Full-screen (z tekstem), inline (mały)
- **Użycie**: Loading states

#### `ErrorMessage`
- **Opis**: Komunikat błędu inline
- **Props**: `message`, `field` (dla ARIA)
- **Użycie**: Walidacja formularzy

#### `Skeleton`
- **Opis**: Placeholder podczas ładowania
- **Props**: `variant` (text, card, list)
- **Użycie**: Początkowe ładowanie spiżarni/list

### 5.5. Interactive Components

#### `Button`
- **Opis**: Uniwersalny przycisk
- **Props**: `variant`, `size`, `disabled`, `loading`, `onClick`
- **Warianty**: primary, secondary, ghost, destructive
- **Użycie**: Wszystkie widoki

#### `FAB` (Floating Action Button)
- **Opis**: Fixed button z ikoną i badge
- **Props**: `icon`, `badge`, `onClick`, `disabled`
- **Użycie**: /pantry (generowanie listy)

#### `SwipeableListItem`
- **Opis**: Wrapper dla list item z swipe gestures
- **Props**: `onSwipeLeft`, `onSwipeRight`, `threshold`
- **Zawiera**: Content, swipe actions (delete, edit)
- **Użycie**: Spiżarnia, lista zakupów, weryfikacja

#### `SearchBar`
- **Opis**: Pole wyszukiwania z ikoną
- **Props**: `value`, `onChange`, `placeholder`, `debounce`
- **Zawiera**: Input, ikona lupy, clear button
- **Użycie**: /pantry

#### `FilterTabs`
- **Opis**: Taby do filtrowania
- **Props**: `options`, `active`, `onChange`
- **Warianty**: wszystkie, puste, z zapasami
- **Użycie**: /pantry

#### `ModeToggle`
- **Opis**: Przełącznik trybu (tekst/ręcznie)
- **Props**: `mode`, `onChange`
- **Użycie**: /add-products

#### `Tooltip`
- **Opis**: Dymek z pomocniczą informacją
- **Props**: `content`, `position`
- **Użycie**: Pole "Ilość pożądana"

### 5.6. Specialized Components

#### `WelcomeScreen`
- **Opis**: Ekran powitalny onboardingu
- **Props**: `onContinue`, `onSkip`
- **Zawiera**: Ilustracja, opis aplikacji, przyciski
- **Użycie**: /onboarding

#### `ProductCheckboxList`
- **Opis**: Lista produktów z checkboxami (onboarding)
- **Props**: `products`, `selected`, `onChange`
- **Zawiera**: Grupowanie według kategorii, checkboxy
- **Użycie**: /onboarding

#### `VerificationList`
- **Opis**: Edytowalna lista sugestii LLM
- **Props**: `suggestions`, `onEdit`, `onDelete`, `onConfirm`
- **Zawiera**: ProductVerificationItem (edytowalny)
- **Użycie**: /add-products/verify

#### `ProductVerificationItem`
- **Opis**: Pojedyncza sugestia do weryfikacji (edytowalna inline)
- **Props**: `suggestion`, `onEdit`, `onDelete`
- **Zawiera**: Input (nazwa), QuantityControl, Select (kategoria), delete button
- **Użycie**: /add-products/verify

#### `CategoryGroup`
- **Opis**: Grupa produktów według kategorii (lista zakupów)
- **Props**: `category`, `items`
- **Zawiera**: Header (nazwa kategorii), lista ShoppingListItem
- **Użycie**: /shopping-lists/:id

## 6. Mapowanie wymagań na elementy UI

### Wymagania funkcjonalne → UI

| ID | Wymaganie | Elementy UI |
|---|---|---|
| FR-01 | System kont użytkowników | `/register`, `/login`, `RegisterForm`, `LoginForm` |
| FR-02 | Dodawanie produktów przez tekst | `/add-products?mode=text`, `Textarea`, LLM processing, `/add-products/verify` |
| FR-03 | Ręczne zarządzanie produktami | `/add-products?mode=manual`, `/products/:id/edit`, `EditProductForm` |
| FR-04 | Oznaczanie zużycia | `QuantityControl` (+/-), Button "Zużyte", PATCH /api/pantry/:id |
| FR-05 | Widok stanu spiżarni | `/pantry`, `CategoryAccordion`, `ProductCard`, grupowanie według kategorii |
| FR-06 | Automatyczne generowanie listy | FAB w `/pantry`, POST /api/shopping-lists/generate, przekierowanie do `/shopping-lists/:id` |
| FR-07 | Logika uzupełniania | Pole "Ilość pożądana" w `/products/:id/edit`, tooltip, logika w API |
| FR-08 | Interaktywna lista zakupów | `/shopping-lists/:id`, `ShoppingListItem`, checkboxy, edycja inline |
| FR-09 | Onboarding | `/onboarding`, `WelcomeScreen`, `ProductCheckboxList`, opcja pominięcia |
| FR-10 | Proste powiadomienia | `Toast` notifications, reminders (2-3 dni dla nowych użytkowników) |

### Historyjki użytkownika → Przepływy UI

| ID | Historyjka | Przepływ UI |
|---|---|---|
| US-001 | Rejestracja nowego użytkownika | `/register` → walidacja → POST /api/auth/register → `/onboarding` |
| US-002 | Logowanie użytkownika | `/login` → walidacja → POST /api/auth/login → `/pantry` |
| US-003 | Wylogowanie | `/profile` → "Wyloguj się" → modal potwierdzenia → POST /api/auth/logout → `/login` |
| US-004 | Onboarding | `/onboarding` → wybór produktów → POST /api/pantry/quick-start → `/pantry` |
| US-005 | Dodawanie przez LLM | `/add-products?mode=text` → POST /api/products/parse-text → `/add-products/verify` → POST /api/products/bulk → `/pantry` |
| US-006 | Ręczne dodawanie | `/add-products?mode=manual` → formularz → POST /api/products → `/add-products/verify` → `/pantry` |
| US-007 | Przeglądanie spiżarni | `/pantry` → GET /api/pantry → `CategoryAccordion` z `ProductCard` |
| US-008 | Edycja produktu | `/pantry` → edycja → `/products/:id/edit` → PATCH /api/products/:id → `/pantry` |
| US-009 | Całkowite zużycie | `/pantry` → "Zużyte" → PATCH /api/pantry/:id (quantity: 0) → wizualne wyróżnienie |
| US-010 | Częściowe zużycie | `/pantry` → +/- → PATCH /api/pantry/:id → aktualizacja UI |
| US-011 | Usuwanie produktu | `/pantry` → usuń → modal potwierdzenia → DELETE /api/products/:id → usunięcie z UI |
| US-012 | Generowanie listy | `/pantry` → FAB → modal → POST /api/shopping-lists/generate → `/shopping-lists/:id` |
| US-013 | Interakcja z listą | `/shopping-lists/:id` → checkbox → PATCH items → edycja ilości → swipe-to-delete |
| US-014 | Ustawienie pożądanej ilości | `/products/:id/edit` → pole "Ilość pożądana" (tooltip) → PATCH /api/products/:id |

## 7. Rozwiązywanie punktów bólu użytkownika przez UI

### Punkt bólu 1: Marnowanie żywności (produkty zapominane)

**Rozwiązania UI:**
- Wizualne wyróżnienie produktów z ilością 0 (opacity 0.6, czerwony akcent, ikona koszyka)
- Badge na FAB z liczbą produktów do kupienia (stały reminder)
- Quick actions: przycisk "Zużyte" zawsze widoczny
- Toast reminders dla nowych użytkowników (2-3 dni)
- Empty state spiżarni z clear CTA

### Punkt bólu 2: Niepotrzebne wydatki (duplikaty zakupów)

**Rozwiązania UI:**
- Pasek wyszukiwania w spiżarni (szybkie sprawdzenie co mam)
- Filtry: wszystkie/puste/z zapasami (łatwa orientacja)
- Grupowanie według kategorii (przejrzystość)
- Lista zakupów generowana z spiżarni (tylko to czego brakuje)
- Pole "Ilość pożądana" (kontrola nad uzupełnianiem)

### Punkt bólu 3: Czasochłonne planowanie

**Rozwiązania UI:**
- LLM processing dla szybkiego dodawania (jedno zdanie zamiast wielu kliknięć)
- FAB dla jednego kliknięcia: generuj listę
- Always-visible controls (+/-, "Zużyte") bez wchodzenia w edycję
- Swipe gestures jako alternatywna, szybka metoda
- Inline edycja w liście zakupów (bez dodatkowych ekranów)
- Automatyczne przekierowania po akcjach (mniej kliknięć)

### Punkt bólu 4: Brak organizacji

**Rozwiązania UI:**
- Kategorie (predefiniowane, spójne grupowanie)
- Akordeonny w spiżarni (collapse/expand dla przejrzystości)
- Historia list zakupów (max 10, archiwizacja)
- Onboarding z quick start (strukturyzowane rozpoczęcie)
- Spójny UI pattern (przyciski, kontrolki zawsze w tych samych miejscach)
- Clear visual hierarchy (typografia, spacing, kolory)

## 8. Responsywność i adaptacyjność

### Mobile (< 768px)

**Layout:**
- Single column
- Bottom navigation (4 items)
- Full-width content
- Stack layout (vertical)

**Interakcje:**
- Touch-optimized (min 44x44px hit areas)
- Swipe gestures (delete, edit)
- Pull-to-refresh (dla spiżarni/list)
- FAB w prawym dolnym rogu

**Typografia:**
- Base font: 16px
- Headings: 20px-24px
- Touch-friendly inputs (min 16px dla iOS)

### Desktop (≥ 768px)

**Layout:**
- Multi-column (sidebar + main content)
- Sidebar navigation (po lewej)
- Wider content area (max-width: 1200px)
- Grid layout dla kart

**Interakcje:**
- Hover states na wszystkich interaktywnych elementach
- Keyboard shortcuts (opcjonalnie)
- Larger hit areas (możliwe mniejsze ze względu na precyzję myszy)
- Context menus (prawy klik)

**Typografia:**
- Base font: 16px
- Headings: 24px-32px
- Większa line-height dla czytelności

### Breakpoints

```
Mobile:     0px - 767px
Desktop:    768px+
```

**Responsive components:**
- `BottomNavigation` (mobile) ↔ `Sidebar` (desktop)
- Single column ↔ Grid/Multi-column
- FAB position adjustment
- Modal size (full-screen mobile, centered desktop)

## 9. Stany aplikacji i feedback

### Loading States

| Scenariusz | UI Feedback |
|---|---|
| Początkowe ładowanie spiżarni | Full-screen `Spinner` + "Ładowanie spiżarni..." |
| Odświeżanie danych | Mały spinner na górze listy (pull-to-refresh style) |
| LLM processing | Spinner + "Analizuję produkty..." (w miejscu przycisku) |
| Zapisywanie formularza | Button disabled + spinner w środku + "Zapisuję..." |
| Generowanie listy | Modal z spinnerem + "Tworzę listę zakupów..." |
| Długie listy | Skeleton loader dla produktów podczas ładowania |

### Error States

| Typ błędu | UI Feedback |
|---|---|
| Walidacja formularza | `ErrorMessage` inline pod polem (czerwony, ikona) |
| Błąd API (network) | `Toast` error (góra ekranu) + przycisk "Spróbuj ponownie" |
| Timeout LLM | `Toast` error + sugestia: "Spróbuj z krótszym tekstem" |
| 401 Unauthorized (sesja wygasła) | `Toast` + auto przekierowanie do `/login` |
| 404 Not Found | Dedykowany ekran "Nie znaleziono" + przycisk "Wróć do spiżarni" |
| 500 Internal Server Error | Dedykowany ekran "Coś poszło nie tak" + przycisk "Odśwież stronę" |
| Pusta odpowiedź LLM | Empty state w `/add-products/verify` + CTA "Spróbuj ponownie" lub "Dodaj ręcznie" |
| Częściowy błąd bulk add | `Toast` warning: "Dodano X produktów. Y produktów pominięto (już istnieją)." |

### Success States

| Akcja | UI Feedback |
|---|---|
| Produkt dodany | `Toast` success: "Dodano produkt" + auto przekierowanie do `/pantry` |
| Produkt zaktualizowany | `Toast` success: "Produkt zaktualizowany" |
| Produkt usunięty | `Toast` success: "Produkt usunięty" + animacja fade-out |
| Lista wygenerowana | `Toast` success: "Lista zakupów utworzona" + przekierowanie do `/shopping-lists/:id` |
| Zakupy zakończone | `Toast` success: "Zakupy zakończone! Spiżarnia zaktualizowana." + przekierowanie do `/pantry` |
| Rejestracja | `Toast` success: "Konto utworzone! Witaj w SmartPantry 🎉" + przekierowanie do `/onboarding` |

### Empty States

| Widok | Empty State |
|---|---|
| Pusta spiżarnia | Ilustracja + "Twoja spiżarnia jest pusta" + CTA: "Dodaj tekstem", "Dodaj ręcznie", link do onboardingu |
| Brak list zakupów | Ilustracja + "Nie masz jeszcze list zakupów" + CTA: "Generuj pierwszą listę" |
| Brak sugestii LLM | "Nie rozpoznano produktów" + CTA: "Wróć i spróbuj ponownie", "Dodaj ręcznie" |
| Brak wyników wyszukiwania | "Nie znaleziono produktów" + "Spróbuj innej frazy" + przycisk clear search |
| Wszystkie produkty na stanie | Toast: "Wszystkie produkty na stanie! 🎉" + disabled FAB |

## 10. Bezpieczeństwo w UI

### Uwierzytelnianie

- Automatyczne przekierowanie do `/login` dla nieuwierzytelnionych
- Middleware sprawdza JWT token przed renderowaniem chronionych widoków
- Password input type="password" (ukryte znaki)
- Wyraźne komunikaty o błędach uwierzytelniania
- Informacja o wygaśnięciu sesji + opcja ponownego logowania
- Token JWT w `Authorization: Bearer <token>` header (obsługiwany przez Supabase SDK)

### Autoryzacja

- Row-Level Security (RLS) na poziomie bazy danych
- UI nie wyświetla danych innych użytkowników (enforced przez API)
- Brak możliwości manipulacji URL dla dostępu do cudzych zasobów

### Operacje destrukcyjne

| Akcja | Zabezpieczenie UI |
|---|---|
| Usunięcie produktu | Confirmation modal: "Czy na pewno chcesz usunąć {nazwa}?" |
| Zakończenie zakupów | Confirmation modal z podsumowaniem: "Dodać X produktów do spiżarni?" |
| Wylogowanie | Confirmation modal: "Czy na pewno chcesz się wylogować?" |
| Usunięcie listy zakupów | Confirmation modal: "Czy na pewno chcesz usunąć tę listę?" |

### Walidacja danych

- Walidacja po stronie klienta (real-time feedback)
- Walidacja po stronie serwera (bezpieczeństwo)
- Sanityzacja inputów (XSS prevention)
- Max length dla pól tekstowych (wyświetlany counter)
- Min/max dla liczb (disabled przyciski +/- gdy osiągnięto limit)

## 11. Dostępność (WCAG AA)

### Semantyczny HTML

- `<nav>` dla nawigacji
- `<main>` dla głównej treści
- `<button>` dla akcji (nie `<div>` z onClick)
- `<form>` dla formularzy
- `<label>` dla wszystkich inputów (przypisane przez `for`/`id`)

### ARIA

- `aria-label` dla ikon bez tekstu (np. przyciski +/-)
- `aria-describedby` dla komunikatów błędów przypisanych do pól
- `aria-live` dla dynamicznych komunikatów (toasty)
- `aria-expanded` dla akordeonów
- `aria-checked` dla checkboxów (jeśli custom)
- Focus trap w modalach (`aria-modal="true"`)

### Nawigacja klawiaturowa

- Tab/Shift+Tab dla przechodzenia między elementami
- Enter/Space dla aktywacji przycisków/checkboxów
- Escape dla zamknięcia modali
- Arrow keys dla nawigacji w listach (opcjonalnie)
- Skip to main content link (ukryty, widoczny na focus)
- Wyraźne focus states (outline, ring)

### Kontrast i czytelność

- Kontrast tekstu minimum 4.5:1 (WCAG AA)
- Kontrast UI elements minimum 3:1
- Focus indicators wyraźnie widoczne
- Nie tylko kolor do przekazywania informacji (ikony, tekst)
- Minimum font-size 16px dla czytelności

### Alt texts

- Alt texts dla wszystkich ilustracji
- Ikony z `aria-label` lub ukryty tekst
- Obrazy dekoracyjne z pustym alt=""

## 12. Przyszłe rozszerzenia (poza MVP)

### Potencjalne ulepszenia UI

- **Offline support**: Service Workers, local storage, sync po powrocie online
- **Dark mode**: Przełącznik w profilu, persystencja preferencji
- **Zaawansowane zarządzanie stanem**: React Query/SWR dla cache'owania i optymistic updates
- **PWA**: Instalacja aplikacji, push notifications
- **Zaawansowana analityka**: Dashboard w profilu (statystyki, wykresy)
- **Custom kategorie**: Możliwość tworzenia własnych kategorii
- **Daty ważności**: Tracking i powiadomienia o zbliżających się datach
- **Przepisy**: Generowanie przepisów na podstawie produktów w spiżarni
- **Udostępnianie list**: Współdzielenie listy zakupów z rodziną
- **Integracje**: Sklepy online, skanowanie paragonów
- **Multi-język**: i18n dla wsparcia wielu języków
- **Personalizacja**: Customizable UI (kolory, layout)

---

**Podsumowanie:**

Architektura UI SmartPantry została zaprojektowana z naciskiem na prostotę, dostępność i mobile-first approach. Kluczowe decyzje:

1. **Zunifikowany interfejs dodawania** (tekst/ręcznie) z ekranem weryfikacji
2. **Always-visible controls** w spiżarni dla szybkich akcji
3. **FAB** jako główna akcja (generowanie listy)
4. **Bottom nav (mobile) / Sidebar (desktop)** dla spójnej nawigacji
5. **Warstwowa obsługa błędów** (inline, toasty, dedykowane ekrany)
6. **Przemyślane empty states** z clear CTA
7. **Opcjonalny onboarding** z możliwością pominięcia

Wszystkie wymagania funkcjonalne i historyjki użytkownika są pokryte przez widoki i komponenty UI. Architektura jest gotowa do implementacji w MVP z możliwością rozbudowy w przyszłości.

