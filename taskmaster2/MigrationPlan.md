# Network Marketing CRM - Migration Code Safety Guide

## 🚨 Tables Being Removed/Consolidated

### Tables to DROP after migration:
1. `member_profiles` → merged into `members`
2. `member_metrics` → replaced by real-time calculations
3. `contact_notes` → merged into `contacts.notes`
4. `contact_interactions` → merged into `communications`
5. `sent_emails` → merged into `communications`
6. `email_clicks` → stored in `communications.metadata`
7. `training_courses` → flattened into `training_videos`
8. `course_videos` → merged into `training_videos`
9. `member_course_progress` → renamed to `member_progress`
10. `courses` → merged into `training_videos`
11. `modules` → merged into `training_videos`
12. `lessons` → merged into `training_videos`
13. `lesson_progress` → renamed to `member_progress`
14. `course_enrollments` → no longer needed
15. `page_templates` → simplified (optional to keep)
16. `funnels` → removed (can add back later if needed)
17. `page_visits` → simplified to `landing_pages.views_count`
18. `page_analytics` → removed (use external analytics)
19. `personal_email_templates` → merged into `email_templates`
20. `bulk_email_jobs` → handle in application logic

### Tables being MODIFIED:
1. `members` - added fields from `member_profiles`
2. `contacts` - added `company_id` and consolidated notes
3. `email_templates` - added `member_id` for personal templates
4. `landing_pages` - simplified structure

### NEW tables being added:
1. `communications` - consolidates all interactions
2. `events` - calendar functionality
3. `member_progress` - simplified progress tracking

---

## 🔍 Code Files That Need Updates

### 1. **Database Types** (`src/types/*.ts`)

**Files to update:**
```typescript
// src/types/database.ts - REPLACE ENTIRELY with new types
// DELETE these type definitions:
- MemberProfile
- MemberMetrics  
- ContactNote
- ContactInteraction
- SentEmail
- EmailClick
- TrainingCourse
- CourseVideo
- MemberCourseProgress
- Course
- Module
- Lesson
- LessonProgress
- CourseEnrollment
- PageTemplate
- Funnel
- PageVisit
- PageAnalytics
- PersonalEmailTemplate
- BulkEmailJob

// ADD these new types:
+ Communication
+ Event
+ MemberProgress (renamed from lesson progress)
```

### 2. **API Hooks** (`src/hooks/queries/*.ts`)

**useContacts.ts**
```typescript
// REMOVE references to:
- contact_notes table
- contact_interactions table

// UPDATE queries to use:
+ communications table for interaction history
+ contacts.notes field for consolidated notes
```

**useEmails.ts**
```typescript
// REMOVE all references to:
- sent_emails table
- email_clicks table
- personal_email_templates table
- bulk_email_jobs table

// REPLACE with:
+ communications table (type = 'email')
+ email_templates table (with member_id for personal)
```

**useTraining.ts**
```typescript
// REMOVE all references to:
- training_courses
- course_videos  
- member_course_progress
- courses
- modules
- lessons
- lesson_progress
- course_enrollments

// REPLACE with:
+ training_videos (flattened structure)
+ member_progress (simplified progress)
```

**useDashboard.ts**
```typescript
// REMOVE references to:
- member_metrics table

// REPLACE with:
+ Real-time calculations using RPC functions
+ Direct queries with COUNT and aggregations
```

### 3. **Components That Need Updates**

**Contacts Components** (`src/components/contacts/*.tsx`)
```typescript
// ContactNotes.tsx - UPDATE to use contacts.notes field
// ContactInteractions.tsx - UPDATE to use communications table
// ContactTimeline.tsx - UPDATE to query communications table
```

**Email Components** (`src/components/email/*.tsx`)
```typescript
// EmailHistory.tsx - UPDATE to use communications table
// EmailTemplates.tsx - UPDATE to use unified email_templates table
// BulkEmailModal.tsx - REMOVE or update to use app logic
```

**Training Components** (`src/components/training/*.tsx`)
```typescript
// CourseList.tsx - UPDATE to use training_videos with categories
// ModuleView.tsx - REMOVE (no more modules)
// LessonPlayer.tsx - UPDATE to VideoPlayer.tsx
// CourseProgress.tsx - UPDATE to use member_progress
```

**Landing Page Components** (`src/components/landing/*.tsx`)
```typescript
// PageBuilder.tsx - UPDATE for simplified content structure
// FunnelBuilder.tsx - REMOVE entirely
// PageAnalytics.tsx - REMOVE or use external analytics
```

### 4. **Supabase Client Calls**

Search and replace these patterns in your codebase:

```typescript
// OLD PATTERNS TO FIND AND REPLACE:

// 1. Member profiles
supabase.from('member_profiles')
→ supabase.from('members')

// 2. Contact notes
supabase.from('contact_notes')
→ UPDATE contacts SET notes = notes || new_note

// 3. Contact interactions  
supabase.from('contact_interactions')
→ supabase.from('communications')

// 4. Sent emails
supabase.from('sent_emails')
→ supabase.from('communications').insert({ type: 'email', ... })

// 5. Email clicks
supabase.from('email_clicks')
→ Store in communications.metadata.clicks

// 6. Training courses/lessons
supabase.from('courses')
supabase.from('modules')  
supabase.from('lessons')
→ supabase.from('training_videos')

// 7. Progress tracking
supabase.from('lesson_progress')
supabase.from('course_enrollments')
→ supabase.from('member_progress')

// 8. Personal templates
supabase.from('personal_email_templates')
→ supabase.from('email_templates').eq('member_id', userId)
```

### 5. **Store Updates** (`src/stores/*.ts`)

If you're using Zustand stores, update:

```typescript
// Remove these stores:
- useMemberProfileStore
- useContactNotesStore
- useTrainingCourseStore
- useFunnelStore

// Update these stores:
- useContactStore → include notes in contact object
- useEmailStore → use communications for history
- useTrainingStore → use flat video structure
```

---

## ✅ Migration Checklist

### Step 1: Drop Old Tables & Create New Schema
```sql
-- Drop all old tables first
DROP TABLE IF EXISTS member_profiles CASCADE;
DROP TABLE IF EXISTS member_metrics CASCADE;
DROP TABLE IF EXISTS contact_notes CASCADE;
DROP TABLE IF EXISTS contact_interactions CASCADE;
DROP TABLE IF EXISTS sent_emails CASCADE;
DROP TABLE IF EXISTS email_clicks CASCADE;
DROP TABLE IF EXISTS training_courses CASCADE;
DROP TABLE IF EXISTS course_videos CASCADE;
DROP TABLE IF EXISTS member_course_progress CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS funnels CASCADE;
DROP TABLE IF EXISTS page_visits CASCADE;
DROP TABLE IF EXISTS page_analytics CASCADE;
DROP TABLE IF EXISTS personal_email_templates CASCADE;
DROP TABLE IF EXISTS bulk_email_jobs CASCADE;

-- Then run the new schema creation from the migration plan
```

### Step 2: Update All TypeScript Types
1. Replace entire `database.ts` with new types
2. Search for any imports of removed types
3. Update all type references in components

### Step 3: Update All Hooks
Go through each hook file and update queries:
- [ ] useAuth.ts
- [ ] useContacts.ts  
- [ ] useEmails.ts
- [ ] useTraining.ts
- [ ] useDashboard.ts
- [ ] usePersonalTemplates.ts → Remove
- [ ] useBulkEmail.ts → Remove or refactor

### Step 4: Update Components
Search for components using old tables:
- [ ] Find all `from('member_profiles')` → Update to `from('members')`
- [ ] Find all `from('contact_notes')` → Update to use contacts.notes
- [ ] Find all `from('sent_emails')` → Update to communications
- [ ] Find all training course references → Update to flat structure
- [ ] Find all funnel references → Remove

### Step 5: Test Critical Paths
After migration, test:
1. User login and profile display
2. Contact creation and viewing
3. Email sending and history
4. Training video playing and progress
5. Dashboard metrics
6. Team hierarchy display
7. Event creation

---

## 🔧 Quick Fix Script

Run this bash script to find all database references:

```bash
#!/bin/bash
# Find all Supabase table references in your codebase

echo "Searching for old table references..."

OLD_TABLES=(
  "member_profiles"
  "member_metrics"
  "contact_notes"
  "contact_interactions"
  "sent_emails"
  "email_clicks"
  "training_courses"
  "course_videos"
  "member_course_progress"
  "courses"
  "modules"
  "lessons"
  "lesson_progress"
  "course_enrollments"
  "funnels"
  "page_visits"
  "page_analytics"
  "personal_email_templates"
  "bulk_email_jobs"
)

for table in "${OLD_TABLES[@]}"; do
  echo "=== Searching for: $table ==="
  grep -r "from('$table')" src/ --include="*.ts" --include="*.tsx" || echo "No references found"
  grep -r "\"$table\"" src/ --include="*.ts" --include="*.tsx" || echo "No references found"
  echo ""
done
```

---

## 🚨 Common Migration Issues & Fixes

### Issue 1: "Table does not exist" errors
**Fix**: Search for the table name in your codebase and update to new structure

### Issue 2: Missing profile data
**Fix**: Member profiles are now in the members table directly

### Issue 3: Contact notes not showing
**Fix**: Notes are now in contacts.notes field, not separate table

### Issue 4: Email history missing
**Fix**: Query communications table with type='email'

### Issue 5: Training progress not loading
**Fix**: Use member_progress table instead of lesson_progress

---

## 📝 Final Safety Check

Before deploying:

1. **Global Search** for each removed table name
2. **Check imports** for removed type definitions  
3. **Test each major feature** in development
4. **Check browser console** for any Supabase errors
5. **Verify RLS policies** are working correctly

The migration plan ensures all functionality is preserved while simplifying the structure. The key is methodically updating each reference to old tables.


