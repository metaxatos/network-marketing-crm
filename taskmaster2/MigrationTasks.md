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

### Step 2: Create New Simplified Schema

```sql
-- Copy the entire schema from the migration plan
-- Run each CREATE TABLE statement in order
-- (Use the complete schema from the migration plan artifact)
```

### Step 3: Quick Code Update Script

Create a file `update-codebase.js` in your project root:

```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Tables being removed
const removedTables = [
  'member_profiles',
  'member_metrics',
  'contact_notes',
  'contact_interactions',
  'sent_emails',
  'email_clicks',
  'training_courses',
  'course_videos',
  'member_course_progress',
  'courses',
  'modules',
  'lessons',
  'lesson_progress',
  'course_enrollments',
  'funnels',
  'page_visits',
  'page_analytics',
  'personal_email_templates',
  'bulk_email_jobs'
];

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}');

console.log(`Found ${files.length} files to check...`);

const issues = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  removedTables.forEach(table => {
    // Check for Supabase queries
    if (content.includes(`from('${table}')`)) {
      issues.push({
        file,
        table,
        type: 'supabase query',
        line: content.split('\n').findIndex(line => line.includes(`from('${table}')`)) + 1
      });
    }
    
    // Check for type imports/definitions
    const typePattern = new RegExp(`(type|interface)\\s+\\w*${table.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`, 'i');
    if (typePattern.test(content)) {
      issues.push({
        file,
        table,
        type: 'type definition',
        pattern: typePattern.source
      });
    }
  });
});

// Generate report
console.log('\n=== Code Update Report ===\n');
console.log(`Total issues found: ${issues.length}\n`);

// Group by file
const byFile = issues.reduce((acc, issue) => {
  if (!acc[issue.file]) acc[issue.file] = [];
  acc[issue.file].push(issue);
  return acc;
}, {});

Object.entries(byFile).forEach(([file, fileIssues]) => {
  console.log(`\n📁 ${file}`);
  fileIssues.forEach(issue => {
    console.log(`   ⚠️  ${issue.type}: ${issue.table} ${issue.line ? `(line ${issue.line})` : ''}`);
  });
});

// Save report
fs.writeFileSync('migration-issues.json', JSON.stringify(issues, null, 2));
console.log('\n✅ Report saved to migration-issues.json');
```

Run it with:
```bash
npm install glob
node update-codebase.js
```

### Step 4: Manual Code Updates

Based on the report, update these patterns:

#### 1. **Member Profile References**
```typescript
// OLD
const { data } = await supabase
  .from('member_profiles')
  .select('*')
  .eq('member_id', userId);

// NEW
const { data } = await supabase
  .from('members')
  .select('*')
  .eq('id', userId);
```

#### 2. **Contact Notes**
```typescript
// OLD
const { data: notes } = await supabase
  .from('contact_notes')
  .select('*')
  .eq('contact_id', contactId);

// NEW
const { data: contact } = await supabase
  .from('contacts')
  .select('notes')
  .eq('id', contactId)
  .single();
// Notes are now in contact.notes field
```

#### 3. **Email History**
```typescript
// OLD
const { data: emails } = await supabase
  .from('sent_emails')
  .select('*')
  .eq('member_id', userId);

// NEW
const { data: emails } = await supabase
  .from('communications')
  .select('*')
  .eq('member_id', userId)
  .eq('type', 'email');
```

#### 4. **Training Videos**
```typescript
// OLD - Complex nested structure
const { data: courses } = await supabase
  .from('courses')
  .select(`
    *,
    modules:modules(
      *,
      lessons:lessons(*)
    )
  `);

// NEW - Flat structure
const { data: videos } = await supabase
  .from('training_videos')
  .select('*')
  .order('order_index');
```

#### 5. **Progress Tracking**
```typescript
// OLD
const { data: progress } = await supabase
  .from('lesson_progress')
  .select('*')
  .eq('member_id', userId);

// NEW
const { data: progress } = await supabase
  .from('member_progress')
  .select('*')
  .eq('member_id', userId);
```

### Step 5: Update Environment & Test

1. **Clear your browser's local storage** (important!):
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
```

2. **Restart your development server**:
```bash
npm run dev
```

3. **Test critical paths**:
- [ ] Can you log in?
- [ ] Can you view dashboard?
- [ ] Can you add a contact?
- [ ] Can you send an email?
- [ ] Can you view training?

### Step 6: Quick Fixes for Common Errors

If you see errors in the console:

#### Error: "relation does not exist"
```typescript
// Find the file mentioned in the error
// Search for the old table name
// Update to new table name
```

#### Error: "column does not exist"
```typescript
// Check if column moved to different table
// Example: first_name, last_name → members.name
```

#### Error: "null is not an object"
```typescript
// Data structure changed
// Example: data.member_profiles → data (directly on member)
```

---

## 🎯 Priority Updates (Do These First!)

1. **Update Auth Hook** (`src/hooks/useAuth.ts`):
```typescript
// Remove any joins to member_profiles
// Member data is now directly in members table
```

2. **Update Dashboard** (`src/hooks/queries/useDashboard.ts`):
```typescript
// Remove member_metrics references
// Calculate metrics in real-time
```

3. **Update Contact List** (`src/hooks/queries/useContacts.ts`):
```typescript
// Remove contact_notes, contact_interactions
// Use communications table for history
```

4. **Update Type Definitions** (`src/types/database.ts`):
```typescript
// Replace with new types from migration plan
```

---

## 🚦 Go/No-Go Checklist

Before going live:

- [ ] All tables created successfully
- [ ] No errors in browser console
- [ ] Can create a test user
- [ ] Can add a test contact
- [ ] Dashboard loads without errors
- [ ] No TypeScript errors in IDE

If any item fails, check the migration-issues.json file for remaining updates needed.

📋 Specific Files to Update in Your Codebase
1. Hooks That Need Updates (src/hooks/queries/)

useContacts.ts - Remove references to contact_notes and contact_interactions
useEmails.ts - Change from sent_emails to communications
useTraining.ts - Update from course/module/lesson structure to flat training_videos
useDashboard.ts - Remove member_metrics, calculate in real-time
usePersonalTemplates.ts - Merge into regular email templates
useBulkEmail.ts - Update to use app logic instead of bulk_email_jobs table

2. Search Your Codebase For These Patterns
Run these searches in VS Code (Ctrl+Shift+F):
# Find all old table references:
from\('member_profiles'\)
from\('contact_notes'\)
from\('sent_emails'\)
from\('training_courses'\)
from\('courses'\)
from\('modules'\)
from\('lessons'\)
from\('lesson_progress'\)
3. Quick Verification Script
Here's a Node.js script to check your codebase for issues:
javascript// save as check-migration.js and run with: node check-migration.js

const { execSync } = require('child_process');

const oldTables = [
  'member_profiles',
  'contact_notes',
  'contact_interactions',
  'sent_emails',
  'email_clicks',
  'training_courses',
  'courses',
  'modules', 
  'lessons',
  'lesson_progress',
  'personal_email_templates',
  'bulk_email_jobs'
];

console.log('Checking for references to old tables...\n');

oldTables.forEach(table => {
  try {
    const result = execSync(`grep -r "from('${table}')" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`, { encoding: 'utf8' });
    if (result.trim()) {
      console.log(`❌ Found references to '${table}':`);
      console.log(result);
    } else {
      console.log(`✅ No references to '${table}'`);
    }
  } catch (e) {
    // Ignore errors
  }
});
4. After Running Migration SQL
The most important thing is to:

Run the DROP statements first to remove old tables
Create the new schema
Test immediately - since your DB is empty, any errors will show up right away
Fix code references as errors appear

The app will immediately tell you if something is broken because queries will fail with "table does not exist" errors. Fix each error as it appears in the browser console.