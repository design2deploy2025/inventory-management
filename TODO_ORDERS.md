# Orders Modal Implementation Plan

## Information Gathered:
1. The `MainTable.jsx` component handles the orders display when `currentPage === 'orders'` in Dashboard.jsx
2. The ProductModal.jsx exists and shows the pattern for modal design in this project
3. Products are managed in ProductDetails.jsx with sample data available
4. The project uses Tailwind CSS for styling with a dark theme (bg-[#0A0A0A])
5. The modal pattern uses backdrop blur and fixed positioning

## Plan:
1. Create `OrderModal.jsx` component with comprehensive order creation form
   - Auto-generated order ID (format: #ORD-XXX)
   - Customer details section (name, phone, Instagram)
   - Products multi-select with price input for each product
   - Payment type dropdown
   - Payment status dropdown
   - Auto-calculation of total price
   
2. Modify `MainTable.jsx` to:
   - Add "Create Order" button
   - Add state for modal visibility
   - Integrate OrderModal component
   - Update orders state to handle new orders

3. Create helper functions:
   - Order ID generator
   - Price calculator for multiple products

## Dependent Files to be edited:
- src/dashboard/MainTable.jsx (add modal integration)
- src/dashboard/OrderModal.jsx (new file to create)

## Followup steps:
- Test the modal functionality
- Verify all form fields work correctly
- Check auto-calculation of prices

