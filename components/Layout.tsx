// Workaround for Netlify build error
// This file provides a minimal Layout component to resolve build issues

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export default Layout
export { Layout } 