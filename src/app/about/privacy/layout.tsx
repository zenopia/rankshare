interface PrivacyLayoutProps {
  children: React.ReactNode;
  username: React.ReactNode;
}

export default function PrivacyLayout({
  children,
  username,
}: PrivacyLayoutProps) {
  return (
    <>
      {children}
      {username}
    </>
  );
} 