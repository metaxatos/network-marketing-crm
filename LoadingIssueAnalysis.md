Investigation Report: Dashboard “Loading…” Hang After Supabase Login
Summary of the Issue
After a successful Supabase authentication, users are not seeing the dashboard content – the screen remains stuck on the “Loading your success...” message indefinitely. Debug logs confirm that the Supabase auth session is valid (isAuthenticated: true and a user object exists), but the application fails to load the corresponding member record from the database (hasMember: false stays true)
GitHub
. Console errors show an auth initialization timeout and a fetch timeout in the client code, indicating that a crucial data fetch (likely for the user’s member profile) is not completing in time
GitHub
. This suggests the frontend is waiting for some user-specific data that never arrives, causing the dashboard to never leave the loading state.
Observations from Debugging
Supabase Auth Works: The user can log in and obtain a valid session token. The Supabase session cookie is present (the Next.js middleware sees user.id correctly on protected routes) and the user’s ID exists in the members table (inserted via the sign-up trigger) as expected. So, basic authentication is not the problem.
member Data Not Loading: The Zustand useUserStore shows user is set but member remains null. In the custom debug page, the app repeatedly logs: isAuthenticated: true, hasUser: true, hasMember: false, even after waiting several seconds
GitHub
. This means the client never successfully fetched or received the logged-in user’s member record from Supabase.
Timeout Errors: In the browser console, we see “Auth loading timeout” and “Fetch timeout - API call took too long” errors. These correspond to the initialize() logic in userStore.ts, where the app fetches /api/auth/user-simple with a 5-second abort timer
GitHub
. The “Auth loading timeout” suggests our 8-second overall guard kicked in, implying the user initialization didn’t complete in time
GitHub
. In other words, the call to /api/auth/user-simple hung or didn’t return quickly, causing the frontend to bail out.
API Route Behavior (/api/auth/user-simple): This endpoint is meant to load the minimal user info (member profile, etc.) after login. The code confirms it does the following
GitHub
GitHub
:
Uses the Supabase Server client (with createClient() from @/lib/supabase/server) to get the current user via supabase.auth.getUser().
If a user is found, queries the members table for id == user.id (with RLS in effect) and then the member_profiles table for that user’s profile. It returns a JSON with { user, member, profile, company }.
Notably, the RLS policy on members allows a logged-in user to select their own row only if auth.uid() = id
GitHub
. If this policy fails (e.g. if auth.uid() is not set or doesn’t match), the query would return no data. The user-simple code uses .maybeSingle() without throwing on empty result
GitHub
, so an auth failure would yield member = null with no error – exactly the scenario we see. Importantly, such a query should return quickly (even if empty); it shouldn’t hang for 5+ seconds. The fact it timed out implies something deeper than a simple “no rows” – likely the request wasn’t properly authenticated, causing a stall or repeat attempts.
Dashboard Data Hooks: The dashboard page uses React Query hooks like useDashboardMetrics, useActivityFeed, etc., to fetch data from /api/dashboard/... endpoints
GitHub
GitHub
. These calls rely on the user’s auth context as well. If the user’s identity isn’t recognized (or if member info is required on the backend), they might fail or return empty data. However, the primary blocker is the auth initialization – since the component checks useAppAuth().loading and shows the big loading spinner until initialize() completes
GitHub
, the dashboard never even tries to render content. In our case, initialize() never fully succeeds (it times out with member == null), so the loading flag stays true and the spinner remains.
Potential Auth Context Issue: Given that the Supabase session cookie is set (the middleware finds the user), a likely culprit is that the Supabase client in the API route isn’t using that cookie correctly. The project’s createClient() (in supabase/server.ts) uses cookies() from next/headers to pass cookies into createServerClient
GitHub
GitHub
. In a Next.js App Router environment, this should capture the sb-access-token cookie and allow queries as the user. If for some reason this isn’t working on Netlify (different runtime or cookie handling), the API route might be running as an anonymous user. In that case, supabase.auth.getUser() could still return a user (if the JWT is in a header), but the subsequent .from('members').select() might not automatically carry the same auth. This mismatch could cause the query to hang or be denied by RLS. There were no explicit error logs like “Not authenticated” or 401 from the API route, which suggests the route did see a user but perhaps failed to apply the JWT to the database request.
Diagnostics Data: A custom /diagnostics page in the repo runs tests on these endpoints. Notably, it fetches both /api/auth/user-simple and the original (more complex) /api/auth/user endpoint and measures their response
GitHub
GitHub
. If we ran this, we’d likely see that user-simple returns status 200 with user true but member false (or possibly a 504 if it times out). The original /api/auth/user probably also fails or returns no member. This further confirms the member query is not succeeding under RLS conditions.
Root Cause Analysis
The core issue is that the backend cannot retrieve the logged-in user’s members row due to an authorization context problem, causing the frontend to never receive member data and stick on the loading screen. In essence, the app is logged in to Supabase (identity established), but the Row-Level Security policy on members is preventing data access – likely because the query is not executing with the correct auth.uid() context. Two key factors support this conclusion:
The RLS policy requires auth.uid() = id for any SELECT on members
GitHub
. If the Supabase client’s JWT isn’t being applied, auth.uid() would be null, so the condition fails and no data is returned. The code does not treat this as an error (no exception), so member just remains null. The frontend then repeatedly sees hasMember: false and keeps “loading your success” forever. Essentially, the app is authorized at the Auth level but unauthorized at the Data level.
The timeout behavior (“Fetch timeout - API call took too long”
GitHub
) hints that something unusual is happening in that API call. A normal RLS denial is fast (it would return an empty result almost instantly). A 5+ second hang suggests the request might be waiting on network or retrying. One possibility is that the Supabase client might be trying to refresh an expired token or exchange cookies, causing delay. Another possibility is simply that the function was waiting the full 5 seconds because it got no response at all. This can happen if the Supabase URL or anon key were misconfigured (the request doesn’t reach the database). However, since login works, the URL/key should be correct. It’s more likely the hang is due to the Supabase createServerClient not properly getting the access token from the cookie in this Netlify deployment, resulting in a stalled request. (For instance, if no Authorization header is set, the PostgREST endpoint might not immediately reject, but the auth-helpers could be waiting for a cookie refresh token logic – though typically it’d still return 401 quickly. This part is a bit speculative, but the evidence aligns with an auth context mismatch.)
In summary, the root cause is an authentication/authorization synchronization issue: the frontend calls the backend to fetch user data, but the backend query is not running with the expected user privileges. This is most likely due to how Supabase is integrated in the Next.js API route with cookies/RLS. The RLS policies themselves are correct – the logged-in user should be allowed to read their data – so the failure implies the user’s ID (auth.uid()) isn’t being seen by the policy when the query executes. As a result, the members lookup returns nothing, the client never sets member, and the loading spinner never disappears.
Recommendations and Fixes
1. Fix the Supabase Auth Context in API Routes: Ensure that your Next.js API routes are properly initialized with the user’s session. In the current setup, you use a custom createClient() with cookies() from next/headers. This works on Vercel, but on Netlify you might need to adjust how cookies are passed. Consider using the official Supabase helpers for Next.js App Router. For example, the @supabase/auth-helpers-nextjs package provides a createRouteHandlerClient() which you can call inside your API route handler, passing it the cookies from the NextRequest. This ensures the Supabase client is aware of the access token. In your code, you can modify the handler like so:
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase'; // if you have types

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // ... then query members as needed
}
This approach offloads cookie/token handling to the helper. It’s likely more robust than manually using @supabase/ssr as you did. If you implement this, the auth.uid() in your RLS policies should correctly correspond to user.id on every query. This change would address the scenario where the API route was inadvertently querying as an anonymous user. (In testing, ensure that user-simple now returns the member data – you can log member and any error from the Supabase query to verify it’s no longer empty.) 2. Double-Check RLS Policies & Data: While the policies look correct
GitHub
, it’s worth verifying them directly on Supabase. Go to your Supabase project’s SQL editor and run a quick simulation:
-- Replace '<USER_ID>' with an actual UUID of a test user
set request.jwt.claims = json_build_object('sub', '<USER_ID>');
select * from public.members where id = '<USER_ID>';
This will simulate a select as that user. You should get the row back. If this fails, there’s a policy issue. Also, check that the auth.uid() function in policies is working (Supabase uses JWT “sub” as uid). Since you created policies with auth.uid() directly, it should be fine. No errors in this step means the issue is indeed the context, not the policy logic. Additionally, confirm the members table actually has the row for your user (it should, given the trigger on auth.users), and that the ID matches exactly (no casing issues or anything – likely fine because both are UUIDs). Sometimes, a null member could simply mean the row wasn’t there – but you already indicated the user exists in members. 3. Adjust Frontend Logic to Prevent Infinite Loading: It’s good practice to handle the “missing member” case more gracefully to avoid a deadlock. A couple of improvements to consider:
Avoid re-initializing if not needed: In useAppAuth you always call initialize() on mount
GitHub
. If the user just logged in via your /api/auth/login route, you already set userStore.user and userStore.member from that response
GitHub
. Immediately calling initialize() again can overwrite or null out that state if the fetch fails. You could add a condition: if userStore.user and userStore.member are already populated (and perhaps a timestamp of last fetch is recent), skip initialization or at least skip the remote fetch. This would use the data obtained at login and avoid a redundant call that might fail. For example:
useEffect(() => {
  if (userStore.user && userStore.member) {
    return; // already have data, no need to re-fetch
  }
  initialize().catch(...);
}, [initialize]);
This way, after a fresh login, the dashboard can use the member data immediately without going to loading state again. You might still call initialize() on a page refresh (when the store is rehydrated from persist with possibly stale data or just a user object), but you can refine the logic as needed.
Provide a Fallback/Retry: If for some reason member comes back null (e.g. a race condition where the row wasn’t available yet), consider implementing a short retry or fallback UI. Your debug page already navigates to a test page after 5 seconds of loading as a failsafe
GitHub
GitHub
. For the real dashboard, you could similarly decide that if after X seconds the member isn’t loaded, show a message like “Unable to load your data, click here to retry.” and allow the user to re-trigger the fetch. This prevents the user from staring at an indefinite spinner and gives a chance to recover if a transient issue occurred. In practice, once you fix the underlying auth context, this shouldn’t be necessary – but it’s a nice resilience improvement.
4. Increase Timeout or Remove It During Debugging: The 5-second abort for /api/auth/user-simple might be prematurely cutting off a response. As a temporary measure, you could extend this to, say, 10 seconds to see if the request eventually succeeds. In userStore.initialize
GitHub
, the abort is set at 5000ms. Try increasing that to 10000ms (and the overall timeoutId to maybe 12–15 seconds) just to gather more info. It’s not a solution for production (you don’t want a long hang), but it may allow an error message from the API to come through. For example, if the issue is that the Supabase query returned a 401 or some Postgrest error, your code would log it only if the fetch completes. Right now, it’s likely aborting before any error payload returns. By removing the abort, you might see an “error: 401 Unauthorized” in the console from response.ok check, which would directly confirm the auth context problem. Just remember to remove or reduce the timeout after debugging, or handle it more gracefully (Supabase queries are usually fast – the timeout is mainly a safeguard). 5. Utilize Supabase Client on the Client-Side (if needed): Another way to sidestep this issue (though it shouldn’t be necessary after fixing the API) is to leverage the Supabase JS client in the browser for initial data. Since supabase.auth.getSession() on the client confirms the session, you can do something like:
const { data: memberData, error } = await supabase
    .from('members')
    .select('*')
    .single();
Supabase JS will automatically include the user’s JWT for this call (it has the session from login). If RLS permits, you’ll get the member row. You could then update the Zustand store with it. This approach avoids any cookie/header issues that might be happening in the Next API route. It effectively tests the query in the same context as the login was done. If this works, it’s a strong indicator that the API route’s context was the only problem. However, do be cautious: calling supabase directly from the client means exposing certain errors or conditions to the client. It’s fine for reading your own data though. Given that you already trust the client with their own data (and your RLS prevents access to others), this is a valid solution. It simplifies the flow (no extra round-trip to your server for what is essentially a direct DB query). Many Supabase apps use the JS client on the front-end for most data operations, relying on RLS for security. The downside is you lose the opportunity to easily join the profile/company in one request (since supabase-js doesn’t support multi-table join in one call; you’d do two calls or a view/RPC). But you could fetch the member_profiles in a second call or use a PostgreSQL view to combine member+profile if needed. Bottom line: if time is critical, using the client directly to load dashboard data is a quick fix. But the preferred solution is to make the server route work, so your architecture is consistent (especially since you already wrote those API routes). 6. Verify Environment Variables on Netlify: Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set in the Netlify environment (or in your build config). The code logs a warning if these are missing
GitHub
. An incorrect URL or key could lead to the Supabase client hanging or using a wrong project. Given that login and other parts function, this is probably fine, but double-check casing, absence of trailing slashes, etc. Also, confirm that the site domain ourteam.gr is correctly configured such that the Supabase auth cookie is being sent. If your site was on a different domain or subdomain when setting the cookie during login, the cookie might not be included on requests to another domain. For example, if some API calls go to a different domain or if Netlify does something with cookies between SSR/ISR functions, it could matter. Since you’re using relative /api/... calls, it should all be same-domain. Just be mindful if you ever use a custom domain or deploy preview URLs – the cookie domain might need to allow those (Supabase cookies default to the parent domain of the app). 7. Monitor Supabase Logs: In the Supabase project dashboard, enable query logging or check the Logs section around the time of these requests. If RLS blocked something, you might see an entry for a denied read or a hint of an unauthorized request. Supabase’s logs can show errors or warnings for policies. This can provide confirmation: for example, a log might show “anonymous access to table members denied by RLS policy,” or similar. If you see such a message corresponding to your user-simple query, you have concrete proof that the request had no valid JWT attached when hitting the DB. This can guide you straight to focusing on the auth helper fix. Conversely, if no such error appears, it means the query might have been authorized but perhaps hung or took too long (which could indicate a performance issue or something like waiting on a new Postgres replica – though for a single-row query that’s unlikely). 8. (If All Else Fails) Use a Service Role for Initial Load: As a last resort, you could temporarily use the Supabase Service Key on your server route to fetch the member record. The Service Key bypasses RLS (acting as a superuser). For instance, using process.env.SUPABASE_SERVICE_ROLE_KEY in createClient would let you retrieve any data. You would must still filter by id = user.id to only get the current user’s info, but you wouldn’t worry about RLS. This would definitively avoid the RLS issue, at the cost of having a more privileged key in your server code. Since this is a serverless function on Netlify, it’s secure (the key isn’t exposed to the client). If you go this route, store the service URL and key in environment variables (Supabase provides them) and instantiate a separate Supabase client for these admin queries. For example:
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
// then supabaseAdmin.from('members').select('*').eq('id', user.id).single();
This will get the member even if the user’s auth context is broken. In fact, you could combine this with a sanity check: if your normal supabase client (anon key + user JWT) returns null for the member but you know the user is authenticated, you could then fall back to supabaseAdmin to fetch the data. That way the user isn’t stuck. However, do try the earlier fixes first – using the service role for routine data retrieval is not ideal if you can avoid it. By implementing fix #1 (proper auth context in API), you will likely solve the problem at its root. The client will receive the member data, populate useUserStore.member, and the loading state will become false. The dashboard will then render normally with the user’s info. The RLS policies already in place will continue to enforce data security, and you won’t have to weaken any rules.
Conclusion
The dashboard hang was caused by the front-end waiting for user-specific data that never arrived due to an authorization mismatch in the back-end query. The Supabase authentication was successful, but the application wasn’t using that auth when querying the members table, likely due to the way the Next.js API route was set up. The solution is to fix the Supabase client setup in the API (or adjust the strategy) so that the logged-in user’s JWT is applied to all database requests. Once the backend returns the member record (or otherwise confirms the user’s data), the hasMember flag will become true, the loading spinner will disappear, and the dashboard will proceed to load the metrics and content. By addressing the auth context and possibly adding a bit more resiliency (as outlined above), the “Loading your success...” issue should be resolved, allowing users to see their dashboard immediately after logging in. Sources:
Zustand user store initialization logic showing the fetch to /api/auth/user-simple and the timeout handling
GitHub
GitHub
.
Supabase Row Level Security policy setup for members (allows select where auth.uid() = id)
GitHub
.
Next.js middleware confirming the auth cookie/user is present before hitting the dashboard
GitHub
GitHub
.
API route for user-simple demonstrating the member query which returned null in our case
GitHub
GitHub
.
Citations
GitHub
page.tsx

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/dashboard-debug/page.tsx#L36-L44
GitHub
userStore.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/stores/userStore.ts#L130-L139
GitHub
userStore.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/stores/userStore.ts#L60-L69
GitHub
route.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/api/auth/user-simple/route.ts#L32-L41
GitHub
route.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/api/auth/user-simple/route.ts#L54-L62
GitHub
setup.sql

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/database/setup.sql#L184-L192
GitHub
route.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/api/auth/user-simple/route.ts#L34-L42
GitHub
useDashboard.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/hooks/queries/useDashboard.ts#L8-L19
GitHub
useDashboard.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/hooks/queries/useDashboard.ts#L26-L39
GitHub
page.tsx

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/dashboard/page.tsx#L58-L66
GitHub
server.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/lib/supabase/server.ts#L4-L13
GitHub
server.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/lib/supabase/server.ts#L17-L25
GitHub
page.tsx

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/diagnostics/page.tsx#L50-L59
GitHub
page.tsx

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/diagnostics/page.tsx#L69-L78
GitHub
useAuth.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/hooks/useAuth.ts#L14-L22
GitHub
userStore.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/stores/userStore.ts#L194-L202
GitHub
page.tsx

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/dashboard-debug/page.tsx#L17-L26
GitHub
page.tsx

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/dashboard-debug/page.tsx#L46-L56
GitHub
userStore.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/stores/userStore.ts#L80-L89
GitHub
client.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/lib/supabase/client.ts#L7-L15
GitHub
userStore.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/stores/userStore.ts#L76-L85
GitHub
middleware.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/middleware.ts#L56-L65
GitHub
middleware.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/middleware.ts#L66-L75
GitHub
route.ts

https://github.com/metaxatos/network-marketing-crm/blob/c5fbe8bc31a1ea909a437d19630018db3378075a/src/app/api/auth/user-simple/route.ts#L90-L98