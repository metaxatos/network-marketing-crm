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

console.log(`🔍 Found ${files.length} files to check...`);

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
    
    // Check for table references in strings
    if (content.includes(`'${table}'`) || content.includes(`"${table}"`)) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if ((line.includes(`'${table}'`) || line.includes(`"${table}"`)) && !line.includes(`from('${table}')`)) {
          issues.push({
            file,
            table,
            type: 'table reference',
            line: index + 1,
            context: line.trim()
          });
        }
      });
    }
    
    // Check for type imports/definitions
    const typeVariations = [
      table.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''), // PascalCase
      table.toUpperCase(), // UPPERCASE
      table.toLowerCase() // lowercase
    ];
    
    typeVariations.forEach(typeVar => {
      const typePattern = new RegExp(`(type|interface)\\s+\\w*${typeVar}`, 'i');
      if (typePattern.test(content)) {
        issues.push({
          file,
          table,
          type: 'type definition',
          pattern: typeVar
        });
      }
    });
  });
});

// Generate report
console.log('\n=== 🚨 Code Update Report ===\n');
console.log(`Total issues found: ${issues.length}\n`);

if (issues.length === 0) {
  console.log('✅ No obvious migration issues found! Your codebase appears to be ready.');
} else {
  // Group by file
  const byFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) acc[issue.file] = [];
    acc[issue.file].push(issue);
    return acc;
  }, {});

  Object.entries(byFile).forEach(([file, fileIssues]) => {
    console.log(`\n📁 ${file.replace('src/', '')}`);
    fileIssues.forEach(issue => {
      console.log(`   ⚠️  ${issue.type}: ${issue.table} ${issue.line ? `(line ${issue.line})` : ''}`);
      if (issue.context) {
        console.log(`       📝 ${issue.context}`);
      }
    });
  });

  // Group by priority
  console.log('\n=== 🎯 Priority Fixes ===\n');
  
  const supabaseIssues = issues.filter(i => i.type === 'supabase query');
  const typeIssues = issues.filter(i => i.type === 'type definition');
  const refIssues = issues.filter(i => i.type === 'table reference');
  
  if (supabaseIssues.length > 0) {
    console.log(`🔥 HIGH PRIORITY: ${supabaseIssues.length} Supabase queries need updating`);
    supabaseIssues.forEach(issue => {
      console.log(`   - ${issue.file.replace('src/', '')} (${issue.table})`);
    });
  }
  
  if (typeIssues.length > 0) {
    console.log(`\n📝 MEDIUM PRIORITY: ${typeIssues.length} Type definitions need updating`);
    typeIssues.forEach(issue => {
      console.log(`   - ${issue.file.replace('src/', '')} (${issue.table})`);
    });
  }
  
  if (refIssues.length > 0) {
    console.log(`\n🔍 LOW PRIORITY: ${refIssues.length} Table references to review`);
  }
}

// Save report
fs.writeFileSync('migration-issues.json', JSON.stringify(issues, null, 2));
console.log('\n✅ Detailed report saved to migration-issues.json');

console.log('\n=== 📋 Next Steps ===');
console.log('1. Review the issues above');
console.log('2. Update Supabase queries to use new table structure');
console.log('3. Update TypeScript types');
console.log('4. Test critical application paths');
console.log('5. Run `npm run dev` to check for compilation errors'); 