interface TermsLayoutProps {
  children: React.ReactNode;
  username: React.ReactNode;
}

export default function TermsLayout({
  children,
  username,
}: TermsLayoutProps) {
  return (
    <>
      {children}
      {username}
    </>
  );
} 