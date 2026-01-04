# Pages Function API Endpoints

This directory contains Cloudflare Pages Function stubs for API endpoints supporting materials search, BOQ retrieval, and quote retrieval.

## Directory Structure

```
pages/next-app/functions/api/
├── materials.ts    # Materials search endpoint
├── boq.ts         # BOQ retrieval endpoint
└── quotes.ts      # Quote retrieval endpoint
```

## API Endpoints

### 1. `/api/materials` - Materials Search

Queries the `v_materials_search` view to search for materials.

**Method:** GET

**Query Parameters:**
- `search` (required) - Search term to match against material name, tags, brand, or category

**Example Request:**
```
GET /api/materials?search=marble
```

**Response:**
```json
[
  {
    "rowid": 1,
    "id": "mat-001",
    "sku": "MAR-WHT-001",
    "name": "White Marble",
    "category": "Stone",
    "brand": "Premium Stone Co",
    "uom": "sqft",
    "tags": "marble white natural stone"
  }
]
```

**Features:**
- Full-text search across name, tags, brand, and category fields
- Returns up to 50 matching results
- Proper error handling for missing search parameter

---

### 2. `/api/boq` - BOQ Retrieval

Fetches Bill of Quantities (BOQ) line items for a specified project.

**Method:** GET

**Query Parameters:**
- `project` (required) - Project name (e.g., "Demo Villa Renovation")

**Example Request:**
```
GET /api/boq?project=Demo%20Villa%20Renovation
```

**Response:**
```json
[
  {
    "id": "boq-001",
    "item_name": "Floor Tiles - Marble",
    "qty": 150,
    "unit": "sqft",
    "unit_price": 25.50,
    "currency": "USD",
    "metadata_json": "{}",
    "line_total": 3825.00
  }
]
```

**Features:**
- Joins `projects` and `boq_items` tables
- Calculates `line_total` as `qty * unit_price`
- Orders results by creation date (ascending)
- Returns empty array if project not found

---

### 3. `/api/quotes` - Quote Retrieval

Fetches the latest quote for a specified project.

**Method:** GET

**Query Parameters:**
- `project` (required) - Project name (e.g., "Demo Villa Renovation")

**Example Request:**
```
GET /api/quotes?project=Demo%20Villa%20Renovation
```

**Response:**
```json
[
  {
    "id": "quote-001",
    "version": 3,
    "status": "approved",
    "currency": "USD",
    "total_amount": 45000.00,
    "notes": "Final quote with material upgrades",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Features:**
- Returns the latest quote based on version number and creation date
- Orders by `version DESC, created_at DESC`
- Limits to 1 result (most recent)
- Returns empty array if no quote found

---

## Technical Details

### TypeScript Types

All endpoints use Cloudflare Pages Functions with D1 Database binding:

```typescript
export const onRequest: PagesFunction<{ DB: D1Database }> = async ({ env, request }) => {
  // Implementation
};
```

### Error Handling

All endpoints implement comprehensive error handling:
- **400 Bad Request** - Missing or invalid required parameters
- **500 Internal Server Error** - Database or execution errors

### Response Format

All responses are JSON with proper content-type headers:
```typescript
{
  "content-type": "application/json; charset=utf-8"
}
```

### Security Considerations

1. **Parameter Validation**: All required parameters are validated before database queries
2. **SQL Injection Prevention**: Uses parameterized queries with `.bind()`
3. **Error Messages**: Safe error messages without exposing internal details
4. **Result Limits**: Materials search limited to 50 results to prevent resource exhaustion

---

## Testing

Run the validation script to verify all endpoints are properly configured:

```bash
./test_boq.sh
```

This script validates:
- Directory structure
- File existence
- Function signatures
- Query patterns
- Parameter handling
- Error handling
- Response formatting

---

## Database Schema Requirements

### Tables Required

1. **`v_materials_search`** - Materialized view or table with columns:
   - `rowid`, `id`, `sku`, `name`, `category`, `brand`, `uom`, `tags`
   - Full-text search support on `name`, `tags`, `brand`, `category`

2. **`projects`** - Project master table:
   - `id`, `name`, and other project fields

3. **`boq_items`** - Bill of Quantities items:
   - `id`, `project_id`, `item_name`, `qty`, `unit`, `unit_price`, `currency`, `metadata_json`, `created_at`

4. **`quotes`** - Project quotes:
   - `id`, `project_id`, `version`, `status`, `currency`, `total_amount`, `notes`, `created_at`

---

## Cloud-Agnostic Design

These endpoints follow the repository's cloud-agnostic architecture principles:
- ✅ No hard-coded cloud provider references
- ✅ Standard TypeScript and Web APIs
- ✅ Compatible with multiple serverless platforms
- ✅ Minimal dependencies

---

## Future Enhancements

Potential improvements for production use:
- Add authentication/authorization middleware
- Implement rate limiting
- Add request logging
- Include pagination for large result sets
- Add query result caching
- Implement field filtering and sorting options
