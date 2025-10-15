# Plan implementacji widoku Listy Zakupów

## 1. Przegląd

Widok Listy Zakupów (`/shopping-lists`) to główny widok umożliwiający przeglądanie wszystkich list zakupów użytkownika (aktywnych i archiwalnych) oraz generowanie nowych list na podstawie produktów o zerowej ilości w spiżarni. Widok stanowi centralny punkt zarządzania listami zakupów i prezentuje użytkownikowi aktualną listę w rozbudowany sposób, podczas gdy archiwalne listy są wyświetlane w formie kompaktowych kart.

## 2. Routing widoku

**Ścieżka:** `/shopping-lists`

**Dostęp:** Wymagana autentykacja użytkownika (chroniony middleware)

**Nawigacja:** Dostępny z bottom navigation (mobile) lub sidebar (desktop) przez ikonę koszyka zakupowego

## 3. Struktura komponentów

```
ShoppingListsPage (Astro)
├── PageLayout
│   ├── Header
│   │   └── Title: "Listy zakupów"
│   ├── ShoppingListsContent (React)
│   │   ├── GenerateListButton (z licznikiem produktów)
│   │   ├── ActiveShoppingListCard (jeśli istnieje)
│   │   │   ├── ShoppingListHeader
│   │   │   ├── CategoryGroup[]
│   │   │   │   └── ShoppingListItemPreview[]
│   │   │   └── ViewDetailsButton
│   │   ├── ArchivedListsSection
│   │   │   ├── SectionHeader
│   │   │   └── ArchivedListCard[]
│   │   └── EmptyState (jeśli brak list)
│   ├── GenerateListModal (React)
│   │   ├── ModalHeader
│   │   ├── Input (nazwa listy)
│   │   └── ModalActions (Anuluj, Generuj)
│   └── Toast (React)
└── BottomNavigation / Sidebar
```

## 4. Szczegóły komponentów

### ShoppingListsPage (Astro)

**Opis:** Główny kontener strony, odpowiedzialny za pobranie danych z API i przekazanie ich do komponentów React.

**Główne elementy:**
- `PageLayout` - wrapper układu strony
- `ShoppingListsContent` - główna zawartość (React client:load)
- Skrypty do pobierania danych po stronie serwera

**Logika SSR:**
1. Pobieranie wszystkich list zakupów: GET /api/shopping-lists
2. Pobieranie liczby produktów do kupienia (quantity = 0): GET /api/pantry?show_empty=true
3. Przekazanie danych jako props do komponentu React

**Typy:**
- `ShoppingListSummaryDTO[]` - lista wszystkich list zakupów
- `PantryCategoryGroupDTO[]` - dane spiżarni do obliczenia liczby produktów do kupienia

**Obsługiwane zdarzenia:** Brak (tylko SSR)

### ShoppingListsContent (React)

**Opis:** Główny komponent React zarządzający logiką biznesową widoku, stanem modalów, filtrowaniem i wyświetlaniem list.

**Główne elementy:**
```tsx
<div className="shopping-lists-content">
  <GenerateListButton 
    emptyItemsCount={emptyItemsCount}
    onClick={handleOpenGenerateModal}
    disabled={emptyItemsCount === 0}
  />
  
  {activeList && (
    <ActiveShoppingListCard list={activeList} />
  )}
  
  {archivedLists.length > 0 && (
    <ArchivedListsSection lists={archivedLists} />
  )}
  
  {!activeList && archivedLists.length === 0 && (
    <EmptyState />
  )}
  
  <GenerateListModal 
    isOpen={isModalOpen}
    onClose={handleCloseModal}
    onGenerate={handleGenerateList}
    emptyItemsCount={emptyItemsCount}
  />
  
  <Toast {...toastProps} />
</div>
```

**Obsługiwane interakcje:**
- Kliknięcie "Generuj listę" → otworzenie modala
- Submit w modalu → wywołanie API i przekierowanie
- Kliknięcie na kartę listy → przekierowanie do `/shopping-lists/:id`

**Typy:**
- Props: `ShoppingListsContentProps`
- State: zarządzany przez custom hook `useShoppingLists`

**Propsy:**
```typescript
interface ShoppingListsContentProps {
  initialLists: ShoppingListSummaryDTO[];
  emptyItemsCount: number;
}
```

### GenerateListButton (React)

**Opis:** Wyróżniony przycisk do generowania nowej listy zakupów z badge'm pokazującym liczbę produktów do kupienia.

**Główne elementy:**
```tsx
<Button 
  variant="primary" 
  size="large"
  disabled={disabled}
  onClick={onClick}
  className="generate-list-button"
>
  <ShoppingCartIcon />
  <span>Generuj listę zakupów</span>
  {emptyItemsCount > 0 && (
    <Badge value={emptyItemsCount} variant="primary" />
  )}
</Button>
```

**Obsługiwane interakcje:**
- Click → wywołanie `onClick` callback

**Obsługiwana walidacja:**
- Disabled gdy `emptyItemsCount === 0`

**Typy:**
```typescript
interface GenerateListButtonProps {
  emptyItemsCount: number;
  onClick: () => void;
  disabled: boolean;
}
```

**Propsy:**
- `emptyItemsCount: number` - liczba produktów z ilością 0
- `onClick: () => void` - callback po kliknięciu
- `disabled: boolean` - czy przycisk jest nieaktywny

### ActiveShoppingListCard (React)

**Opis:** Rozbudowana karta prezentująca aktualną (najnowszą) listę zakupów z podglądem produktów i postępem.

**Główne elementy:**
```tsx
<Card className="active-shopping-list-card">
  <ShoppingListHeader 
    name={list.name}
    createdAt={list.created_at}
    itemCount={list.item_count}
    checkedCount={list.checked_count}
  />
  
  <ProgressBar 
    current={list.checked_count} 
    total={list.item_count} 
  />
  
  <div className="items-preview">
    {/* Maksymalnie 5 produktów jako preview */}
    {previewItems.map(item => (
      <ShoppingListItemPreview key={item.id} item={item} />
    ))}
    {list.item_count > 5 && (
      <span className="more-items">+ {list.item_count - 5} więcej</span>
    )}
  </div>
  
  <Button 
    variant="secondary" 
    onClick={() => navigate(`/shopping-lists/${list.id}`)}
  >
    Zobacz szczegóły
  </Button>
</Card>
```

**Obsługiwane interakcje:**
- Kliknięcie karty → przekierowanie do `/shopping-lists/:id`
- Kliknięcie "Zobacz szczegóły" → przekierowanie do `/shopping-lists/:id`

**Typy:**
```typescript
interface ActiveShoppingListCardProps {
  list: ShoppingListSummaryDTO;
}
```

**Propsy:**
- `list: ShoppingListSummaryDTO` - dane aktywnej listy

### ArchivedListsSection (React)

**Opis:** Sekcja wyświetlająca kompaktowe karty archiwalnych list zakupów (max 10 najnowszych).

**Główne elementy:**
```tsx
<section className="archived-lists-section">
  <h2>Poprzednie listy</h2>
  <div className="archived-lists-grid">
    {lists.map(list => (
      <ArchivedListCard key={list.id} list={list} />
    ))}
  </div>
</section>
```

**Obsługiwane interakcje:**
- Brak (delegowane do dzieci)

**Typy:**
```typescript
interface ArchivedListsSectionProps {
  lists: ShoppingListSummaryDTO[];
}
```

**Propsy:**
- `lists: ShoppingListSummaryDTO[]` - lista archiwalnych list (max 10)

### ArchivedListCard (React)

**Opis:** Kompaktowa karta archiwalne listy zakupów z podstawowymi informacjami.

**Główne elementy:**
```tsx
<Card 
  className="archived-list-card" 
  onClick={() => navigate(`/shopping-lists/${list.id}`)}
  role="button"
  tabIndex={0}
>
  <div className="card-header">
    <h3>{list.name}</h3>
    <Badge value={list.item_count} variant="secondary" />
  </div>
  <div className="card-meta">
    <time dateTime={list.created_at}>
      {formatDate(list.created_at)}
    </time>
    <span className="checked-status">
      {list.checked_count}/{list.item_count} odhaczonych
    </span>
  </div>
</Card>
```

**Obsługiwane interakcje:**
- Click → przekierowanie do `/shopping-lists/:id`
- Enter/Space (keyboard) → przekierowanie

**Typy:**
```typescript
interface ArchivedListCardProps {
  list: ShoppingListSummaryDTO;
}
```

**Propsy:**
- `list: ShoppingListSummaryDTO` - dane archiwalne listy

### GenerateListModal (React)

**Opis:** Modal do wprowadzenia nazwy i potwierdzenia generowania nowej listy zakupów.

**Główne elementy:**
```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <h2>Generuj listę zakupów</h2>
    <CloseButton onClick={onClose} />
  </ModalHeader>
  
  <ModalContent>
    <p>Znaleziono {emptyItemsCount} produktów do kupienia</p>
    
    <Input
      label="Nazwa listy"
      value={listName}
      onChange={setListName}
      placeholder="np. Zakupy tygodniowe"
      maxLength={255}
      autoFocus
    />
  </ModalContent>
  
  <ModalActions>
    <Button variant="ghost" onClick={onClose}>
      Anuluj
    </Button>
    <Button 
      variant="primary" 
      onClick={handleGenerate}
      disabled={isGenerating}
      loading={isGenerating}
    >
      Generuj
    </Button>
  </ModalActions>
</Modal>
```

**Obsługiwane interakcje:**
- Zmiana wartości input → aktualizacja stanu `listName`
- Click "Anuluj" → zamknięcie modala
- Click "Generuj" → wywołanie API i przekierowanie
- Escape → zamknięcie modala
- Enter w input → wywołanie generowania

**Obsługiwana walidacja:**
- Nazwa listy: opcjonalna, max 255 znaków
- Jeśli pusta → użycie domyślnej nazwy "Lista zakupów"

**Typy:**
```typescript
interface GenerateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name?: string) => Promise<void>;
  emptyItemsCount: number;
}
```

**Propsy:**
- `isOpen: boolean` - czy modal jest otwarty
- `onClose: () => void` - callback zamknięcia
- `onGenerate: (name?: string) => Promise<void>` - callback generowania
- `emptyItemsCount: number` - liczba produktów do kupienia

### EmptyState (React)

**Opis:** Stan pusty wyświetlany gdy użytkownik nie ma żadnych list zakupów.

**Główne elementy:**
```tsx
<div className="empty-state">
  <img 
    src="/images/empty-shopping-list.svg" 
    alt="Brak list zakupów"
    className="empty-state-image"
  />
  <h2>Nie masz jeszcze list zakupów</h2>
  <p>Wygeneruj swoją pierwszą listę na podstawie produktów w spiżarni</p>
  <Button 
    variant="primary" 
    onClick={onGenerateClick}
    disabled={emptyItemsCount === 0}
  >
    Generuj pierwszą listę
  </Button>
  {emptyItemsCount === 0 && (
    <p className="hint">
      Wszystkie produkty na stanie! Oznacz produkty jako zużyte w spiżarni, aby móc wygenerować listę.
    </p>
  )}
</div>
```

**Obsługiwane interakcje:**
- Click "Generuj pierwszą listę" → otworzenie modala generowania

**Typy:**
```typescript
interface EmptyStateProps {
  onGenerateClick: () => void;
  emptyItemsCount: number;
}
```

**Propsy:**
- `onGenerateClick: () => void` - callback do generowania listy
- `emptyItemsCount: number` - liczba produktów do kupienia

### ShoppingListItemPreview (React)

**Opis:** Kompaktowy podgląd pojedynczego produktu na liście (używany w ActiveShoppingListCard).

**Główne elementy:**
```tsx
<div className={`list-item-preview ${item.is_checked ? 'checked' : ''}`}>
  <Checkbox checked={item.is_checked} disabled />
  <span className="item-name">{item.product_name}</span>
  <span className="item-quantity">{item.quantity} szt.</span>
</div>
```

**Typy:**
```typescript
interface ShoppingListItemPreviewProps {
  item: ShoppingListItemDTO;
}
```

**Propsy:**
- `item: ShoppingListItemDTO` - dane produktu na liście

## 5. Typy

### Istniejące typy (z `src/types.ts`)

```typescript
// Używane bezpośrednio
export interface ShoppingListSummaryDTO extends ShoppingList {
  item_count: number;
  checked_count: number;
}

export interface ShoppingListDetailDTO extends ShoppingList {
  items: ShoppingListItemDTO[];
}

export interface ShoppingListItemDTO extends ShoppingListItem {
  product_name: string;
  category_id: number | null;
  category_name: string | null;
}

export interface GenerateShoppingListCommand {
  name?: string;
}

export interface PantryCategoryGroupDTO {
  category_id: number | null;
  category_name: string | null;
  items: PantryItemDTO[];
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationDTO;
  meta?: Record<string, unknown>;
}
```

### Nowe typy ViewModel

```typescript
/**
 * Props dla głównego komponentu widoku list zakupów
 */
export interface ShoppingListsContentProps {
  initialLists: ShoppingListSummaryDTO[];
  emptyItemsCount: number;
}

/**
 * Props dla przycisku generowania listy
 */
export interface GenerateListButtonProps {
  emptyItemsCount: number;
  onClick: () => void;
  disabled: boolean;
}

/**
 * Props dla karty aktywnej listy
 */
export interface ActiveShoppingListCardProps {
  list: ShoppingListSummaryDTO;
}

/**
 * Props dla sekcji archiwalnych list
 */
export interface ArchivedListsSectionProps {
  lists: ShoppingListSummaryDTO[];
}

/**
 * Props dla karty archiwalnej listy
 */
export interface ArchivedListCardProps {
  list: ShoppingListSummaryDTO;
}

/**
 * Props dla modala generowania listy
 */
export interface GenerateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name?: string) => Promise<void>;
  emptyItemsCount: number;
}

/**
 * Props dla stanu pustego
 */
export interface EmptyStateProps {
  onGenerateClick: () => void;
  emptyItemsCount: number;
}

/**
 * Props dla podglądu produktu na liście
 */
export interface ShoppingListItemPreviewProps {
  item: ShoppingListItemDTO;
}

/**
 * Stan zarządzany przez custom hook useShoppingLists
 */
export interface ShoppingListsState {
  lists: ShoppingListSummaryDTO[];
  activeList: ShoppingListSummaryDTO | null;
  archivedLists: ShoppingListSummaryDTO[];
  isModalOpen: boolean;
  isGenerating: boolean;
  toastProps: ToastProps;
}

/**
 * Props dla komponentu Toast
 */
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}
```

## 6. Zarządzanie stanem

### Custom Hook: `useShoppingLists`

Hook zarządzający stanem widoku list zakupów, logiką generowania i wyświetlania toastów.

**Lokalizacja:** `src/hooks/useShoppingLists.ts`

**Sygnatura:**
```typescript
function useShoppingLists(
  initialLists: ShoppingListSummaryDTO[],
  emptyItemsCount: number
): ShoppingListsState & {
  handleOpenGenerateModal: () => void;
  handleCloseModal: () => void;
  handleGenerateList: (name?: string) => Promise<void>;
}
```

**Stan wewnętrzny:**
```typescript
const [lists, setLists] = useState<ShoppingListSummaryDTO[]>(initialLists);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isGenerating, setIsGenerating] = useState(false);
const [toastProps, setToastProps] = useState<ToastProps>({
  message: '',
  type: 'info',
  isVisible: false,
  onClose: () => setToastProps(prev => ({ ...prev, isVisible: false }))
});
```

**Derived state:**
```typescript
const activeList = lists.length > 0 ? lists[0] : null;
const archivedLists = lists.slice(1, 11); // max 10 archiwalnych
```

**Funkcje:**

1. **`handleOpenGenerateModal`**
   - Sprawdza czy są produkty do kupienia
   - Jeśli nie: wyświetla toast "Wszystkie produkty na stanie! 🎉"
   - Jeśli tak: otwiera modal (`setIsModalOpen(true)`)

2. **`handleCloseModal`**
   - Zamyka modal (`setIsModalOpen(false)`)
   - Resetuje stan generowania (`setIsGenerating(false)`)

3. **`handleGenerateList`**
   - Ustawia `isGenerating(true)`
   - Wywołuje POST /api/shopping-lists/generate
   - Typy request/response:
     - Request: `GenerateShoppingListCommand { name?: string }`
     - Response: `ApiResponse<ShoppingListDetailDTO>`
   - W przypadku sukcesu:
     - Wyświetla toast sukcesu
     - Przekierowuje do `/shopping-lists/:id` (nowo utworzona lista)
   - W przypadku błędu 422 (NO_ITEMS_TO_ADD):
     - Wyświetla toast: "Wszystkie produkty na stanie! 🎉"
     - Zamyka modal
   - W przypadku innych błędów:
     - Wyświetla toast błędu z komunikatem
     - Pozostawia modal otwarty
   - Zawsze ustawia `isGenerating(false)` w finally

**Przykładowa implementacja funkcji generowania:**
```typescript
const handleGenerateList = async (name?: string) => {
  setIsGenerating(true);
  
  try {
    const response = await fetch('/api/shopping-lists/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name || undefined }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 422) {
        // NO_ITEMS_TO_ADD
        setToastProps({
          message: 'Wszystkie produkty na stanie! 🎉',
          type: 'info',
          isVisible: true,
          onClose: () => setToastProps(prev => ({ ...prev, isVisible: false }))
        });
        setIsModalOpen(false);
        return;
      }
      
      throw new Error(errorData.error.message || 'Nie udało się wygenerować listy');
    }
    
    const data: ApiResponse<ShoppingListDetailDTO> = await response.json();
    
    // Sukces - wyświetl toast i przekieruj
    setToastProps({
      message: 'Lista zakupów utworzona',
      type: 'success',
      isVisible: true,
      onClose: () => setToastProps(prev => ({ ...prev, isVisible: false }))
    });
    
    // Przekierowanie do nowo utworzonej listy
    window.location.href = `/shopping-lists/${data.data.id}`;
    
  } catch (error) {
    setToastProps({
      message: error instanceof Error ? error.message : 'Wystąpił błąd',
      type: 'error',
      isVisible: true,
      onClose: () => setToastProps(prev => ({ ...prev, isVisible: false }))
    });
  } finally {
    setIsGenerating(false);
  }
};
```

## 7. Integracja API

### Endpoint: POST /api/shopping-lists/generate

**Lokalizacja:** `src/pages/api/shopping-lists/generate.ts`

**Request:**
```typescript
// Type
interface GenerateShoppingListCommand {
  name?: string; // Opcjonalne, domyślnie "Shopping List"
}

// Przykład
{
  "name": "Zakupy tygodniowe"
}
```

**Response (201 Created):**
```typescript
// Type
interface ApiResponse<ShoppingListDetailDTO> {
  data: ShoppingListDetailDTO;
}

// Przykład
{
  "data": {
    "id": 1,
    "user_id": "uuid-here",
    "name": "Zakupy tygodniowe",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "items": [
      {
        "id": 1,
        "shopping_list_id": 1,
        "product_id": 5,
        "product_name": "Mleko",
        "category_id": 1,
        "category_name": "Nabiał",
        "quantity": 2,
        "is_checked": false,
        "created_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

**Błędy:**

1. **401 Unauthorized**
   ```json
   {
     "error": {
       "code": "UNAUTHORIZED",
       "message": "User not authenticated"
     }
   }
   ```

2. **422 Unprocessable Entity** (NO_ITEMS_TO_ADD)
   ```json
   {
     "error": {
       "code": "NO_ITEMS_TO_ADD",
       "message": "No items to add to shopping list",
       "details": {
         "reason": "All pantry items have quantity > 0"
       }
     }
   }
   ```

3. **400 Bad Request** (walidacja)
   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Invalid request data",
       "details": {
         "name": ["String must contain at most 255 character(s)"]
       }
     }
   }
   ```

4. **500 Internal Server Error**
   ```json
   {
     "error": {
       "code": "INTERNAL_SERVER_ERROR",
       "message": "An unexpected error occurred"
     }
   }
   ```

### Endpoint: GET /api/shopping-lists

**Pobieranie wszystkich list zakupów (SSR)**

**Request:**
```typescript
// Query params
interface ShoppingListQueryParams extends PaginationParams {
  page?: number;    // default: 1
  limit?: number;   // default: 20, max: 50
  sort?: string;    // default: "created_at"
  order?: "asc" | "desc"; // default: "desc"
}
```

**Response (200 OK):**
```typescript
{
  "data": [
    {
      "id": 1,
      "user_id": "uuid",
      "name": "Shopping List",
      "item_count": 5,
      "checked_count": 2,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### Endpoint: GET /api/pantry

**Pobieranie danych spiżarni do obliczenia liczby pustych produktów (SSR)**

**Request:**
```typescript
// Query params
interface PantryQueryParams {
  show_empty?: boolean; // default: true
}
```

**Response (200 OK):**
```typescript
{
  "data": [
    {
      "category_id": 1,
      "category_name": "Nabiał",
      "items": [
        {
          "id": 1,
          "product_id": 1,
          "product_name": "Mleko",
          "quantity": 0,
          "desired_quantity": 2,
          "updated_at": "2025-01-15T10:00:00Z"
        }
      ]
    }
  ]
}
```

**Logika obliczania emptyItemsCount:**
```typescript
const emptyItemsCount = pantryData.data
  .flatMap(category => category.items)
  .filter(item => item.quantity === 0)
  .length;
```

## 8. Interakcje użytkownika

### Scenariusz 1: Generowanie pierwszej listy (empty state)

1. Użytkownik wchodzi na `/shopping-lists`
2. Widzi empty state z informacją "Nie masz jeszcze list zakupów"
3. Kliknie "Generuj pierwszą listę"
4. Jeśli `emptyItemsCount === 0`:
   - Wyświetla toast: "Wszystkie produkty na stanie! 🎉"
   - Modal się nie otwiera
   - Pokazuje hint: "Oznacz produkty jako zużyte w spiżarni..."
5. Jeśli `emptyItemsCount > 0`:
   - Otwiera modal z polем do wprowadzenia nazwy
   - Pole auto-focus
   - Użytkownik wpisuje nazwę (opcjonalnie)
   - Kliknie "Generuj"
   - Przycisk pokazuje spinner i tekst "Generuję..."
   - Po sukcesie: toast "Lista zakupów utworzona" + przekierowanie do `/shopping-lists/:id`

### Scenariusz 2: Generowanie kolejnej listy (są już listy)

1. Użytkownik widzi aktywną listę i archiwum
2. Kliknie "Generuj listę zakupów" (przycisk z badge'm)
3. Badge pokazuje liczbę produktów do kupienia (np. "5")
4. Otwiera się modal
5. Modal pokazuje: "Znaleziono 5 produktów do kupienia"
6. Użytkownik wprowadza nazwę lub zostawia pustą (domyślna "Lista zakupów")
7. Kliknie "Generuj"
8. Po sukcesie: przekierowanie do nowej listy

### Scenariusz 3: Przeglądanie istniejących list

1. Użytkownik widzi aktywną listę jako pierwszą (rozbudowana karta)
2. Karta pokazuje:
   - Nazwę listy
   - Data utworzenia
   - Progress bar (5/10 odhaczonych)
   - Podgląd maksymalnie 5 produktów
   - "Zobacz szczegóły" button
3. Poniżej widzi sekcję "Poprzednie listy"
4. Archiwalne listy jako kompaktowe karty (nazwa, data, liczba produktów)
5. Kliknięcie na kartę → przekierowanie do `/shopping-lists/:id`

### Scenariusz 4: Obsługa błędu 422 (brak produktów)

1. Użytkownik kliknie "Generuj listę"
2. Otwiera się modal
3. Kliknie "Generuj"
4. API zwraca 422 (wszystkie produkty na stanie)
5. Toast: "Wszystkie produkty na stanie! 🎉"
6. Modal się zamyka
7. Przycisk "Generuj listę" jest disabled
8. Badge pokazuje "0"

### Scenariusz 5: Obsługa błędów sieciowych

1. Użytkownik kliknie "Generuj" w modalu
2. Brak połączenia z internetem
3. Request timeout lub network error
4. Toast error: "Brak połączenia. Sprawdź internet i spróbuj ponownie."
5. Modal pozostaje otwarty
6. Użytkownik może spróbować ponownie

### Scenariusz 6: Keyboard navigation

1. Użytkownik używa Tab do nawigacji
2. Focus przesuwa się: Generuj listę → Aktywna karta → Karty archiwalne
3. Enter/Space na karcie → przekierowanie do szczegółów
4. Escape w modalu → zamknięcie modala
5. Enter w polu input w modalu → generowanie listy

## 9. Warunki i walidacja

### Warunki biznesowe

1. **Generowanie listy możliwe tylko gdy są produkty z quantity = 0**
   - Komponent: `GenerateListButton`, `EmptyState`
   - Walidacja: `emptyItemsCount > 0`
   - UI feedback: przycisk disabled, toast informacyjny

2. **Aktywna lista to najnowsza (pierwsza na liście)**
   - Komponent: `ShoppingListsContent`
   - Logika: `lists[0]` to aktywna lista
   - UI: rozbudowana karta `ActiveShoppingListCard`

3. **Maksymalnie 10 archiwalnych list w widoku**
   - Komponent: `ArchivedListsSection`
   - Logika: `lists.slice(1, 11)`
   - UI: sekcja "Poprzednie listy"

4. **Nazwa listy opcjonalna (max 255 znaków)**
   - Komponent: `GenerateListModal`
   - Walidacja: `name?.length <= 255`
   - Domyślna wartość: "Lista zakupów" (obsługiwane przez API)

### Walidacja na poziomie komponentów

#### GenerateListModal

**Pole: Nazwa listy**
- Typ: string
- Wymagane: nie
- Maksymalna długość: 255 znaków
- Walidacja real-time: character counter jeśli > 200 znaków
- Error message: "Nazwa może mieć maksymalnie 255 znaków"

**Logika walidacji:**
```typescript
const [listName, setListName] = useState('');
const [error, setError] = useState<string | null>(null);

const handleNameChange = (value: string) => {
  setListName(value);
  
  if (value.length > 255) {
    setError('Nazwa może mieć maksymalnie 255 znaków');
  } else {
    setError(null);
  }
};

const isSubmitDisabled = error !== null || isGenerating;
```

#### GenerateListButton

**Disabled state gdy:**
- `emptyItemsCount === 0`
- Wizualne wyróżnienie: wyszarzony przycisk, badge "0"
- Tooltip: "Brak produktów do kupienia. Oznacz produkty jako zużyte w spiżarni."

#### EmptyState

**Warunek wyświetlenia:**
- `lists.length === 0` (brak jakichkolwiek list)
- Przycisk disabled gdy `emptyItemsCount === 0`
- Hint text gdy disabled: "Wszystkie produkty na stanie! Oznacz produkty jako zużyte w spiżarni, aby móc wygenerować listę."

### Walidacja odpowiedzi API

**POST /api/shopping-lists/generate:**

1. **Status 201** - sukces
   - Weryfikacja: `response.ok && response.status === 201`
   - Akcja: wyświetl toast, przekieruj

2. **Status 422** - brak produktów
   - Weryfikacja: `response.status === 422`
   - Akcja: wyświetl toast informacyjny, zamknij modal

3. **Status 400** - błąd walidacji
   - Weryfikacja: `response.status === 400`
   - Akcja: wyświetl error message z `details`, modal pozostaje otwarty

4. **Status 401** - brak autoryzacji
   - Weryfikacja: `response.status === 401`
   - Akcja: przekieruj do `/login`

5. **Status 500** - błąd serwera
   - Weryfikacja: `response.status === 500`
   - Akcja: wyświetl generic error toast

## 10. Obsługa błędów

### Błędy API

#### 1. Network Error (brak połączenia)

**Detekcja:**
```typescript
try {
  const response = await fetch(...);
} catch (error) {
  // Network error, timeout, CORS
}
```

**Obsługa:**
- Toast error: "Brak połączenia. Sprawdź internet i spróbuj ponownie."
- Modal pozostaje otwarty
- Button "Generuj" wraca do stanu aktywnego
- Użytkownik może spróbować ponownie

#### 2. 422 Unprocessable Entity (NO_ITEMS_TO_ADD)

**Detekcja:**
```typescript
if (response.status === 422) {
  const errorData = await response.json();
  if (errorData.error.code === 'NO_ITEMS_TO_ADD') {
    // Handle no items case
  }
}
```

**Obsługa:**
- Toast info: "Wszystkie produkty na stanie! 🎉"
- Modal się zamyka
- Przycisk "Generuj listę" staje się disabled
- Badge pokazuje "0"
- EmptyItemsCount aktualizowany do 0

#### 3. 400 Bad Request (walidacja)

**Detekcja:**
```typescript
if (response.status === 400) {
  const errorData = await response.json();
  // errorData.error.details zawiera szczegóły
}
```

**Obsługa:**
- Inline error message w modalu pod polem input
- Modal pozostaje otwarty
- Highlight pola z błędem (czerwony border)
- Error message: wyciągnięty z `details.name[0]`

#### 4. 401 Unauthorized (sesja wygasła)

**Detekcja:**
```typescript
if (response.status === 401) {
  // Session expired
}
```

**Obsługa:**
- Toast: "Sesja wygasła. Zaloguj się ponownie."
- Przekierowanie do `/login` po 2 sekundach
- Zapisanie intended URL w sessionStorage dla redirect po logowaniu

#### 5. 500 Internal Server Error

**Detekcja:**
```typescript
if (response.status === 500) {
  // Server error
}
```

**Obsługa:**
- Toast error: "Coś poszło nie tak. Spróbuj ponownie później."
- Modal pozostaje otwarty
- Log error do konsoli dla debugging
- Opcja: retry button w toaście

### Przypadki brzegowe

#### Pusta lista zakupów (wszystkie produkty na stanie)

**Scenariusz:**
- Użytkownik ma produkty w spiżarni, ale wszystkie mają quantity > 0
- `emptyItemsCount === 0`

**Obsługa:**
- Przycisk "Generuj listę" disabled
- Tooltip: "Brak produktów do kupienia"
- Kliknięcie przycisku (jeśli jakoś aktywne): toast "Wszystkie produkty na stanie! 🎉"
- Empty state (jeśli brak list): hint text o oznaczaniu produktów jako zużyte

#### Timeout podczas generowania

**Scenariusz:**
- Request trwa > 30 sekund (np. problem z bazą danych)

**Obsługa:**
- Ustawienie timeout na fetch (30s)
- Po timeout: toast error "Operacja trwa zbyt długo. Spróbuj ponownie."
- Modal pozostaje otwarty
- Reset stanu `isGenerating`

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch('/api/shopping-lists/generate', {
    signal: controller.signal,
    // ... other options
  });
} catch (error) {
  if (error.name === 'AbortError') {
    // Timeout
    setToastProps({
      message: 'Operacja trwa zbyt długo. Spróbuj ponownie.',
      type: 'error',
      isVisible: true,
      onClose: () => {}
    });
  }
} finally {
  clearTimeout(timeoutId);
}
```

#### Brak danych przy SSR

**Scenariusz:**
- Błąd przy pobieraniu danych w Astro (SSR)
- `initialLists` lub `emptyItemsCount` undefined

**Obsługa:**
- Default values w komponencie:
  ```typescript
  const { 
    initialLists = [], 
    emptyItemsCount = 0 
  } = Astro.props;
  ```
- Jeśli błąd SSR krytyczny: wyświetl error page z opcją refresh
- Log błędu SSR do serwera

#### Przekierowanie podczas generowania

**Scenariusz:**
- Request się udał, ale redirect nie działa (np. browser block)

**Obsługa:**
- Toast sukcesu z linkiem: "Lista utworzona. [Zobacz listę](/shopping-lists/:id)"
- Manual redirect przez `window.location.href`
- Jeśli fails: fallback link w toaście clickable

## 11. Kroki implementacji

### Krok 1: Utworzenie struktury plików

**Lokalizacja:** `src/pages/shopping-lists/index.astro`

Utworzyć główny plik strony Astro z następującą strukturą:

```astro
---
import PageLayout from '@/layouts/Layout.astro';
import ShoppingListsContent from '@/components/ShoppingListsContent';
import type { ShoppingListSummaryDTO, PantryCategoryGroupDTO } from '@/types';

// Auth check
const { supabase, user } = Astro.locals;
if (!user) {
  return Astro.redirect('/login');
}

// Fetch shopping lists
const listsResponse = await fetch(`${Astro.url.origin}/api/shopping-lists`, {
  headers: {
    Authorization: `Bearer ${user.accessToken}`,
  },
});

const listsData = await listsResponse.json();
const lists: ShoppingListSummaryDTO[] = listsData.data || [];

// Fetch pantry data to calculate empty items count
const pantryResponse = await fetch(
  `${Astro.url.origin}/api/pantry?show_empty=true`,
  {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  }
);

const pantryData = await pantryResponse.json();
const emptyItemsCount = (pantryData.data || [])
  .flatMap((category: PantryCategoryGroupDTO) => category.items)
  .filter((item) => item.quantity === 0).length;
---

<PageLayout title="Listy zakupów">
  <ShoppingListsContent 
    client:load
    initialLists={lists}
    emptyItemsCount={emptyItemsCount}
  />
</PageLayout>
```

### Krok 2: Utworzenie custom hook `useShoppingLists`

**Lokalizacja:** `src/hooks/useShoppingLists.ts`

Zaimplementować hook zarządzający stanem widoku:

```typescript
import { useState } from 'react';
import type { ShoppingListSummaryDTO, ToastProps } from '@/types';

export function useShoppingLists(
  initialLists: ShoppingListSummaryDTO[],
  emptyItemsCount: number
) {
  const [lists, setLists] = useState(initialLists);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastProps, setToastProps] = useState<ToastProps>({
    message: '',
    type: 'info',
    isVisible: false,
    onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
  });

  const activeList = lists.length > 0 ? lists[0] : null;
  const archivedLists = lists.slice(1, 11);

  const handleOpenGenerateModal = () => {
    if (emptyItemsCount === 0) {
      setToastProps({
        message: 'Wszystkie produkty na stanie! 🎉',
        type: 'info',
        isVisible: true,
        onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsGenerating(false);
  };

  const handleGenerateList = async (name?: string) => {
    // Implementacja jak w sekcji 6
  };

  return {
    lists,
    activeList,
    archivedLists,
    isModalOpen,
    isGenerating,
    toastProps,
    handleOpenGenerateModal,
    handleCloseModal,
    handleGenerateList,
  };
}
```

### Krok 3: Implementacja komponentu `ShoppingListsContent`

**Lokalizacja:** `src/components/ShoppingListsContent.tsx`

Główny komponent React:

```typescript
import React from 'react';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import GenerateListButton from './GenerateListButton';
import ActiveShoppingListCard from './ActiveShoppingListCard';
import ArchivedListsSection from './ArchivedListsSection';
import EmptyState from './EmptyState';
import GenerateListModal from './GenerateListModal';
import Toast from './ui/Toast';
import type { ShoppingListsContentProps } from '@/types';

export default function ShoppingListsContent({
  initialLists,
  emptyItemsCount,
}: ShoppingListsContentProps) {
  const {
    activeList,
    archivedLists,
    isModalOpen,
    isGenerating,
    toastProps,
    handleOpenGenerateModal,
    handleCloseModal,
    handleGenerateList,
  } = useShoppingLists(initialLists, emptyItemsCount);

  return (
    <div className="shopping-lists-content">
      <GenerateListButton
        emptyItemsCount={emptyItemsCount}
        onClick={handleOpenGenerateModal}
        disabled={emptyItemsCount === 0}
      />

      {activeList && <ActiveShoppingListCard list={activeList} />}

      {archivedLists.length > 0 && (
        <ArchivedListsSection lists={archivedLists} />
      )}

      {!activeList && archivedLists.length === 0 && (
        <EmptyState
          onGenerateClick={handleOpenGenerateModal}
          emptyItemsCount={emptyItemsCount}
        />
      )}

      <GenerateListModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onGenerate={handleGenerateList}
        emptyItemsCount={emptyItemsCount}
      />

      <Toast {...toastProps} />
    </div>
  );
}
```

### Krok 4: Implementacja komponentów UI

Kolejno zaimplementować następujące komponenty:

1. **GenerateListButton** (`src/components/GenerateListButton.tsx`)
   - Przycisk z ikoną koszyka i badge'm
   - Disabled state gdy `emptyItemsCount === 0`
   - Tooltip dla disabled state

2. **ActiveShoppingListCard** (`src/components/ActiveShoppingListCard.tsx`)
   - Rozbudowana karta z progress bar
   - Podgląd maksymalnie 5 produktów
   - Przycisk "Zobacz szczegóły"

3. **ArchivedListsSection** (`src/components/ArchivedListsSection.tsx`)
   - Sekcja z nagłówkiem "Poprzednie listy"
   - Grid archiwalnych kart

4. **ArchivedListCard** (`src/components/ArchivedListCard.tsx`)
   - Kompaktowa karta z nazwą, datą, licznikiem
   - Clickable → navigate to details

5. **EmptyState** (`src/components/EmptyState.tsx`)
   - Ilustracja + tekst + CTA
   - Conditional hint gdy `emptyItemsCount === 0`

6. **GenerateListModal** (`src/components/GenerateListModal.tsx`)
   - Modal z input dla nazwy listy
   - Submit handler
   - Loading state

7. **ShoppingListItemPreview** (`src/components/ShoppingListItemPreview.tsx`)
   - Kompaktowy preview produktu
   - Disabled checkbox, nazwa, ilość

### Krok 5: Stylowanie z Tailwind CSS

Dodać style dla wszystkich komponentów używając Tailwind CSS zgodnie z design system:

**Główne klasy:**
- Layout: `container`, `mx-auto`, `p-4`, `space-y-6`
- Cards: `bg-white`, `rounded-lg`, `shadow-md`, `p-6`
- Buttons: warianty z `shadcn/ui` (primary, secondary, ghost)
- Typography: `text-2xl`, `font-bold`, `text-gray-600`
- Mobile-first: breakpoint `md:` dla desktop variants

**Przykład dla GenerateListButton:**
```typescript
<Button
  variant="primary"
  size="lg"
  className="w-full md:w-auto relative"
  disabled={disabled}
  onClick={onClick}
>
  <ShoppingCartIcon className="w-5 h-5 mr-2" />
  <span>Generuj listę zakupów</span>
  {emptyItemsCount > 0 && (
    <Badge 
      value={emptyItemsCount} 
      className="absolute -top-2 -right-2"
    />
  )}
</Button>
```

### Krok 6: Implementacja funkcji `handleGenerateList`

W hook `useShoppingLists`, zaimplementować pełną logikę generowania:

```typescript
const handleGenerateList = async (name?: string) => {
  setIsGenerating(true);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch('/api/shopping-lists/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name || undefined }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.status === 401) {
      setToastProps({
        message: 'Sesja wygasła. Zaloguj się ponownie.',
        type: 'error',
        isVisible: true,
        onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    
    if (response.status === 422) {
      setToastProps({
        message: 'Wszystkie produkty na stanie! 🎉',
        type: 'info',
        isVisible: true,
        onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
      });
      setIsModalOpen(false);
      return;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || 'Nie udało się wygenerować listy'
      );
    }
    
    const data = await response.json();
    
    setToastProps({
      message: 'Lista zakupów utworzona',
      type: 'success',
      isVisible: true,
      onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
    });
    
    window.location.href = `/shopping-lists/${data.data.id}`;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      setToastProps({
        message: 'Operacja trwa zbyt długo. Spróbuj ponownie.',
        type: 'error',
        isVisible: true,
        onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
      });
    } else {
      setToastProps({
        message: error instanceof Error ? error.message : 'Wystąpił błąd',
        type: 'error',
        isVisible: true,
        onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
      });
    }
  } finally {
    setIsGenerating(false);
  }
};
```

### Krok 7: Dodanie typów do `src/types.ts`

Dodać nowe typy ViewModel zdefiniowane w sekcji 5:

```typescript
// Shopping Lists View Types
export interface ShoppingListsContentProps {
  initialLists: ShoppingListSummaryDTO[];
  emptyItemsCount: number;
}

export interface GenerateListButtonProps {
  emptyItemsCount: number;
  onClick: () => void;
  disabled: boolean;
}

// ... pozostałe typy z sekcji 5
```

### Krok 8: Testy manulane

Przeprowadzić testy manulane dla wszystkich scenariuszy:

1. **Empty state:**
   - Nowy użytkownik bez list
   - Wszystkie produkty na stanie

2. **Generowanie listy:**
   - Z nazwą customową
   - Z nazwą domyślną (pusta)
   - Z błędem 422 (brak produktów)
   - Z błędem network

3. **Nawigacja:**
   - Kliknięcie na aktywną listę
   - Kliknięcie na archiwalną listę
   - Keyboard navigation (Tab, Enter, Escape)

4. **Responsywność:**
   - Mobile (< 768px)
   - Desktop (≥ 768px)

### Krok 9: Accessibility audit

Sprawdzić dostępność:

1. **Keyboard navigation:**
   - Wszystkie interaktywne elementy dostępne przez Tab
   - Enter/Space aktywuje przyciski
   - Escape zamyka modal

2. **Screen reader:**
   - ARIA labels dla ikon
   - ARIA-describedby dla error messages
   - Proper heading hierarchy (h1, h2, h3)

3. **Contrast:**
   - Tekst minimum 4.5:1
   - UI elements minimum 3:1

4. **Focus states:**
   - Widoczne focus ring
   - Focus trap w modalu

### Krok 10: Optymalizacja i finalizacja

1. **Performance:**
   - Lazy loading komponentów jeśli potrzebne
   - Memoizacja callbacks w useShoppingLists
   - Optymalizacja re-renderów

2. **Error logging:**
   - Dodać logging błędów do konsoli
   - (Opcjonalnie) Integracja z Sentry

3. **Loading states:**
   - Skeleton loading dla SSR data fetching
   - Spinner podczas generowania

4. **Documentation:**
   - JSDoc comments dla komponentów
   - README dla developerów

### Krok 11: Integracja z nawigacją

Dodać link do `/shopping-lists` w:

1. **BottomNavigation** (mobile):
   ```tsx
   <NavItem 
     href="/shopping-lists" 
     icon={<ShoppingCartIcon />}
     label="Listy"
     active={currentPath === '/shopping-lists'}
   />
   ```

2. **Sidebar** (desktop):
   ```tsx
   <SidebarItem
     href="/shopping-lists"
     icon={<ShoppingCartIcon />}
     label="Listy zakupów"
     active={currentPath === '/shopping-lists'}
   />
   ```

### Krok 12: Deploy i monitoring

1. Build production:
   ```bash
   npm run build
   ```

2. Test production build locally:
   ```bash
   npm run preview
   ```

3. Deploy to production

4. Monitor:
   - Error rates
   - User flows
   - API response times
   - Toast/error messages frequency

---

## Podsumowanie

Plan implementacji obejmuje:

- **12 kroków** od struktury plików do deploymentu
- **8 głównych komponentów React** + hook zarządzający stanem
- **3 endpointy API** (GET lists, GET pantry, POST generate)
- **Kompleksową obsługę błędów** dla 5 typów błędów API
- **6 scenariuszy interakcji** użytkownika
- **Pełną dostępność** (WCAG AA)
- **Responsywny design** (mobile-first)

Czas implementacji: ~2-3 dni dla doświadczonego frontend developera.

