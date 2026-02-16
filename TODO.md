# TODO: Make Profile Tab Dynamic

## Plan
1. [x] Analyze codebase and database schema
2. [x] Update Settings.jsx with Supabase integration
   - [x] Add state management for form fields
   - [x] Add fetch profile data on mount
   - [x] Add save/update profile functionality
   - [x] Add logo upload to Supabase Storage
   - [x] Add real-time subscription
   - [x] Add loading and error states
3. [x] Add whatsapp_number column to database schema

## Notes
- Connected to `profiles` table in Supabase
- Used `user.id` from AuthContext for user identification
- Upload logos to `business-logos` storage bucket
- Added whatsapp_number field to database schema

## Database Migration Required
Run this SQL in Supabase to add the whatsapp_number column:
```sql
ALTER TABLE profiles ADD COLUMN whatsapp_number TEXT;
```

The schema file has been updated with the new column.

