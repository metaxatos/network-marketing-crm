# Task 4: React Query State Management

## Priority: 🟡 MEDIUM
## Estimated Time: 1-2 days
## Status: 📋 TODO

## Description
Implement React Query (TanStack Query) to replace current fetch patterns with optimized server state management. This will provide better caching, background refetching, optimistic updates, and improved user experience.

## Context
- React Query is already installed in package.json (@tanstack/react-query)
- Current stores use basic fetch patterns without caching
- Need better loading states and error handling
- Should improve performance and offline experience

## Acceptance Criteria

### Query Setup & Configuration
- [ ] Set up React Query client with proper configuration
- [ ] Implement query provider at app level
- [ ] Configure default stale times and cache behavior
- [ ] Add devtools for development

### Contact Management Queries
- [ ] Replace contact fetching with useQuery
- [ ] Implement optimistic updates for contact mutations
- [ ] Add infinite scrolling with useInfiniteQuery
- [ ] Cache contact search results

### Email System Queries
- [ ] Convert email template fetching to useQuery
- [ ] Implement email sending with useMutation
- [ ] Cache sent email history
- [ ] Add optimistic updates for email status

### Training System Queries
- [ ] Convert course/lesson fetching to useQuery
- [ ] Implement progress updates with mutations
- [ ] Cache video progress data
- [ ] Handle enrollment state properly

### Dashboard Queries
- [ ] Convert metrics fetching to useQuery
- [ ] Implement activity feed with useInfiniteQuery
- [ ] Add background refetching for live data
- [ ] Cache dashboard state for fast loading

## Technical Requirements

### Query Configuration
- [ ] Set appropriate stale times for different data types
- [ ] Implement query key patterns for consistent caching
- [ ] Add retry logic for failed requests
- [ ] Configure garbage collection for unused data

### Error Handling
- [ ] Global error boundaries for query failures
- [ ] Retry failed mutations with exponential backoff
- [ ] Show user-friendly error messages
- [ ] Handle network connectivity issues

### Optimistic Updates
- [ ] Immediate UI updates for user actions
- [ ] Rollback on mutation failures
- [ ] Consistent state during optimistic updates
- [ ] Visual feedback for pending states

### Performance
- [ ] Prefetch related data intelligently
- [ ] Debounce search queries
- [ ] Background refetching for stale data
- [ ] Efficient memory management

## Implementation Steps

1. **Query Client Setup**
   - Configure TanStack Query client
   - Set up providers and devtools
   - Define query key patterns
   - Configure default options

2. **Contact Queries**
   - Replace contactStore fetch logic
   - Implement contact mutations
   - Add search query optimization
   - Test optimistic updates

3. **Email & Training Queries**
   - Convert email and training stores
   - Implement proper caching strategies
   - Add mutation error handling
   - Test offline behavior

4. **Dashboard Optimization**
   - Convert dashboard data fetching
   - Implement background updates
   - Add prefetching for related data
   - Optimize performance

5. **Testing & Polish**
   - Test all query/mutation flows
   - Verify caching behavior
   - Check error handling
   - Optimize query keys

## Files to Create/Modify

### New Files
- `/src/providers/QueryProvider.tsx` - Query client provider
- `/src/hooks/queries/useContacts.ts` - Contact queries
- `/src/hooks/queries/useEmails.ts` - Email queries
- `/src/hooks/queries/useTraining.ts` - Training queries
- `/src/hooks/queries/useDashboard.ts` - Dashboard queries
- `/src/lib/queryKeys.ts` - Query key constants
- `/src/lib/queryClient.ts` - Query client configuration

### Modified Files
- `/src/app/layout.tsx` - Add QueryProvider
- `/src/stores/contactStore.ts` - Integrate with queries
- `/src/stores/emailStore.ts` - Integrate with queries
- `/src/stores/trainingStore.ts` - Integrate with queries
- `/src/stores/dashboardStore.ts` - Integrate with queries
- Multiple component files to use new hooks

## Query Key Patterns

```typescript
// Hierarchical query keys for consistent caching
export const queryKeys = {
  contacts: ['contacts'] as const,
  contactList: (filters: ContactFilters) => 
    [...queryKeys.contacts, 'list', filters] as const,
  contactDetail: (id: string) => 
    [...queryKeys.contacts, 'detail', id] as const,
  
  emails: ['emails'] as const,
  emailTemplates: () => [...queryKeys.emails, 'templates'] as const,
  emailHistory: (filters: EmailFilters) => 
    [...queryKeys.emails, 'history', filters] as const,
  
  training: ['training'] as const,
  courses: () => [...queryKeys.training, 'courses'] as const,
  courseDetail: (id: string) => 
    [...queryKeys.training, 'course', id] as const,
  
  dashboard: ['dashboard'] as const,
  metrics: () => [...queryKeys.dashboard, 'metrics'] as const,
  activities: () => [...queryKeys.dashboard, 'activities'] as const,
}
```

## Query Configuration

```typescript
// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.status === 404) return false
        return failureCount < 3
      },
    },
    mutations: {
      retry: 1,
    },
  },
})
```

## Optimistic Updates Example

```typescript
// Contact creation with optimistic updates
const useCreateContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createContact,
    onMutate: async (newContact) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.contactList(filters) 
      })
      
      // Optimistically update cache
      const previousContacts = queryClient.getQueryData(
        queryKeys.contactList(filters)
      )
      
      queryClient.setQueryData(
        queryKeys.contactList(filters),
        (old) => [...old, { ...newContact, id: 'temp-id' }]
      )
      
      return { previousContacts }
    },
    onError: (err, newContact, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.contactList(filters),
        context.previousContacts
      )
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contacts 
      })
    },
  })
}
```

## Caching Strategy

### Data Types & Stale Times
- **Static data** (templates): 30 minutes
- **User data** (contacts): 5 minutes  
- **Activity data**: 1 minute
- **Metrics**: 2 minutes
- **Training progress**: 10 minutes

### Background Refetching
- Dashboard metrics: Every 2 minutes when focused
- Activity feed: Every 30 seconds when focused
- Contact list: On window focus
- Email status: Real-time via subscriptions

### Cache Invalidation
- Create/update operations: Invalidate related queries
- Email sent: Invalidate email history and metrics
- Contact added: Invalidate contact list and metrics
- Training progress: Invalidate course and dashboard data

## Error Boundary Implementation

```typescript
// Global error boundary for query errors
function QueryErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={<QueryErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Query error:', error, errorInfo)
        // Log to error service
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## Success Criteria

### Performance Improvements
- [ ] Faster initial page loads (cached data)
- [ ] Reduced API calls through intelligent caching
- [ ] Smooth optimistic updates
- [ ] Background data synchronization

### User Experience
- [ ] Immediate feedback for user actions
- [ ] Graceful error handling and retry
- [ ] Offline capability for cached data
- [ ] Loading states that don't block interaction

### Developer Experience
- [ ] Clear query key patterns
- [ ] Consistent error handling
- [ ] Easy to debug with devtools
- [ ] Type-safe query/mutation hooks

## Testing Strategy

### Unit Tests
- Query key generation functions
- Mutation optimistic update logic
- Error handling scenarios
- Cache invalidation patterns

### Integration Tests
- End-to-end data flow
- Optimistic update rollbacks
- Cache synchronization
- Background refetching

### Performance Tests
- Memory usage with large datasets
- Query performance optimization
- Cache hit/miss ratios
- Network request reduction

## Migration Strategy

1. **Phase 1**: Set up React Query infrastructure
2. **Phase 2**: Migrate contacts (highest usage)
3. **Phase 3**: Migrate emails and training
4. **Phase 4**: Optimize dashboard and add advanced features
5. **Phase 5**: Remove old fetch patterns from stores

## Future Enhancements (Not in Scope)
- Offline-first architecture
- Advanced prefetching strategies
- Query result streaming
- Cross-tab synchronization

## Dependencies
- @tanstack/react-query (already installed)
- @tanstack/react-query-devtools (for development)
- Existing API infrastructure
- Current Zustand stores (gradual integration) 