import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your account",
};

interface SignUpLayoutProps {
  children: React.ReactNode;
  username: React.ReactNode;
}

export default function SignUpLayout({
  children,
  username,
}: SignUpLayoutProps) {
  return (
    <>
      {children}
      {username}
    </>
  );
} 