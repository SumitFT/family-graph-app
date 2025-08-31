import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Family Graph',
  description: 'Build and explore your extended family tree.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="nav">
          <div className="brand">👨‍👩‍👧‍👦 Family Graph</div>
          <Link href="/">Home</Link>
          <Link href="/people">People</Link>
          <Link href="/tree">Tree</Link>
          <div style={{flex:1}}/>
          <a href="/login" className="badge">Login / Account</a>
        </div>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
