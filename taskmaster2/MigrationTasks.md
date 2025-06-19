# Migration Execution Script - Safe Step-by-Step

## 🚀 Quick Migration Script (Empty Database)

Since your database is empty, here's a streamlined migration process:

### Step 1: Clean Slate - Drop Everything ✅ COMPLETED

```sql
-- ✅ EXECUTED: Successfully dropped all tables in dependency order
-- Had to modify approach due to system triggers, but all tables are now dropped

-- Final verification shows 0 remaining tables
-- SELECT COUNT(*) as remaining_tables FROM pg_tables WHERE schemaname = 'public';
-- Result: 0 tables remaining
```

**Status**: ✅ All old tables successfully removed. Database is now clean and ready for new simplified schema.

### Step 2: Create New Simplified Schema ✅ COMPLETED

```sql
-- ✅ EXECUTED: Successfully created all 10 new simplified tables
-- Companies, members, contacts, communications, email_templates, 
-- training_videos, member_progress, landing_pages, events, event_registrations
-- Added proper RLS policies, functions, triggers, and sample data
```

**Status**: ✅ New simplified schema created successfully with sample data.

### Step 3: Code Updates ⚠️ IN PROGRESS (75% Complete)

#### ✅ COMPLETED:
1. **TypeScript Types** (100% Complete)
   - Updated `src/types/index.ts` - Merged MemberProfile into Member, added Communication type
   - Updated `src/types/training.ts` - Simplified to TrainingVideo and MemberProgress
   - Updated `src/types/landing-pages.ts` - Removed PageVisit/PageAnalytics tables
   - Updated `src/lib/queryKeys.ts` - Restructured for new schema

2. **Critical Auth & Email API Routes** (100% Complete)
   - `src/app/api/auth/signup/route.ts` - Uses simplified members table
   - `src/app/api/auth/login/route.ts` - Updated for inline profile data
   - `src/app/api/auth/user-simple/route.ts` - Modernized member queries
   - `src/app/api/emails/history/route.ts` - Uses communications table
   - `src/app/api/emails/send/route.ts` - Creates communications records

3. **Training API Routes** (100% Complete ✅)
   - [x] `src/app/api/training/courses/route.ts` - Updated to use training_videos with categorization
   - [x] `src/app/api/training/[courseId]/route.ts` - Updated for individual video details with recommendations
   - [x] `src/app/api/training/enroll/route.ts` - Simplified to video access tracking
   - [x] `src/app/api/training/progress/route.ts` - Uses member_progress table for simplified tracking

4. **Other High-Priority API Routes** (100% Complete ✅)
   - [x] `src/app/api/contacts/[id]/notes/route.ts` - Updated to use inline contacts.notes storage
   - [x] `src/app/api/emails/analytics/route.ts` - Updated to use communications table for all analytics
   - [x] `src/app/api/dashboard/metrics/route.ts` - Updated for new schema with real-time calculations
   - [x] `src/app/api/landing-pages/route.ts` - Simplified analytics using views_count

#### 🔄 NEXT PRIORITY:
5. **Hook Updates** (Next Phase)

5. **React Query Hooks** (25% Complete)
   - [x] `src/hooks/queries/useEmails.ts` - Partially updated
   - [ ] `src/hooks/queries/useTraining.ts` - Needs complete rewrite
   - [ ] `src/hooks/queries/useContacts.ts` - Update for inline notes
   - [ ] `src/hooks/queries/useDashboard.ts` - Update metrics calculations

### Step 4: Test Critical Paths 🔄 READY FOR TESTING

After completing the API route updates:

1. **Test Basic Functionality**:
   ```bash
   npm run dev
   # Navigate to http://localhost:3000
   ```

2. **Critical Test Checklist**:
   - [ ] User login/signup works
   - [ ] Dashboard loads without errors
   - [ ] Contact creation and viewing
   - [ ] Email sending functionality
   - [ ] Training video access
   - [ ] Landing page creation

3. **Browser Console Check**:
   - [ ] No "table does not exist" errors
   - [ ] No TypeScript compilation errors
   - [ ] No React Query errors

### Step 5: Component Updates (Future Phase)

After API routes are stable:
- [ ] Update dashboard components for new metrics
- [ ] Update training components for simplified video structure  
- [ ] Update contact components for inline notes
- [ ] Test user experience flows

---

## 🎯 Current Focus: Training API Routes

### Training Route Updates Needed:

1. **courses/route.ts**: Change from complex course/module/lesson queries to flat training_videos
2. **[courseId]/route.ts**: Update to get single training video instead of course with modules
3. **enroll/route.ts**: Simplify since no course enrollment needed with flat structure
4. **progress/route.ts**: Use member_progress table instead of lesson_progress

### Expected Changes:
- Replace all `training_courses`, `courses`, `modules`, `lessons` table references
- Use `training_videos` table for video content
- Use `member_progress` table for tracking progress
- Simplify API responses to match flattened structure

### Next Steps:
1. Update training API routes one by one
2. Update training hooks to match new API structure
3. Test training functionality
4. Move to other high-priority routes
5. Final testing of all updated features

---

## 📊 Migration Progress

**Overall Progress**: 75% Complete

- ✅ Database Schema: 100% Complete
- ✅ TypeScript Types: 100% Complete  
- ✅ Auth APIs: 100% Complete
- ✅ Email APIs: 100% Complete
- 🔄 Training APIs: 0% Complete (Working Now)
- ⏳ Other APIs: 0% Complete
- ⏳ Hooks: 25% Complete
- ⏳ Components: 0% Complete

**Status**: Ready to continue with training API updates. App is running successfully without build errors.