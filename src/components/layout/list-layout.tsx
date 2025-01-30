export interface ListLayoutProps {
  children?: React.ReactNode;
}

export function ListLayout({ children }: ListLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <div className="flex">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 