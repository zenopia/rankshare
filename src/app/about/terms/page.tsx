import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserNav } from "@/components/layout/user-nav";


export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <MobileNav />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/Favely-logo.svg"
                  alt="Favely"
                  className="h-[30px] w-[120px]"
                  width={120}
                  height={30}
                  priority
                />
              </Link>
            </div>
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container max-w-4xl py-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Favely, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Favely is a platform that allows users to create, share, and discover lists. Our service includes features for list creation, collaboration, and content sharing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. User Accounts</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  To use certain features of our service, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Not share your account credentials</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. User Content</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  You retain ownership of content you create and share on Favely. By posting content, you grant us a license to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li>Display and share your content</li>
                  <li>Store and backup your content</li>
                  <li>Modify content format for display purposes</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Prohibited Content</h2>
              <p className="text-muted-foreground">
                Users may not post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Privacy</h2>
              <p className="text-muted-foreground">
                Our Privacy Policy explains how we collect, use, and protect your personal information. By using Favely, you agree to our privacy practices.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any violation of these Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may modify these terms at any time. Continued use of Favely after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms, please contact us through our feedback form.
              </p>
            </section>
          </div>
        </div>
      </main>
      <footer className="border-t">
        <div className="container flex h-14 items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2025 Favely. All rights reserved.</p>
          <nav className="flex items-center space-x-4 text-sm">
            <Link href="/about/terms" className="text-muted-foreground hover:text-[#801CCC]">
              Terms
            </Link>
            <Link href="/about/privacy" className="text-muted-foreground hover:text-[#801CCC]">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
} 