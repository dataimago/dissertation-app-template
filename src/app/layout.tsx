import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'js-yaml';
import type { Metadata } from 'next';
import './globals.css';

interface SpecForMetadata {
  user: { name: string };
  project: { title: string; description?: string };
}

const spec = load(
  readFileSync(resolve(process.cwd(), 'dataimago-spec.yaml'), 'utf-8'),
) as SpecForMetadata;

export const metadata: Metadata = {
  title: spec.project.title,
  description:
    spec.project.description ??
    `${spec.user.name}'s dissertation — an AI-native environment provisioned via dissertation.ai.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
