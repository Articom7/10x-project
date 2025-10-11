# Dokument wymagań produktu (PRD) - SmartPantry

## 1. Przegląd produktu
SmartPantry to inteligentna aplikacja webowa (z podejściem "mobile-first") zaprojektowana, aby pomóc użytkownikom w łatwym zarządzaniu domową spiżarnią. Aplikacja ma na celu rozwiązanie problemu marnowania żywności i nieefektywnych zakupów poprzez uproszczenie procesu śledzenia posiadanych produktów i planowania listy zakupów. Użytkownicy mogą dodawać produkty za pomocą wprowadzania tekstu w języku naturalnym (przetwarzanego przez model LLM) lub zaznaczać w aplikacji, oznaczać ich zużycie i generować automatyczne listy zakupów jednym kliknięciem. MVP skupia się na podstawowej funkcjonalności, prostocie obsługi i dostarczeniu realnej wartości poprzez redukcję marnotrawstwa i oszczędność czasu.

## 2. Problem użytkownika
Wiele osób ma trudności z efektywnym zarządzaniem zapasami żywności w domu. Prowadzi to do kilku kluczowych problemów:
- Marnowanie żywności: Produkty są zapominane i psują się, zanim zostaną zużyte.
- Niepotrzebne wydatki: Użytkownicy często kupują produkty, które już mają, ponieważ nie pamiętają stanu swojej spiżarni.
- Czasochłonne planowanie: Ręczne sprawdzanie zapasów i tworzenie list zakupów jest uciążliwe.
- Brak organizacji: Bez systematycznego podejścia, utrzymanie porządku w zapasach jest trudne i prowadzi do frustracji.

## 3. Wymagania funkcjonalne
- FR-01: System kont użytkowników: Użytkownicy muszą mieć możliwość założenia konta i logowania się przy użyciu adresu e-mail i hasła.
- FR-02: Dodawanie produktów przez wpisanie tekstu: Aplikacja wykorzystuje modele LLM (poprzez API) do analizy tekstu w języku naturalnym i generowania sugestii zakupionych produktów, które użytkownik musi zatwierdzić.
- FR-03: Ręczne zarządzanie produktami: Użytkownicy muszą mieć możliwość ręcznego dodawania, edytowania (nazwa, ilość) i usuwania produktów ze swojej spiżarni.
- FR-04: Oznaczanie zużycia produktów: Użytkownicy muszą móc oznaczyć produkt jako "zużyty" (ilość spada do zera) lub częściowo zużyty (zmniejszenie ilości).
- FR-05: Widok stanu spiżarni: Musi istnieć przejrzysty interfejs pokazujący wszystkie produkty w spiżarni, pogrupowane według predefiniowanych kategorii.
- FR-06: Automatyczne generowanie listy zakupów: Aplikacja musi umożliwiać wygenerowanie listy zakupów jednym kliknięciem, zawierającej produkty, których ilość spadła do zera.
- FR-07: Logika uzupełniania zapasów: Domyślnie lista zakupów powinna sugerować uzupełnienie produktu do jego historycznie maksymalnej ilości. Użytkownik musi mieć możliwość zdefiniowania własnej "ilości pożądanej" dla każdego produktu, która będzie miała priorytet.
- FR-08: Interaktywna lista zakupów: Wygenerowana lista zakupów musi być interaktywna, umożliwiając użytkownikom odhaczanie kupionych pozycji.
- FR-09: Onboarding użytkownika: Nowi użytkownicy powinni być przeprowadzani przez prosty proces wdrożeniowy, który obejmuje opcję "szybkiego startu" z możliwością dodania popularnych produktów do spiżarni.
- FR-10: Proste powiadomienia: Aplikacja powinna wykorzystywać proste powiadomienia (np. w aplikacji), aby zachęcać użytkowników do regularnego aktualizowania stanu spiżarni.

## 4. Granice produktu
Następujące funkcje są wyraźnie wykluczone z zakresu MVP:
- Dodawanie produktów na podstawie zdjęcia paragonu.
- Generowanie przepisów na podstawie dostępnych produktów.
- Integracje z zewnętrznymi sklepami internetowymi.
- Jakiekolwiek funkcje społecznościowe (np. dzielenie się listami zakupów).
- Zaawansowana analiza wartości odżywczych produktów.
- Dedykowane aplikacje mobilne na iOS i Android (MVP to wyłącznie responsywna aplikacja webowa).
- Śledzenie dat ważności produktów.
- Możliwość tworzenia i edytowania własnych kategorii produktów.

## 5. Historyjki użytkowników

---

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji przy użyciu mojego adresu e-mail i hasła, aby móc bezpiecznie przechowywać dane o mojej spiżarni.
- Kryteria akceptacji:
  1. Formularz rejestracji zawiera pola na adres e-mail, hasło i potwierdzenie hasła.
  2. Walidacja po stronie klienta i serwera sprawdza, czy e-mail ma poprawny format.
  3. Walidacja sprawdza, czy hasło ma co najmniej 8 znaków.
  4. Walidacja sprawdza, czy hasło i jego potwierdzenie są identyczne.
  5. System sprawdza, czy podany adres e-mail nie jest już zarejestrowany.
  6. Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany do procesu onboardingu.

---

- ID: US-002
- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się do aplikacji przy użyciu mojego adresu e-mail i hasła, aby uzyskać dostęp do mojej spiżarni.
- Kryteria akceptacji:
  1. Formularz logowania zawiera pola na adres e-mail i hasło.
  2. Po wprowadzeniu poprawnych danych uwierzytelniających użytkownik jest zalogowany i przekierowany do widoku swojej spiżarni.
  3. W przypadku wprowadzenia nieprawidłowych danych, wyświetlany jest czytelny komunikat o błędzie.
  4. Sesja użytkownika jest utrzymywana po zamknięciu i ponownym otwarciu przeglądarki.

---

- ID: US-003
- Tytuł: Wylogowywanie użytkownika
- Opis: Jako zalogowany użytkownik, chcę móc się wylogować, aby zabezpieczyć dostęp do mojego konta na współdzielonym urządzeniu.
- Kryteria akceptacji:
  1. W interfejsie aplikacji znajduje się wyraźnie oznaczony przycisk "Wyloguj".
  2. Po kliknięciu przycisku sesja użytkownika jest kończona, a on sam zostaje przekierowany na stronę logowania.

---

- ID: US-004
- Tytuł: Onboarding nowego użytkownika
- Opis: Jako nowy użytkownik, po pierwszym zalogowaniu chcę przejść przez krótki proces wdrożeniowy, który pomoże mi szybko zapełnić moją spiżarnię.
- Kryteria akceptacji:
  1. Po rejestracji użytkownikowi wyświetlany jest ekran powitalny.
  2. Użytkownik ma opcję "szybkiego startu", która prezentuje listę popularnych produktów (np. mleko, chleb, jajka, masło).
  3. Użytkownik może zaznaczyć produkty z listy, aby od razu dodać je do swojej spiżarni z domyślną ilością (np. 1).
  4. Użytkownik może pominąć ten krok i przejść bezpośrednio do pustej spiżarni.

---

- ID: US-005
- Tytuł: Dodawanie produktów za pomocą tekstu analizowanego przez LLM
- Opis: Jako użytkownik, chcę móc szybko dodać produkty po powrocie z zakupów, wpisując jedno zdanie w języku naturalnym, aby system inteligentnie zasugerował mi listę produktów do dodania.
- Kryteria akceptacji:
  1. W interfejsie znajduje się pole tekstowe do wprowadzania opisu zakupów.
  2. Po wprowadzeniu tekstu i zatwierdzeniu, jest on wysyłany do zewnętrznego API modelu LLM.
  3. Model LLM przetwarza tekst i zwraca ustrukturyzowaną listę propozycji produktów (nazwa, ilość).
  4. Aplikacja wyświetla użytkownikowi wygenerowaną listę sugestii do weryfikacji.
  5. Użytkownik może edytować (nazwę, ilość) lub usunąć każdą sugestię z listy.
  6. Po zatwierdzeniu przez użytkownika, produkty z finalnej listy są dodawane do spiżarni (nowe produkty są tworzone, a istniejące mają aktualizowaną ilość).

---

- ID: US-006
- Tytuł: Ręczne dodawanie produktu
- Opis: Jako użytkownik, chcę mieć możliwość ręcznego dodania pojedynczego produktu do spiżarni, podając jego nazwę i ilość.
- Kryteria akceptacji:
  1. Dostępny jest formularz z polami na nazwę produktu i jego ilość.
  2. Po zatwierdzeniu formularza produkt jest dodawany do listy w spiżarni.
  3. Pole ilości domyślnie ustawione jest na 1.

---

- ID: US-007
- Tytuł: Przeglądanie stanu spiżarni
- Opis: Jako użytkownik, chcę widzieć listę wszystkich produktów w mojej spiżarni, aby szybko zorientować się, co posiadam.
- Kryteria akceptacji:
  1. Główny widok aplikacji to lista produktów w spiżarni.
  2. Przy każdym produkcie widoczna jest jego nazwa i aktualna ilość.
  3. Produkty są pogrupowane według predefiniowanych, niemodyfikowalnych kategorii (np. Nabiał, Pieczywo, Warzywa).

---

- ID: US-008
- Tytuł: Edycja produktu w spiżarni
- Opis: Jako użytkownik, chcę mieć możliwość edycji nazwy i ilości produktu, który już znajduje się w mojej spiżarni, aby poprawić błędy lub zaktualizować stan.
- Kryteria akceptacji:
  1. Każdy produkt na liście ma opcję "Edytuj".
  2. Po wybraniu opcji edycji, użytkownik może zmienić nazwę i ilość produktu.
  3. Zmiany są zapisywane i odzwierciedlane w widoku spiżarni.

---

- ID: US-009
- Tytuł: Oznaczanie całkowitego zużycia produktu
- Opis: Jako użytkownik, chcę móc szybko oznaczyć, że produkt się skończył, aby aplikacja wiedziała, że należy go dodać do listy zakupów.
- Kryteria akceptacji:
  1. Każdy produkt na liście ma przycisk do oznaczenia go jako "zużyty".
  2. Po kliknięciu przycisku ilość produktu jest ustawiana na 0.
  3. Produkt pozostaje widoczny na liście w spiżarni z ilością 0, aby mógł zostać uwzględniony przy generowaniu listy zakupów.

---

- ID: US-010
- Tytuł: Oznaczanie częściowego zużycia produktu
- Opis: Jako użytkownik, chcę móc łatwo zmniejszyć ilość produktu, gdy zużyję jego część, aby utrzymać aktualny stan spiżarni.
- Kryteria akceptacji:
  1. Obok ilości produktu znajdują się przyciski (+) i (-), pozwalające na szybką zmianę ilości.
  2. Zmniejszenie ilości za pomocą przycisku (-) aktualizuje stan produktu.
  3. Ilość nie może spaść poniżej 0.

---

- ID: US-011
- Tytuł: Usuwanie produktu ze spiżarni
- Opis: Jako użytkownik, chcę móc na stałe usunąć produkt ze spiżarni, jeśli nie planuję go więcej kupować.
- Kryteria akceptacji:
  1. Każdy produkt na liście ma opcję "Usuń".
  2. Po wybraniu opcji usuwania wyświetlane jest potwierdzenie, aby zapobiec przypadkowemu usunięciu.
  3. Po potwierdzeniu produkt jest trwale usuwany z bazy danych użytkownika.

---

- ID: US-012
- Tytuł: Generowanie listy zakupów
- Opis: Jako użytkownik, chcę móc jednym kliknięciem wygenerować listę zakupów na podstawie produktów, które mi się skończyły.
- Kryteria akceptacji:
  1. W interfejsie jest dostępny przycisk "Generuj listę zakupów".
  2. Po kliknięciu aplikacja tworzy listę zawierającą wszystkie produkty, których ilość w spiżarni wynosi 0.
  3. Ilość do kupienia dla każdego produktu jest określana na podstawie jego historycznej maksymalnej ilości lub "ilości pożądanej", jeśli została ustawiona przez użytkownika.
  4. Po wygenerowaniu listy użytkownik jest przekierowywany do jej widoku.

---

- ID: US-013
- Tytuł: Interakcja z listą zakupów
- Opis: Jako użytkownik, chcę móc korzystać z wygenerowanej listy zakupów w sklepie, odhaczając produkty, które już włożyłem do koszyka.
- Kryteria akceptacji:
  1. Lista zakupów jest czytelna i zoptymalizowana pod kątem urządzeń mobilnych.
  2. Każda pozycja na liście ma pole wyboru (checkbox).
  3. Użytkownik może odhaczyć produkt, co wizualnie go wyróżnia (np. przekreślenie).
  4. Stan odhaczenia jest zapisywany, aby użytkownik mógł kontynuować zakupy później.
  5. Istnieje opcja dodania produktów do spiżarni na podstawie odhaczonych pozycji na liście.

---

- ID: US-014
- Tytuł: Ustawienie pożądanej ilości produktu
- Opis: Jako użytkownik, chcę mieć możliwość zdefiniowania, ile sztuk danego produktu chcę zawsze mieć w domu, aby lista zakupów była lepiej dopasowana do moich potrzeb.
- Kryteria akceptacji:
  1. W opcjach edycji produktu znajduje się pole "Ilość pożądana".
  2. Użytkownik może wpisać w tym polu liczbę.
  3. Jeśli "ilość pożądana" jest ustawiona, logika generowania listy zakupów używa tej wartości zamiast historycznego maksimum.

## 6. Metryki sukcesu
- 1. Zaangażowanie użytkowników:
  - Cel: 80% aktywnych użytkowników regularnie aktualizuje stan spiżarni (co najmniej 2 razy w tygodniu).
  - Sposób pomiaru: Śledzenie zdarzeń dodania, zużycia lub edycji produktu w bazie danych i agregowanie liczby tych akcji na użytkownika w ujęciu tygodniowym.

- 2. Wykorzystanie listy zakupów:
  - Cel: 70% wygenerowanych list zakupów jest używanych podczas rzeczywistych zakupów.
  - Sposób pomiaru: Lista jest uznawana za "użytą", jeśli użytkownik odhaczy co najmniej jeden produkt. Będziemy mierzyć stosunek list "użytych" do wszystkich wygenerowanych list.

- 3. Redukcja marnowania żywności:
  - Cel: 60% użytkowników zgłasza zmniejszenie marnowania żywności po 3 miesiącach użytkowania.
  - Sposób pomiaru: Przeprowadzenie opcjonalnej ankiety w aplikacji dla użytkowników, którzy są zarejestrowani od co najmniej 3 miesięcy, z pytaniem o ich subiektywną ocenę wpływu aplikacji na marnowanie żywności.
