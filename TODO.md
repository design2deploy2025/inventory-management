# Task: Make Customers Tab Dynamic (Connect to Supabase)

## Steps to Complete:

### Step 1: Update CustomersTable.jsx
- [x] Import supabase and useAuth
- [x] Add state for customers, loading, error
- [x] Add fetchCustomers function to fetch from Supabase
- [x] Add useEffect to fetch customers when user logs in
- [x] Add real-time subscription for customer changes
- [x] Update handleSaveCustomer to insert into Supabase
- [x] Update handleUpdateCustomer to update in Supabase
- [x] Add handleDeleteCustomer to delete from Supabase
- [x] Add loading and error states in UI

### Step 2: Update CustomerModal.jsx
- [x] Add source field to form (WhatsApp/Instagram)
- [x] Adjust ID handling for Supabase UUID format
- [x] Add email, address, and notes fields
- [x] Pass user to parent for operations

### Step 3: Test Implementation
- [ ] Run development server
- [ ] Verify customers load from Supabase
- [ ] Verify create/edit/delete works correctly
- [ ] Verify real-time updates work

