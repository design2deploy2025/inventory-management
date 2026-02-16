# Task: Make Products Tab Dynamic (Connect to Supabase)

## Steps to Complete:

### Step 1: Update ProductDetails.jsx
- [x] Import supabase and useAuth
- [x] Add state for products, loading, error
- [x] Add fetchProducts function to fetch from Supabase
- [x] Add useEffect to fetch products when user logs in
- [x] Add real-time subscription for product changes
- [x] Update handleSave to insert/update products in Supabase
- [x] Add delete product functionality
- [x] Pass user prop to ProductModal

### Step 2: Update ProductModal.jsx
- [x] Accept user prop from parent
- [x] Add isNew and productId fields to formData
- [x] Add tagsInput state for comma-separated tags
- [x] Handle tags input with handleTagsChange function
- [x] Update modal header to show Add/Edit based on isNew
- [x] Add Discontinued status option
- [x] Add delete button in footer
- [x] Map product fields correctly between UI and Supabase schema

### Step 3: Test Implementation
- [ ] Run development server
- [ ] Verify products load from Supabase
- [ ] Verify create/edit/delete works correctly
- [ ] Verify real-time updates work

