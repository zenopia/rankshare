import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

interface SignInLayoutProps {
  children: React.ReactNode;
  username: React.ReactNode;
}

export default function SignInLayout({
  children,
  username,
}: SignInLayoutProps) {
  return (
    <>
      {children}
      {username}
    </>
  );
} 