import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Your dissertation',
  description: 'An AI-native dissertation environment provisioned via dissertation.ai.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
