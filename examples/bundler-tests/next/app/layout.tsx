import 'tekivex-ui/styles';
import { Providers } from './providers';

export const metadata = { title: 'tekivex-ui — Next bundler test' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
