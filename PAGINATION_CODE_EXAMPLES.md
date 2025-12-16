# 💻 Pagination Implementation - Code Examples

## Overview

Tài liệu này chứa các code snippets và ví dụ triển khai phân trang.

---

## 1. Pagination Component

### File: `src/components/shared/Pagination.tsx`

**Imports:**
```tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
```

**Props Interface:**
```tsx
interface PaginationProps {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}
```

**Key Functions:**

1. **Calculate Display Range:**
```tsx
const startItem = (pageNumber - 1) * pageSize + 1;
const endItem = Math.min(pageNumber * pageSize, totalCount);
```

2. **Generate Page Numbers:**
```tsx
const getPageNumbers = () => {
  const pages: (number | string)[] = [];
  const maxVisible = 5;
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show: 1 ... 5 6 7 ... 15 format
    pages.push(1);
    
    let startPage = Math.max(2, pageNumber - 1);
    let endPage = Math.min(totalPages - 1, pageNumber + 1);
    
    if (pageNumber <= 3) {
      endPage = Math.min(totalPages - 1, 4);
    } else if (pageNumber >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
    }
    
    if (startPage > 2) pages.push('...');
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 1) pages.push('...');
    
    pages.push(totalPages);
  }
  
  return pages;
};
```

**JSX Structure:**
```tsx
<div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  {/* Page Size Selector */}
  <div className="flex items-center gap-2">
    <label htmlFor="pageSize">Số dòng/trang:</label>
    <select
      id="pageSize"
      value={pageSize}
      onChange={(e) => onPageSizeChange(Number(e.target.value))}
      className="rounded-md border border-gray-300 bg-white px-3 py-2"
    >
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </select>
  </div>

  {/* Items Range Info */}
  <div className="text-sm text-gray-600">
    Hiển thị <span className="font-semibold">{startItem}</span> đến{' '}
    <span className="font-semibold">{endItem}</span> trong tổng cộng{' '}
    <span className="font-semibold">{totalCount}</span> kết quả
  </div>

  {/* Navigation Buttons */}
  <div className="flex flex-wrap items-center justify-center gap-1">
    {/* Previous Button */}
    <button
      onClick={() => onPageChange(pageNumber - 1)}
      disabled={!hasPrevious}
      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronLeft className="h-4 w-4" />
    </button>

    {/* Page Numbers */}
    {pageNumbers.map((page, index) => (
      <React.Fragment key={index}>
        {page === '...' ? (
          <span className="px-2 py-2 text-gray-500">...</span>
        ) : (
          <button
            onClick={() => onPageChange(page as number)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              pageNumber === page
                ? 'bg-blue-500 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        )}
      </React.Fragment>
    ))}

    {/* Next Button */}
    <button
      onClick={() => onPageChange(pageNumber + 1)}
      disabled={!hasNext}
      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
</div>
```

---

## 2. TicketsTable Component

### File: `src/components/admin/TicketsTable.tsx`

**Updated Props Interface:**
```tsx
interface TicketsTableProps {
  tickets: Ticket[] | TicketFromApi[];
  locations: Location[];
  staffList?: unknown;
  onAssignTicket?: unknown;
  onViewTicket: (ticket: Ticket | TicketFromApi) => void;
  // Pagination props
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}
```

**Component Declaration:**
```tsx
const TicketsTable = ({
  tickets,
  locations,
  onViewTicket,
  pageNumber = 1,
  pageSize = 10,
  totalPages = 1,
  totalCount = 0,
  hasPrevious = false,
  hasNext = false,
  onPageChange,
  onPageSizeChange,
}: TicketsTableProps) => {
  // ...component logic...
};
```

**Pagination Rendering:**
```tsx
{/* Pagination */}
{totalPages > 0 && onPageChange && onPageSizeChange && (
  <Pagination
    pageNumber={pageNumber}
    pageSize={pageSize}
    totalPages={totalPages}
    totalCount={totalCount}
    hasPrevious={hasPrevious}
    hasNext={hasNext}
    onPageChange={onPageChange}
    onPageSizeChange={onPageSizeChange}
  />
)}
```

---

## 3. Admin Page Integration

### File: `src/pages/admin/admin-page.tsx`

**Pagination State:**
```tsx
const [paginationState, setPaginationState] = useState({
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPrevious: false,
  hasNext: false,
});
```

**Updated fetchTickets Function:**
```tsx
const fetchTickets = async (pageNumber: number = 1, pageSize: number = 10) => {
  setLoadingTickets(true);
  setTicketsError(null);
  try {
    const response = await ticketService.getAllTicketsFromApi(pageNumber, pageSize);
    console.log('✅ Fetched tickets from API:', response);
    
    // Set the tickets
    setApiTickets(response.data.items);
    
    // Update pagination state from response
    setPaginationState({
      pageNumber: response.data.pageNumber,
      pageSize: response.data.pageSize,
      totalCount: response.data.totalCount,
      totalPages: response.data.totalPages,
      hasPrevious: response.data.hasPrevious,
      hasNext: response.data.hasNext,
    });
  } catch (error) {
    console.error('❌ Error fetching tickets:', error);
    setTicketsError(error instanceof Error ? error.message : 'Failed to fetch tickets');
  } finally {
    setLoadingTickets(false);
  }
};
```

**Initial Load useEffect:**
```tsx
useEffect(() => {
  fetchTickets(1, 10);
}, []); // Run once on mount with page 1 and size 10
```

**Pagination Handlers:**
```tsx
// Handler for page change
const handlePageChange = (page: number) => {
  fetchTickets(page, paginationState.pageSize);
};

// Handler for page size change
const handlePageSizeChange = (size: number) => {
  fetchTickets(1, size); // Reset to page 1 when changing page size
};
```

**TicketsTable Usage:**
```tsx
{!loadingTickets && !ticketsError && (
  <TicketsTable
    tickets={apiTickets}
    locations={locations}
    staffList={adminStaffList}
    onAssignTicket={handleAssignTicket}
    onViewTicket={setSelectedTicketForReview}
    // Pagination props
    pageNumber={paginationState.pageNumber}
    pageSize={paginationState.pageSize}
    totalPages={paginationState.totalPages}
    totalCount={paginationState.totalCount}
    hasPrevious={paginationState.hasPrevious}
    hasNext={paginationState.hasNext}
    onPageChange={handlePageChange}
    onPageSizeChange={handlePageSizeChange}
  />
)}
```

---

## 4. Type Definitions

### Backend Response Type

```typescript
// src/types/index.ts

export interface GetAllTicketsResponse {
  status: boolean;
  message: string;
  data: {
    pageNumber: number;        // Current page (1-based)
    pageSize: number;          // Items per page
    totalCount: number;        // Total items in database
    totalPages: number;        // Total number of pages
    hasPrevious: boolean;      // Can navigate to previous page
    hasNext: boolean;          // Can navigate to next page
    items: TicketFromApi[];    // Array of tickets for this page
  };
  errors: string[];
}
```

---

## 5. Usage Examples

### Example 1: Basic Setup

```tsx
// In a component
const [pagination, setPagination] = useState({
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPrevious: false,
  hasNext: false,
});

const fetchData = async (page: number, size: number) => {
  const response = await api.get(`/tickets?page=${page}&size=${size}`);
  setPagination({
    pageNumber: response.data.pageNumber,
    pageSize: response.data.pageSize,
    totalCount: response.data.totalCount,
    totalPages: response.data.totalPages,
    hasPrevious: response.data.hasPrevious,
    hasNext: response.data.hasNext,
  });
};

return (
  <Pagination
    pageNumber={pagination.pageNumber}
    pageSize={pagination.pageSize}
    totalPages={pagination.totalPages}
    totalCount={pagination.totalCount}
    hasPrevious={pagination.hasPrevious}
    hasNext={pagination.hasNext}
    onPageChange={(page) => fetchData(page, pagination.pageSize)}
    onPageSizeChange={(size) => fetchData(1, size)}
  />
);
```

### Example 2: With Loading State

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handlePageChange = async (page: number) => {
  setLoading(true);
  try {
    await fetchTickets(page, paginationState.pageSize);
  } catch (err) {
    setError('Failed to load page');
  } finally {
    setLoading(false);
  }
};

return (
  <>
    {loading && <div>Loading...</div>}
    {error && <div className="text-red-600">{error}</div>}
    
    <Pagination
      {...paginationState}
      onPageChange={handlePageChange}
      onPageSizeChange={(size) => fetchTickets(1, size)}
    />
  </>
);
```

### Example 3: With Table

```tsx
const [items, setItems] = useState([]);
const [pagination, setPagination] = useState({...});

const loadPage = async (page: number, size: number) => {
  const response = await api.get(`/items?page=${page}&size=${size}`);
  setItems(response.data.items);
  setPagination(response.data);
};

useEffect(() => {
  loadPage(1, 10);
}, []);

return (
  <div>
    <table>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
    
    <Pagination
      pageNumber={pagination.pageNumber}
      pageSize={pagination.pageSize}
      totalPages={pagination.totalPages}
      totalCount={pagination.totalCount}
      hasPrevious={pagination.hasPrevious}
      hasNext={pagination.hasNext}
      onPageChange={(page) => loadPage(page, pagination.pageSize)}
      onPageSizeChange={(size) => loadPage(1, size)}
    />
  </div>
);
```

---

## 6. Styling Classes Reference

```tailwind
/* Container */
mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between

/* Select Dropdown */
rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
font-medium text-gray-700 shadow-sm hover:bg-gray-50 
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2

/* Button Base */
inline-flex items-center justify-center rounded-md border border-gray-300 
bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm 
hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 
focus:ring-offset-2

/* Current Page Button */
bg-blue-500 text-white shadow-sm focus:outline-none focus:ring-2 
focus:ring-blue-500 focus:ring-offset-2

/* Disabled Button */
disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 
disabled:opacity-50

/* Ellipsis */
px-2 py-2 text-gray-500

/* Info Text */
text-sm text-gray-600
```

---

## 7. Common Patterns

### Pattern 1: URL-based Pagination (Future)

```tsx
// Using URL params for pagination persistence
const navigate = useNavigate();
const [params] = useSearchParams();

const page = Number(params.get('page')) || 1;
const size = Number(params.get('size')) || 10;

const handlePageChange = (newPage: number) => {
  navigate(`?page=${newPage}&size=${size}`);
  fetchTickets(newPage, size);
};
```

### Pattern 2: Debounced Search + Pagination

```tsx
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  if (debouncedSearch) {
    setPagination({ ...pagination, pageNumber: 1 });
    fetchTickets(1, pagination.pageSize, debouncedSearch);
  }
}, [debouncedSearch]);
```

### Pattern 3: Cached Pagination

```tsx
const [cache, setCache] = useState<Map<string, any>>(new Map());

const fetchWithCache = async (page: number, size: number) => {
  const key = `${page}-${size}`;
  
  if (cache.has(key)) {
    const data = cache.get(key);
    setItems(data.items);
    setPagination(data);
  } else {
    const response = await api.get(`/items?page=${page}&size=${size}`);
    cache.set(key, response.data);
    setCache(new Map(cache));
    setItems(response.data.items);
    setPagination(response.data);
  }
};
```

---

## 8. API Integration

### Service Method

```typescript
// src/services/ticketService.ts

export const ticketService = {
  async getAllTicketsFromApi(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<GetAllTicketsResponse> {
    try {
      const response = await apiClient.get<GetAllTicketsResponse>(
        `/Ticket?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  },
};
```

### API Request

```
GET /Ticket?pageNumber=1&pageSize=10
Host: api.example.com
Authorization: Bearer token_here
```

### API Response

```json
{
  "status": true,
  "message": "Success",
  "data": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 150,
    "totalPages": 15,
    "hasPrevious": false,
    "hasNext": true,
    "items": [
      {
        "ticketCode": "TKT-0001",
        "title": "WiFi không hoạt động",
        "description": "Mạng WiFi ở phòng D11 không kết nối được",
        "status": "NEW",
        "createdAt": "2025-12-16T10:30:00Z",
        "resolveDeadline": "2025-12-17T10:30:00Z",
        "locationName": "Building D, Floor 1",
        "assignedToName": ""
      },
      {
        "ticketCode": "TKT-0002",
        "title": "Điện tắc",
        "description": "Điện tắc ở phòng D15",
        "status": "ASSIGNED",
        "createdAt": "2025-12-16T11:00:00Z",
        "resolveDeadline": "2025-12-17T11:00:00Z",
        "locationName": "Building D, Floor 1",
        "assignedToName": "Nguyễn Văn A"
      }
    ]
  },
  "errors": []
}
```

---

## 9. Error Handling

```tsx
// Error states
const [error, setError] = useState<string | null>(null);

const fetchTickets = async (page: number, size: number) => {
  try {
    setError(null);
    const response = await ticketService.getAllTicketsFromApi(page, size);
    
    // Success
    setApiTickets(response.data.items);
    setPaginationState({...});
    
  } catch (error) {
    // Error handling
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to load tickets';
    
    setError(errorMessage);
    console.error('❌ Error fetching tickets:', error);
    
  } finally {
    setLoadingTickets(false);
  }
};

// Display error
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
    <strong>Lỗi:</strong> {error}
  </div>
)}
```

---

## 10. Testing Examples

```typescript
// Using React Testing Library

describe('Pagination', () => {
  it('should render with correct props', () => {
    render(
      <Pagination
        pageNumber={1}
        pageSize={10}
        totalPages={5}
        totalCount={50}
        hasPrevious={false}
        hasNext={true}
        onPageChange={jest.fn()}
        onPageSizeChange={jest.fn()}
      />
    );
    
    expect(screen.getByText(/Hiển thị 1-10 trong 50/i)).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    const { getByTitle } = render(
      <Pagination
        pageNumber={1}
        pageSize={10}
        totalPages={5}
        totalCount={50}
        hasPrevious={false}
        hasNext={true}
        onPageChange={jest.fn()}
        onPageSizeChange={jest.fn()}
      />
    );
    
    expect(getByTitle('Trang trước')).toBeDisabled();
  });

  it('should call onPageChange when page button clicked', () => {
    const mockOnPageChange = jest.fn();
    render(
      <Pagination
        pageNumber={1}
        pageSize={10}
        totalPages={5}
        totalCount={50}
        hasPrevious={false}
        hasNext={true}
        onPageChange={mockOnPageChange}
        onPageSizeChange={jest.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('2'));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });
});
```

---

**End of Code Examples**

Để tìm hiểu thêm, xem các file triển khai thực tế trong workspace:
- [Pagination Component](./src/components/shared/Pagination.tsx)
- [TicketsTable Component](./src/components/admin/TicketsTable.tsx)
- [Admin Page](./src/pages/admin/admin-page.tsx)
