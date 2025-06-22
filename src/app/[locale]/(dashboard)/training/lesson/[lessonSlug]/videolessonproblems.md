Investigating OurTeam Video Issues and Solutions

## IMPLEMENTATION PROGRESS

### ✅ COMPLETED: Fix #1 - Video Freezing on Lesson Page Load

**Status**: IMPLEMENTED ✅
**Date**: January 2025

**What was done**:
1. **Unified Video Player Implementation**:
   - Updated `lesson/[lessonSlug]/page.tsx` to use the unified `VideoPlayer` component instead of raw iframes
   - Completely rewrote `video/[videoId]/page.tsx` to use the `VideoPlayer` component
   - Removed all manual video handling code that was causing conflicts

2. **Eliminated Conflicts**:
   - Removed overlapping window event listeners for Vimeo messages
   - Removed duplicate progress tracking intervals (was tracking in 3 different places)
   - Removed manual iframe and video element references
   - Eliminated competing postMessage handlers

3. **Code Simplification**:
   - Reduced video/[videoId] page from 537 lines to ~250 lines (50% reduction)
   - Removed complex state management for video players
   - Centralized all video platform handling in the `VideoPlayer` component

**Result**: The unified VideoPlayer component now handles all video types (Vimeo, YouTube, Wistia) with consistent API loading, event handling, and progress tracking. This eliminates the root cause of video freezing by preventing multiple competing implementations from interfering with each other.

**Next Steps**: 
- Monitor for any video loading issues in testing
- Move to Fix #2 (Page Breaks on Refresh) if no issues are found

### ✅ COMPLETED: Fix #2 - Page Breaks on Refresh (502 Errors on Netlify)

**Status**: IMPLEMENTED ✅  
**Date**: January 2025

**What was done**:
1. **Eliminated Serverless Function Bottleneck**:
   - Replaced API route calls (`/api/training/lesson/[slug]` and `/api/training/video/[id]`) with direct Supabase client queries
   - Removed the double-hop: Browser → Netlify Function → Supabase → Function → Browser
   - Now: Browser → Supabase CDN (direct connection)

2. **Optimized Database Queries**:
   - Used `Promise.all()` to run multiple queries in parallel instead of sequentially
   - Lesson page: 3 queries run simultaneously (video+course, progress, navigation)
   - Video page: 3 queries run simultaneously (video+course, enrollment, progress)
   - Added proper error handling with specific error codes

3. **Performance Improvements**:
   - Leverages Supabase's global CDN for faster data delivery
   - Eliminates 10-second Netlify function timeout risk
   - Reduces network latency by removing intermediate function calls
   - Uses Row Level Security (RLS) for data access control on client

4. **Better Error Handling**:
   - Specific error messages for different failure scenarios
   - Graceful handling of missing data (using `maybeSingle()`)
   - Proper TypeScript typing to prevent runtime errors

**Result**: Pages should no longer experience 502 errors on refresh. Data loading is now handled directly by the browser from Supabase's CDN, eliminating the serverless function timeout issues. The approach is more reliable, faster, and eliminates the primary cause of refresh failures.

**Next Steps**: 
- Test page refresh behavior in development and production
- Monitor for any remaining timeout issues
- Move to Fix #3 (CSP Eval Console Error) if refresh works reliably

### ✅ COMPLETED: Fix #3 - CSP "Eval" Console Error

**Status**: IMPLEMENTED ✅  
**Date**: January 2025

**What was done**:
1. **Added Missing Wistia Domains**:
   - Added `https://fast.wistia.com` and `https://fast.wistia.net` to script-src
   - Added Wistia domains to all relevant CSP directives (style-src, img-src, frame-src, etc.)
   - Ensured all video provider domains are properly whitelisted

2. **Verified CSP Configuration**:
   - Confirmed `'unsafe-eval'` is properly included in script-src directive
   - All video player APIs (YouTube, Vimeo, Wistia) now have proper domain permissions
   - CSP remains strict for security while allowing necessary video functionality

**Result**: Console should no longer show CSP violations related to eval() usage. All video player scripts from YouTube, Vimeo, and Wistia can now execute properly without CSP blocking their dynamic code execution.

### ✅ COMPLETED: Fix #4 - Multiple Video Player Implementations Causing Conflicts

**Status**: IMPLEMENTED ✅  
**Date**: January 2025

**What was done**:
1. **Removed Redundant Video Component**:
   - Deleted unused `VimeoVideo.tsx` component that was creating conflicts
   - All video rendering now goes through the unified `VideoPlayer` component
   - Eliminated duplicate event handling and API script loading

2. **Completed Code Consolidation**:
   - Single source of truth for video playback across all platforms
   - Removed overlapping postMessage handlers and progress tracking
   - Streamlined video player initialization and cleanup

**Result**: No more conflicts between different video player implementations. All videos use the same component with consistent behavior.

### ✅ COMPLETED: Fix #5 - Client-Side Data Fetching via Next.js API Routes

**Status**: IMPLEMENTED ✅  
**Date**: January 2025

**What was done**:
1. **Deprecated Unused API Routes**:
   - Added deprecation notices to `/api/training/lesson/[slug]` and `/api/training/video/[id]`
   - These routes are no longer used in the critical path (moved to client-side Supabase)
   - Kept for backwards compatibility but marked for future removal

2. **Completed Direct Client Fetching**:
   - All video/lesson data now fetched directly from Supabase client-side
   - Eliminated unnecessary API layer that was causing performance issues
   - Reduced architecture complexity and improved reliability

**Result**: Streamlined data fetching architecture with better performance and fewer potential failure points.

**Next Steps**: 
- Fix #6 (Optional Video Player Library Migration) can be considered for future enhancement
- Monitor video performance and consider react-player if needed
- All critical fixes are now complete!

---

## ORIGINAL ANALYSIS
1. Video Freezing on Lesson Page Load
Root Cause: The lesson detail page (e.g. /training/lesson/introduction) currently embeds Vimeo videos via a raw <iframe> without robust event handling
GitHub
. At the same time, the app has other video player code (e.g. a custom VimeoVideo component and a universal VideoPlayer module) adding their own event listeners and API scripts
GitHub
GitHub
. This overlapping implementation can lead to conflicts. For example, multiple message listeners on window for Vimeo events or duplicated control logic can prevent the video from playing smoothly. Furthermore, a strict Content Security Policy (CSP) can interfere with Vimeo’s player script loading fully. If certain Vimeo subdomains or scripts (like analytics from vimeocdn.com or Conviva) are blocked by CSP, the embedded player may stall showing a spinner
stackoverflow.com
stackoverflow.com
. Fixes:
Unify to One Player Implementation: Eliminate redundant players to avoid conflicts. You should pick a single approach for embedding videos (e.g. using the new universal VideoPlayer component everywhere). This component already handles Vimeo’s API and progress events via the official Vimeo Player SDK
GitHub
, so reuse it instead of raw iframes. Update the lesson page to use <VideoPlayer> instead of an <iframe>
GitHub
, passing the videoPlatform, videoId, etc. This ensures consistent behavior and cleans up extra event handlers.
Ensure Vimeo API Events Fire: When using the unified player or Vimeo SDK, call the appropriate event listeners on load. In the custom code, Vimeo events like play, timeupdate, etc. are set via postMessage
GitHub
. Make sure these are registered once. Remove any duplicate window.addEventListener('message', ...) that might still be active from an unmounted component.
CSP Adjustments: Confirm the CSP header allows all domains needed by Vimeo. Currently, the production CSP includes Vimeo’s domains and 'unsafe-eval' for scripts
GitHub
, but if the freeze persists, consider adding any missing domains that Vimeo uses (e.g. tracking or CDN domains mentioned in console warnings). In testing, use the CSP report-only mode to catch blocked URLs and add them to the policy
stackoverflow.com
stackoverflow.com
. This will prevent Vimeo’s player from stalling at the loading stage.
Result: With a single, properly-initialized video player, the Vimeo lesson video should load and play reliably on first try. The unified player will manage postMessage communication and progress events in one place (preventing race conditions), and a relaxed but targeted CSP will allow the Vimeo scripts to run without freezing the video.
2. Page Breaks on Refresh (502 Errors on Netlify)
Root Cause: Refreshing a training video page sometimes yields a 502 Bad Gateway with a Netlify function crash message. This indicates the serverless function handling the page (or an API call it invokes) is timing out or failing. In our setup, the lesson/video data is loaded via Next.js API routes on demand
GitHub
GitHub
. On a hard refresh, the Next.js App Router will SSR the page via a Netlify Function. Although the page is a client component, the Netlify handler still must bootstrap it. If the API call to Supabase (via the Next API route) is slow or hangs, the function may exceed the 10-second limit and be terminated, causing a 502 error
answers.netlify.com
. This can happen if Supabase queries are taking too long or if there’s no proper response within the timeout. Lack of caching (no ISR) means every refresh hits the database anew, compounding the load. We also need to ensure the Netlify Next.js runtime supports Next 14 – older runtimes would crash on every request
answers.netlify.com
 (you’ve updated to plugin v5.7.2, which is correct
GitHub
). Fixes:
Optimize API Route Performance: Examine the /api/training/lesson/[lessonSlug] and [videoId] handlers for any slow points. Each refresh triggers Supabase queries for the video, course, and progress
GitHub
GitHub
. Ensure appropriate DB indexes on slug and foreign keys so these return quickly. Also consider reducing data loaded: for example, the slug-based API fetches all lessons in the course for navigation
GitHub
, which might be unnecessary on every load. You could paginate or defer loading full course navigation until needed.
Increase Resilience with Timeouts & Retries: Although the client fetch already sets a 10s abort signal
GitHub
, you can also implement a shorter timeout or try-catch around expensive Supabase calls on the server. If Supabase doesn’t respond quickly, return a friendly error JSON before Netlify’s 10s limit, rather than hanging (currently the code would catch it and still return JSON
GitHub
, but only after waiting). This way the function exits gracefully with a 500 response that your client can handle (showing the error UI).
Cache or Pre-fetch Data: Since the pages are user-specific (due to progress), full static generation is tricky. However, you can cache non-sensitive parts. For instance, course structure could be cached in memory or Edge for quick retrieval (the progress still fetched live). Alternatively, use Next.js’s dynamic data caching: Next 14 allows using fetch with next: { revalidate: X } on the server. The API route or a server component could cache the course/lesson content for a short interval, reducing load on refreshes. This would mitigate repeated function cold starts and DB hits.
Consider Direct Supabase Fetch on Client: A more radical improvement is to bypass the Next API route entirely when loading lessons. The Supabase JS client on the browser can fetch the lesson and progress directly (it has the user’s JWT). This removes one network hop and one serverless function. For example, using Supabase from the browser:
ts
Copy
Edit
// In useEffect (client-side):
const { data, error } = await supabase.from('training_videos')
  .select('*, courses:training_courses(*), progress:member_progress(*)')
  .eq('slug', lessonSlug)
  .single();
This would retrieve the video, its course, and the user’s progress in one call (with RLS ensuring the user only gets their progress). It mirrors what the API route does
GitHub
GitHub
. By doing this on the client, you avoid the 502 risk altogether – Netlify then only serves the initial page shell and the data comes via Supabase’s CDN, which is designed for high concurrency. This trade-off shifts load to the client but improves reliability on refresh. (You are already using the Supabase client for auth state in the browser, so it’s viable here as well.)
Netlify Function Configuration: Ensure that the site is using the latest Next.js Runtime on Netlify. You’ve specified @netlify/plugin-nextjs@5.7.2
GitHub
, which supports Next 14. In the Netlify UI, double-check the “Functions timeout” – by default it’s 10 seconds. If you must allow longer processing (not ideal), Netlify supports background functions (15 min runtime) by adding export const config = { type: "experimental-background" } to the API route. However, try to avoid this unless absolutely necessary, since a video page should not require such a long server process.
Result: With these changes, refreshing a lesson/video page should no longer white-screen with a 502. Either the data loads faster, or errors are caught and returned gracefully (triggering your client-side error boundary UI instead of Netlify’s). The goal is to never hit the 10s limit – either by optimizing queries or by offloading work to the client. Users can then refresh pages without crashing the app.
3. CSP “Eval” Console Error
Root Cause: The app’s Content Security Policy is currently very strict about script execution. In production, the CSP allows scripts from known domains but locks down certain behaviors
GitHub
. The error in the console about CSP blocking 'eval' means some script attempted to use eval() or similar dynamic code, which CSP prevented. Likely culprits are the video player APIs: for example, Wistia’s embed script and some older Vimeo/YouTube players internally use new Function() or eval. In our case, the CSP does include 'unsafe-eval' for scripts
GitHub
, which should permit eval globally, but the error suggests something is still disallowed. One possibility is that an external script from a domain not whitelisted tries to execute. For instance, if the Wistia player (fast.wistia.com) was loaded, our CSP would block it entirely (that domain isn’t in the policy). Or if the Vimeo player loads a telemetry script from an unlisted domain, the browser could block it. The console message specifically mentions 'eval' – this often happens when a script is allowed to load but not allowed to eval (e.g. if 'unsafe-eval' were missing or not applied correctly). Fixes:
Verify CSP Includes All Needed Directives: First, confirm that the CSP header on production indeed contains 'unsafe-eval'. The Next.js config builds the CSP string dynamically
GitHub
. It should result in script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://www.youtube.com https://player.vimeo.com https://vimeo.com https://f.vimeocdn.com. Use your browser’s dev tools to inspect the actual CSP header at runtime. If 'unsafe-eval' is missing (perhaps due to formatting issues or Netlify trimming the multi-line string), add it explicitly. For example, ensure no stray newline breaks the header – your code already .replace(/\s+/g, ' ') to one line
GitHub
, so it should be fine. But double-check the deployed header.
Allow Wistia/Other Domains if Needed: If your app intends to support Wistia videos, update the CSP to include Wistia’s domains. For instance:
js
Copy
Edit
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fast.wistia.com", "https://fast.wistia.net", ...],
frameSrc: ["'self'", "https://fast.wistia.com", ...],
Add any CDN domains Wistia uses for video delivery too. The absence of these could cause the Wistia player to fail silently and possibly attempt eval in a way that’s blocked.
Review Third-Party Scripts: The console error stack (if available) can pinpoint which script/url triggered the eval violation. Common ones: the Vercel Analytics script (va.vercel-scripts.com) might use eval for tracking – but that domain is allowed in script-src. Stripe (if ever used) requires 'unsafe-eval' too. Since you saw a specific eval-block, it’s likely from an iframe API. Notably, some have found that the YouTube IFrame API can trigger CSP warnings about eval in certain contexts
community.spotify.com
, and Spotify’s embed API similarly complains without unsafe-eval
community.spotify.com
. We already allow it, so the key is to ensure the policy is applied.
Test in Development/Staging: In dev, the CSP is wide open by design (all sources * with unsafe eval)
GitHub
, so you won’t see issues. To reproduce the error, deploy to a staging environment with the production CSP. Then, open the browser console on a video page. If the error still occurs, note which resource is mentioned. You may discover a domain to whitelist or an inline script that’s being blocked. For example, if an inline <script> on the page is doing something eval-like, you might need to keep 'unsafe-inline' (which you have) or move that logic out of inline script.
Security vs Functionality: The CSP is there to protect against XSS, but video players are one of those cases that require loosened rules. It’s generally accepted that enabling 'unsafe-inline' or 'unsafe-eval' for known scripts is needed to get Vimeo/YouTube working
stackoverflow.com
. Our goal is to limit it to just what’s necessary. Given that, do not remove CSP entirely – instead, refine it. Once you’ve added all needed video domains and kept 'unsafe-eval', the eval error should disappear. The Vimeo player and others will operate without hitting the CSP wall.
Result: With the updated CSP, the console should no longer log evaluation errors, and third-party video scripts will load properly. Keep monitoring the reports; if new providers are added (e.g. adding a new CDN or video host), update the CSP accordingly so you don’t regress on this issue.
4. Multiple Video Player Implementations Causing Conflicts
Root Cause: The codebase currently has three different video player implementations coexisting:
Raw iframes and <video> tags in pages (the lesson slug page and video ID page both embed videos directly)
GitHub
GitHub
.
VimeoVideo component – a custom React component wrapping a Vimeo iframe and managing postMessage events manually
GitHub
GitHub
.
VideoPlayer component – a “universal” player loader that dynamically injects YouTube, Vimeo, or Wistia players using their official APIs
GitHub
GitHub
.
Having all three increases the complexity and risk of bugs. For example, the lesson page uses a simple iframe (no API) while the video page uses direct postMessage handling for Vimeo
GitHub
. Progress tracking logic is duplicated: the video page manually updates progress via /api/training/video-progress
GitHub
GitHub
, whereas the VideoPlayer component uses a React Query mutation to update progress
GitHub
GitHub
. These parallel implementations can get out of sync or interfere. One symptom is the video freeze (addressed above). Another is inconsistent state: e.g. one flow writes progress to member_progress
GitHub
 while another part of the app (the video API route) reads from a video_progress table
GitHub
 – a sign that the code paths diverged during development. Maintaining multiple players also makes future changes harder (you’d have to fix bugs in three places). Fixes:
Consolidate on One Player Component: Refactor the app to use a single video player approach for all training videos. The logical choice is the VideoPlayer React component, since it already supports Vimeo, YouTube, and Wistia in one interface
GitHub
GitHub
. Use it wherever a video is rendered. For example, in lesson/[lessonSlug]/page.tsx, replace the conditional iframe logic with <VideoPlayer platform={video.video_platform} videoId={video.id} url={video.video_url} ... />. This component will internally handle loading the correct API script and hooking events, instead of scattering that logic in the page. Remove the old VimeoVideo.tsx if it’s no longer used – its functionality overlaps with VideoPlayer (both manage Vimeo via postMessage).
Merge Progress Tracking Logic: Ensure that progress updates funnel through one system. Currently the video page calls /api/training/video-progress on each update
GitHub
, whereas the React Query mutation calls /api/training/progress (possibly a differently structured endpoint)
GitHub
. Decide on one API and use it consistently. It might be simplest to use the video-progress endpoint for all, and update the React Query hooks to point to that. Alternatively, update the video page to use the React Query useUpdateVideoProgress mutation instead of a manual fetch call – this way it benefits from caching and optimistic updates. The goal is to have one source of truth for progress state to avoid confusion.
Retire Redundant Code Paths: After unifying, deprecate the alternative routes. For instance, if you adopt the video ID page approach universally, you might drop the lesson slug page entirely (or make it redirect to the /training/video/[id] route). Conversely, if slug URLs are preferred for UX, you can keep that URL but internally use the unified player logic. In that case, maybe have lesson/[slug]/page.tsx do a lookup (client-side or in getServerSideProps) to find the video ID, then render the same VideoPageContent component. The key is that both routes should not independently maintain different implementations. Pick one as primary.
Testing and Cleanup: Once the consolidation is done, thoroughly test all video types:
Vimeo embed: does it play, pause, and track progress correctly across navigations?
YouTube embed: the VideoPlayer will inject YouTube’s <iframe> API – verify no CSP issues and events like end are handled.
Wistia: ensure the script loads (after adding CSP rules) and the player behaves (Wistia’s API was set up with a slight delay using setTimeout
GitHub
GitHub
 – confirm that still works with the unified approach).
Remove any code that is no longer needed (e.g. if slug route is replaced by ID route, or vice versa). Having dead code can confuse future maintenance, so cleaning it up will solidify the single implementation.
Result: By using one video player component and one set of API calls, you eliminate the potential for conflict. The app will have a single point of control for video playback, making it easier to fix bugs and add features (like new provider support or improved UI controls) without duplicating work. This also reduces the chance that two different parts of the app “fight” over the video (for example, overlapping event listeners or double-starting videos). In practice, users should experience smoother video playback and consistent progress saving regardless of which course or lesson they open.
5. Client-Side Data Fetching via Next.js API Routes
Root Cause: The current architecture loads lesson and course data in the client by calling Next.js API endpoints. For example, the lesson page does fetch('/api/training/lesson/[slug]') in a useEffect
GitHub
, and the courses page uses React Query to call /api/training/courses
GitHub
. While this works, it introduces extra network hops and complexity. The browser has to call the Next.js serverless function, which in turn calls Supabase, then returns JSON to the client. This double-hop can slow things down and was partly responsible for the refresh issue (point #2). It also means data is not loaded until after the page mounts, causing loading spinners on each navigation. In a Next.js 14 app, we have the opportunity to either fetch data on the server (during SSR or as a Server Component) or fetch directly from the client’s database API. Using the API routes for everything is effectively duplicating a layer that might not be strictly necessary. Fixes:
Use Supabase Client-Side for Lesson/Video Data: As mentioned earlier, consider querying Supabase directly from the browser for certain data. Supabase’s JS client is already initialized (supabase in your project) and knows the user’s auth state. For example, on the lesson page load, instead of calling our API, do:
ts
Copy
Edit
const { data: videoData, error } = await supabase.from('training_videos')
  .select(`
    id, title, description, video_url, video_platform, thumbnail_url, duration_seconds,
    course:training_courses(id, title, description),
    progress:member_progress(progress_seconds, completed)
  `)
  .eq('slug', lessonSlug)
  .single();
This single query replaces the serverless GET handler’s multiple queries
GitHub
GitHub
 by leveraging PostgREST joins and RLS on the client. The progress:member_progress(...) part will return the logged-in user’s progress for that video thanks to RLS (since the Supabase client includes the user’s JWT). In fact, your API was doing separate calls for progress and next lesson; you could even select next lesson in one query (e.g. a self-join or a second query from the client if needed). By doing this, you cut out the middleman. The Netlify function is no longer involved; the client talks directly to Supabase, which should be faster and more reliable for repeated loads.
Leverage Server Components for Authenticated Data (with Caution): Another approach is to fetch data in a server component using the new App Router capabilities. For example, you could turn the lesson page into a Server Component that calls Supabase (using a service role or the user’s cookies via createServerClient). Next.js can then SSR the lesson content. However, this is tricky with RLS because you’d need the user’s session cookie on the server side. It’s possible (Supabase’s helpers can use cookies() from Next headers), but you must ensure the cookie is forwarded. If done right, the server could retrieve the lesson and stream the page with the video already loaded (especially for public course content). The downside is the Netlify function still has to perform this work, potentially reintroducing timeout issues if not optimized. So, weigh this option carefully. It can improve perceived performance (no client loading spinner), but test it under Netlify’s constraints. A hybrid approach might be: SSR the static parts (course title, lesson title, etc.) and defer the video player loading to the client. That way the page HTML is ready quickly, and then the client fetches the video stream or progress.
Trim Unnecessary API Calls: Audit where you call Next API routes from the client. Each one is an extra round-trip and function execution. For instance, the training dashboard might call both /api/training/courses and /api/training/progress on load
GitHub
GitHub
. Perhaps the courses API already includes progress stats (in your CoursesResponse it has overallProgress, completedLessons, etc. 
GitHub
), making the separate progress call redundant. If so, remove the extra call and fetch all needed data in one go. Every consolidated call reduces overhead and chances for error. Use React Query’s ability to fetch once and share data across components (which you are doing with queryKey: queryKeys.training for courses
GitHub
). Ensure components subscribe to the same query result instead of fetching duplicate data via different endpoints.
Keep or Simplify Next API Routes: If you find certain complex logic is easier to keep on the server (for example, enrolling a user in a course, or verifying permissions), you can keep those API routes but maybe refactor them for efficiency. For instance, if enrollment (in /api/training/enroll) or progress updates are being done in two places, unify them. In fact, your useUpdateVideoProgress mutation calls /api/training/progress POST
GitHub
, while the video page calls /api/training/video-progress POST
GitHub
. These two endpoints likely do similar things. It’s worth merging them to one (to avoid confusion which one to use). Then the client can uniformly call that one for all progress updates (whether via React Query or via direct fetch).
Result: The application will become more efficient and simpler. By reducing reliance on intermediate API routes for every data fetch, you cut down latency and chances of serverless failures. Pages will load faster (less time waiting for an API response) and you’ll show fewer loading spinners. The code will also be easier to maintain – for example, if the shape of training data changes, you’ll update fewer places (maybe just the Supabase query in one React hook, rather than three different API route handlers and their corresponding front-end calls). Do make sure proper error handling and loading states are in place for the new approach, as you’ll still want to handle cases like network failures gracefully on the client side. Overall, streamlining data fetching will complement the video player improvements and make the app feel snappier and more robust.
6. Recommendation: Migrating to a Modern Video Player Library (Optional)
In addition to the targeted fixes above, consider a strategic improvement: using a dedicated video player library. Right now, a lot of custom code is written to handle Vimeo, YouTube, Wistia embeds and their quirks. This is hard to get perfectly right and can be brittle. Libraries like react-player or @vime/react can abstract these details. For example, react-player is a popular component that supports YouTube, Vimeo, Wistia, and more out of the box
dev.to
. You simply feed it a URL and it handles loading the correct iframe, API, and provides events like onProgress and onEnded. It would likely use the same underlying iframe APIs, but the benefit is community-tested reliability and updates. Migration Path:
Install and test a library like react-player. Start with one provider (say Vimeo) and replace the custom <iframe> with <ReactPlayer url={vimeoUrl} controls onProgress={...} />. Wire its events to your progress update logic. Because react-player internally already throttles progress events and signals when a video ends, you can hook those into your updateVideoProgress function.
Compare behavior: ensure features like autoplay, mute, etc., are controllable through the library’s props (they are). Adjust CSP if the library loads scripts from new domains (the library docs will usually list what it needs – for example, for Vimeo it still uses player.vimeo.com).
Gradually replace the manual player implementations with the library component. You might wrap react-player in your own <UnifiedPlayer> component to handle styling and any additional logic (like showing a custom loading spinner or “video not available” message, similar to what you had in place
GitHub
). This wrapper can also unify the interface with the rest of your app (so you don’t scatter react-player usage everywhere, but instead have one abstraction).
Test on all browsers and devices (especially mobile, where iframes can behave differently). Libraries often take care of mobile considerations (e.g. not autoplaying sound without user interaction), but double-check that things like the aspect ratio and responsive sizing still work. Your current code sets a 16:9 container for iframes
GitHub
 – you can achieve the same via CSS or the library’s style props.
Once confident, you can remove large chunks of custom code: the entire VideoPlayer.tsx logic might be replaced with a much simpler wrapper around ReactPlayer. Less code means fewer opportunities for bugs and easier maintenance.
Adopting a library is optional – your custom solution can be made to work with the fixes above. But in the long run, using a well-maintained player component can save time. It will handle updates to third-party APIs and edge cases (for example, if YouTube changes something in their embed, the library maintainers often adjust for it). Given this is a user-facing, critical part of the app, leveraging a proven solution makes sense unless you have very custom requirements. Conclusion: By addressing each of these points – from fixing the immediate bugs (video freezing, 502 errors, CSP violations) to refactoring for simplicity (one video player codepath, more direct data fetching) – the OurTeam application will become more robust and easier to work with. These changes eliminate the root causes of the current issues: videos will load without stalling, pages can be refreshed without error, security policies will be correctly tuned, and the code will be unified to prevent internal conflicts. Each fix can be implemented incrementally: tackle the CSP and player unification first (to solve the user-facing problems), then improve the data fetching and consider the library migration as a quality-of-life upgrade for the codebase. With a step-by-step approach and thorough testing after each change, you’ll transform the video training feature into a stable, seamless experience for users. The combination of technical fixes (like adjusting headers and API calls) and architectural cleanup (removing duplicate implementations) will set the stage for future enhancements, such as new video sources or offline caching, without re-introducing these kinds of bugs. Sources: The analysis referenced the project’s code and configuration for details on current behavior
GitHub
GitHub
GitHub
, as well as external guidance on CSP requirements for video embeds
stackoverflow.com
stackoverflow.com
 and known Netlify function timeout issues
answers.netlify.com
, to ensure the solutions are aligned with both the app’s context and industry best practices.