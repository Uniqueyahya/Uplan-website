import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request Account Deletion | Uplan',
  description: 'Request the permanent deletion of your Uplan account and all associated personal data.',
};

export default function DeleteAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
