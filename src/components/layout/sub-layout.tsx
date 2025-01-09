import { SubNavbar } from "./sub-navbar";

interface SubLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function SubLayout({ children, title }: SubLayoutProps) {
  return (
    <>
      <SubNavbar title={title} />
      <main>{children}</main>
    </>
  );
} 