# 🔧 MenuHub - Comprehensive Backend Improvements Required

## 🚨 CRITICAL ISSUES FOUND

### Issue #1: MenuItem Creation Broken ❌
```
User submits items to Restaurant 4 (Hulya kahvaltı)
↓
Admin approves submission
↓
MenuItem created? ❌ NO → Still 0 items
Result: Menu page shows "Menü öğesi bulunamadı"
```

### Issue #2: Duplicate Item Handling Missing ❌
```
Current (WRONG):
User submits: "Burger | 395 TRY" → MenuItem ID:1 created, Price: 395
Next day: User submits: "Burger | 420 TRY" → Creates MenuItem ID:2 (DUPLICATE!)

Should be (UPDATE):
User submits: "Burger | 420 TRY" → MenuItem ID:1 UPDATED, Price: 420
- Update last_approved_at timestamp
- Update price only
- Keep history of changes
```

### Issue #3: No Admin Menu Management ❌
```
Admin cannot:
- Edit menu items
- Change prices
- Delete items
- Manage menu

Should be able to:
- PUT /api/menu-items/{id} → Update price/name
- DELETE /api/menu-items/{id} → Remove item
- POST /api/menu-items → Add manual item
```

---

## ✅ REQUIRED FIXES

### Fix #1: MenuItem Creation on Approval

**File**: `SubmissionController.java` or `AdminSubmissionController.java`

```java
@PostMapping("/{id}/approve")
public MenuSubmission approve(@PathVariable Long id) {
    MenuSubmission submission = repository.findById(id).orElseThrow();
    
    // Check for duplicates and create/update MenuItems
    List<MenuItem> items = processAndCreateMenuItems(submission);
    
    submission.setStatus("APPROVED");
    submission.setApprovedAt(LocalDateTime.now());
    return repository.save(submission);
}

private List<MenuItem> processAndCreateMenuItems(MenuSubmission submission) {
    List<MenuItem> items = new ArrayList<>();
    
    for (String line : submission.getRawText().split("\n")) {
        if (line.trim().isEmpty()) continue;
        
        // Parse: "Category | Name | Price TRY"
        String[] parts = line.split("\\|");
        if (parts.length < 3) continue;
        
        String category = parts[0].trim();
        String name = parts[1].trim();
        String price = parts[2].trim();
        
        // Check for duplicate (same restaurant + category + name)
        MenuItem existing = itemRepository.findByRestaurantIdAndCategoryAndName(
            submission.getRestaurantId(),
            category,
            name
        );
        
        if (existing != null) {
            // UPDATE existing item
            updateMenuItem(existing, price, submission.getId());
            items.add(existing);
        } else {
            // CREATE new item
            MenuItem item = new MenuItem();
            item.setRestaurantId(submission.getRestaurantId());
            item.setCategory(category);
            item.setName(name);
            item.setPrice(extractPrice(price));
            item.setCurrency(extractCurrency(price));
            item.setCreatedAt(LocalDateTime.now());
            item.setCreatedBySubmissionId(submission.getId());
            items.add(itemRepository.save(item));
        }
    }
    
    return items;
}

private void updateMenuItem(MenuItem item, String price, Long submissionId) {
    item.setPrice(extractPrice(price));
    item.setCurrency(extractCurrency(price));
    item.setUpdatedAt(LocalDateTime.now());
    item.setLastUpdatedBySubmissionId(submissionId);
    item.setLastApprovedAt(LocalDateTime.now());
    itemRepository.save(item);
}

private double extractPrice(String priceStr) {
    return Double.parseDouble(priceStr.replaceAll("[^0-9.,]", "").replace(",", "."));
}

private String extractCurrency(String priceStr) {
    if (priceStr.contains("TRY")) return "TRY";
    if (priceStr.contains("$")) return "USD";
    if (priceStr.contains("€")) return "EUR";
    return "TRY";
}
```

---

### Fix #2: MenuItem Update Endpoint

**File**: `MenuItemController.java` (NEW)

```java
@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {
    
    @PutMapping("/{id}")
    public MenuItem updateMenuItem(
        @PathVariable Long id,
        @Valid @RequestBody UpdateMenuItemRequest request
    ) {
        MenuItem item = repository.findById(id).orElseThrow();
        
        // Validate ownership (belongs to restaurant)
        if (!item.getRestaurantId().equals(request.restaurantId())) {
            throw new AccessDeniedException("Cannot update item from different restaurant");
        }
        
        item.setName(request.name());
        item.setCategory(request.category());
        item.setPrice(request.priceAmount());
        item.setCurrency(request.currency());
        item.setDescriptionText(request.descriptionText());
        item.setUpdatedAt(LocalDateTime.now());
        
        return repository.save(item);
    }
    
    @DeleteMapping("/{id}")
    public void deleteMenuItem(@PathVariable Long id) {
        MenuItem item = repository.findById(id).orElseThrow();
        repository.delete(item);
    }
}

record UpdateMenuItemRequest(
    Long restaurantId,
    String name,
    String category,
    Double priceAmount,
    String currency,
    String descriptionText
) {}
```

---

### Fix #3: MenuItem Entity Enhancements

**File**: `MenuItem.java`

```java
@Entity
public class MenuItem {
    // ...existing fields...
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @Column
    private LocalDateTime lastApprovedAt;
    
    @Column
    private Long createdBySubmissionId;
    
    @Column
    private Long lastUpdatedBySubmissionId;
    
    @PreUpdate
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

---

### Fix #4: Repository Query Methods

**File**: `MenuItemRepository.java`

```java
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
    // Find duplicate items
    MenuItem findByRestaurantIdAndCategoryAndName(
        Long restaurantId,
        String category,
        String name
    );
    
    // Find all items for restaurant
    List<MenuItem> findByRestaurantId(Long restaurantId);
    
    // Find items by submission
    List<MenuItem> findByCreatedBySubmissionIdOrLastUpdatedBySubmissionId(
        Long createdBySubmissionId,
        Long lastUpdatedBySubmissionId
    );
}
```

---

## 📋 Frontend Changes Required

### 1. Admin Menu Management Page

**File**: `/admin/restaurant/[id]/menu`

```typescript
// Components:
- MenuItemList (all items for restaurant)
- MenuItemEditModal (edit/delete)
- UpdateHistory (show version history)
- BulkActions (add multiple items)
```

### 2. API Methods

**File**: `/lib/api.ts`

```typescript
// Add new methods:
export async function updateMenuItem(id: number, data: UpdateMenuItemRequest) {
    return fetchJSON(`/menu-items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

export async function deleteMenuItem(id: number) {
    return fetchJSON(`/menu-items/${id}`, {
        method: "DELETE"
    });
}

export async function getMenuItemHistory(id: number) {
    return fetchJSON(`/menu-items/${id}/history`);
}
```

---

## 🧪 Testing Checklist

- [ ] Create submission for Restaurant 4 (Hulya kahvaltı)
- [ ] Admin approves it
- [ ] MenuItem created with correct price
- [ ] Menu page shows items
- [ ] Submit same item with different price
- [ ] Existing item updated (not duplicate)
- [ ] Admin can edit item price
- [ ] Admin can delete item
- [ ] History tracking works

---

## 🔴 Priority

**CRITICAL** - Menu system completely broken!
- Items not appearing in menu
- No update/duplicate detection
- No admin management

**Timeline**: Must fix before production

---

## 📊 Summary

| Component | Status | Impact |
|-----------|--------|--------|
| MenuItem Creation | ❌ Broken | HIGH |
| Duplicate Detection | ❌ Missing | HIGH |
| Update Logic | ❌ Missing | HIGH |
| Admin Management | ❌ Missing | HIGH |
| Menu Display | ⚠️ Partial | MEDIUM |


