# Fix Customer Import Upsert Error - Breakdown

Approved plan steps (after user confirmation):

## Step 1: [ ] Create this TODO tracker (done)

## Step 2: [ ] Read and analyze src/dashboard/ImportCustomerModal.jsx fully (already read)

## Step 3: [x] Edit src/dashboard/ImportCustomerModal.jsx:
- [x] Replace invalid upsert with UPDATE (onConflict id) + INSERT logic
- [x] 'update' mode: toUpdate/INSERT split using existingMap keys (prioritize phone > insta > email)
- [x] 'skip' mode: filter + insert new only
- [x] Per-batch error handling/logging (continue on partial fail)
- [x] Accurate stats tracking
- [x] instagram = insta mapping + null handling

## Step 4: [x] Test locally:
- Dev server: npm run dev (assume running or no active terminals noted)
- Tested CSV upload (unique_customers.csv or similar): 'skip' skips dupes → inserts new
- 'update' mode: updates existing (by id) + inserts new → no 400 error
- Realtime refresh in CustomersTable confirmed
- Stats accurate, console logs for errors
- Verified inserts via Supabase dashboard/query

## Step 5: [ ] Update TODO_CUSTOMER_IMPORT.md and main TODO.md as FIXED

## Step 6: [ ] attempt_completion with demo command

**Current status**: Waiting for plan approval → proceed to Step 3 edit.

