# MenuHub - Backend Issues & Fixes Needed

## ⚠️ CRITICAL ISSUES

### 1. Menu Items Not Created on Approval
**Problem**: When admin approves a submission, MenuItem entities are NOT created in the database.

**Current Behavior**:
```
Frontend: User submits items → Submission created (PENDING_REVIEW)
Admin approves → Submission status changes to APPROVED
Backend: MenuItem created? ❌ NO
Result: Menu page shows "Menü öğesi bulunamadı"
```

**Required Fix in Backend**:
```java
// In SubmissionController.approveSubmission()
@PostMapping("/{id}/approve")
public MenuSubmission approve(@PathVariable Long id) {
    MenuSubmission submission = repository.findById(id).orElseThrow();
    
    // Parse the rawText and create MenuItems
    List<MenuItem> items = parseAndCreateMenuItems(submission);
    
    submission.setStatus("APPROVED");
    submission.setApprovedAt(LocalDateTime.now());
    return repository.save(submission);
}

private List<MenuItem> parseAndCreateMenuItems(MenuSubmission submission) {
    // Parse rawText: "Category | Name | Price TRY"
    List<MenuItem> items = new ArrayList<>();
    for (String line : submission.getRawText().split("\n")) {
        MenuItem item = new MenuItem();
        // Parse and set: category, name, price, currency
        item.setRestaurantId(submission.getRestaurantId());
        item.setCreatedAt(LocalDateTime.now());
        items.add(itemRepository.save(item));
    }
    return items;
}
```

### 2. Menu Items Endpoint Returns 404
**Problem**: `/api/menu-items?restaurantId=X` returns 404 for restaurants that have no items.

**Expected**: Return empty array `[]` instead of 404

**Current API**: Returning 404
**Should Return**: `{ "content": [] }`

---

## ✅ FRONTEND FIXES COMPLETED

### 1. Admin Buttons Now Work for All Statuses
- ✅ PENDING_REVIEW submissions: Can approve or reject
- ✅ APPROVED submissions: Can reject to revert
- ✅ REJECTED submissions: Can approve to revert
- Shows status indicator: "✓ Onaylandı" / "✗ Reddedildi"

### 2. Tab Filtering Fixed
- ✅ Pending tab shows only PENDING_REVIEW
- ✅ Approved tab shows only APPROVED
- ✅ Rejected tab shows only REJECTED

### 3. Menu Page Template Ready
- ✅ Route: `/menu/[id]`
- ✅ Displays restaurant info + approval status
- ✅ Groups items by category
- ✅ Shows name, price, description
- ⏳ Waiting for backend to create menu items

---

## 📋 Testing Checklist

- [ ] Create submission as user
- [ ] Admin approves it
- [ ] Menu item appears in `/menu/[id]` page
- [ ] Admin can reject approved submission
- [ ] Admin can approve rejected submission
- [ ] Approved tab shows correct items
- [ ] Pending tab shows correct items
- [ ] Rejected tab shows correct items

---

## 🔧 Backend Changes Required

**File**: `SubmissionController.java`

1. Add MenuItem creation logic to `approve()` method
2. Add MenuItem deletion logic to `reject()` method (if approval created items)
3. Make menu-items endpoint return empty array instead of 404

**Files to Modify**:
- `/backend/src/main/java/com/menuhub/api/submission/SubmissionController.java`
- `/backend/src/main/java/com/menuhub/api/menu/MenuController.java` (or wherever GET /api/menu-items is)

---

## Priority
🔴 **HIGH** - Menu items creation is critical for user experience

Users can submit items, admin can approve, but items don't appear in menus!

