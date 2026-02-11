# Orders Table Update - TODO

## Phase 1: Update MainTable.jsx
- [x] Add "Invoice" column with view button
- [x] Add "Edit Order" column with edit button
- [x] Add state for selected order
- [x] Add state for modals (InvoiceModal, EditOrderModal)
- [x] Updated orders data structure to include products array
- [x] Add handleViewInvoice and handleEditOrder functions
- [x] Add handleUpdateOrder function for editing orders

## Phase 2: Create InvoiceModal.jsx
- [x] Professional invoice layout
- [x] Company header section (Design2Deploy)
- [x] Customer billing/shipping info
- [x] Products table with quantities
- [x] Pricing breakdown (subtotal, tax, total)
- [x] Print button (window.print())
- [x] Download PDF button (opens printable window)
- [x] Invoice styling for print/PDF

## Phase 3: Update OrderModal.jsx
- [x] Add edit mode support (isEditMode prop)
- [x] Add orderToEdit prop for pre-filling existing order data
- [x] Add onUpdate callback prop for handling order updates
- [x] Pre-fill form with existing order data in edit mode
- [x] Update handleSave to handle both create and edit
- [x] Order ID is fixed in edit mode (cannot be changed)
- [x] Dynamic button text based on mode (Create/Update)

## Phase 4: Install Dependencies
- [x] No external dependencies needed (using native print API for PDF)

## Phase 5: Testing
- [x] Test invoice modal opens correctly
- [x] Test print functionality
- [x] Test PDF download (via print dialog)
- [x] Test edit order functionality
- [x] Test create new order functionality

## Features Implemented:
1. **Orders Table** - Updated with all required fields:
   - Order ID
   - Product Names
   - Cost
   - Date
   - Order Status
   - Payment Status
   - Invoice (button to view invoice)
   - edit_file Order (button to edit)

2. **Invoice Modal** - Professional format including:
   - Company header (Design2Deploy)
   - Invoice details (ID, Date, Due Date)
   - Customer information
   - Products table with quantities and prices
   - Subtotal, Tax (10%), and Total calculations
   - Payment information
   - Print and Download PDF buttons

3. **Order Modal** - Supports both create and edit:
   - Auto-generated order ID (create mode)
   - Customer details (name, phone, Instagram)
   - Product selection with quantities and price override
   - Payment type and status
   - Order status management
   - Order notes

