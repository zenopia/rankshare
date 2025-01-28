interface AuthLayoutProps {
  children: React.ReactNode;
  username: React.ReactNode;
}

export default function AuthLayout({
  children,
  username,
}: AuthLayoutProps) {
  return (
    <>
      {children}
      {username}
    </>
  );
} 