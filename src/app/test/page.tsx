export default function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
      <h1>🎉 Test Page Works!</h1>
      <p>If you can see this, the Next.js app is working properly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <ul>
        <li><a href="/dashboard">Go to Dashboard</a></li>
        <li><a href="/contacts">Go to Contacts</a></li>
        <li><a href="/team">Go to Team</a></li>
        <li><a href="/events">Go to Events</a></li>
        <li><a href="/emails">Go to Emails</a></li>
      </ul>
    </div>
  )
} 