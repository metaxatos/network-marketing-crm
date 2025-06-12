/**
 * Get the URL for redirects and authentication
 * Handles both local development and production environments
 */
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_APP_URL ?? // Your custom domain
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'
  
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}
