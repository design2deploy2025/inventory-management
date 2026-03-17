# Admin Route Protection TODO

## Plan Summary
Protect `/xQmLpRzTaVnKeWsYdFuHjGcBiOlPkNmQrStUvWxYaZb` → only admins (profile.is_admin === true), else redirect `/dashboard`.

## Steps
- [x] Step 1: Update `src/context/AuthContext.jsx` - Add profile fetching ✅
- [x] Step 2: Update `src/App.jsx` - Add AdminRoute & protect route ✅
- [x] Step 3: Test implementation ✅ (Dev server: http://localhost:5174)
- [x] Step 4: Update TODO.md ✅ (complete)

**Status**: ✅ Admin protection implemented & tested.
Dev server running for manual verification:
- Non-admin login → secret route redirects to /dashboard
- Admin (profile.is_admin=true) → access granted

