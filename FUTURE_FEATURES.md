# Future Features & Unused Assets

This file tracks features, pages, and assets that exist in the codebase but are not currently in the main navigation flow. These are planned for future implementation or re-integration.

## Hidden Navigation Items

### Analytics Dashboard
- **Location**: `src/app/(dashboard)/analytics/page.tsx`
- **Components**: `src/components/Analytics/`
  - `EmailClickAnalytics.tsx`
  - `EmailPerformance.tsx`
- **Description**: Comprehensive analytics dashboard for email performance, click tracking, and user engagement metrics
- **Status**: Complete but hidden from navigation
- **Future Plans**: Re-enable when analytics infrastructure is fully ready

### Landing Page Creator
- **Location**: `src/app/landing-page/page.tsx`
- **Components**: `src/components/landing-pages/`
  - `public-landing-page.tsx`
- **API Routes**: `src/app/api/landing-pages/`
- **Store**: `src/stores/landing-page-store.ts`
- **Description**: Tool for creating and managing member-specific landing pages with lead capture
- **Status**: Complete but hidden from navigation
- **Future Plans**: Integrate with member onboarding flow

## Unused/Development Pages

### Debug & Development Pages
- `src/app/dashboard-debug/page.tsx`
- `src/app/dashboard-dev/page.tsx`
- `src/app/debug-*` (multiple debug pages)
- `src/app/test-*` (multiple test pages)
- `src/app/diagnostics/page.tsx`
- `src/app/simple/page.tsx`

### Legacy Authentication Pages
- `src/app/auth/` (old auth structure)
- `src/app/test-auth/page.tsx`
- `src/app/test-simple-auth/page.tsx`

### Test Components & APIs
- `src/app/api/debug/` (multiple debug endpoints)
- `src/app/api/test-*` (multiple test endpoints)
- `src/app/api/minimal-*` (minimal test endpoints)
- `src/components/dev/RealtimeTestPanel.tsx`

## Assets & Resources

### Documentation Files
- `ACADEMY_SIMPLIFICATION_COMPLETE.md`
- `ADVANCED_EMAIL_FEATURES_COMPLETED.md`
- `ANALYTICS_IMPLEMENTATION.md`
- `API_INTEGRATION_COMPLETE.md`
- `AUTH_FIXES_SUMMARY.md`
- `AUTHENTICATION_SETUP.md`
- `DEPLOY_TRIGGER.md`
- `DEPLOYMENT_FIXES_APPLIED.md`
- `DEPLOYMENT.md`
- `EMAIL_SETUP_GUIDE.md`
- `EmailSystemredisign.md`
- `LoadingIssueAnalysis.md`
- `MegaDesign.md`
- `MegaPlan.md`
- `NETLIFY_ENV_SETUP.md`
- `PRODUCTION_DEPLOYMENT_SUMMARY.md`
- `README-LOCAL-SETUP.md`
- `REALTIME_COMPLETE.md`

### Scripts
- `scripts/deploy.js`
- `scripts/verify-production.js`
- `scripts/video-system-health-check.js`

### Database Migration Files
- `database/` (multiple migration files)
- `migration-issues.json`

### Test Automation
- `cypress/e2e/`
- `src/app/(dashboard)/test-automation/`

## Priority for Re-integration

### High Priority
1. **Analytics Dashboard** - Essential for member engagement and business metrics
2. **Landing Page Creator** - Important for lead generation and member tools

### Medium Priority
1. **Advanced Email Features** - Enhanced email capabilities
2. **Training Academy** - Educational content management

### Low Priority
1. **Debug Tools** - Keep for development but not user-facing
2. **Test Pages** - Maintain for testing purposes

## Implementation Notes

- All hidden features are fully functional and tested
- Database schemas support all features
- API endpoints are complete and secured
- Components follow the design system
- Consider user onboarding flow when re-enabling features
- Ensure mobile responsiveness for all features

## Next Steps

1. Complete core user flows (contacts, team, events, email)
2. Gather user feedback on essential features
3. Prioritize feature re-enablement based on user needs
4. Consider progressive disclosure for advanced features 