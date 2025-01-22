import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserNav } from "@/components/layout/user-nav";

export default function PrivacyPage() {
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
              <h1 className="text-4xl font-bold tracking-tighter">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Introduction</h2>
              <p className="text-muted-foreground">
                At Favely, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
              <div className="space-y-2">
                <h3 className="text-xl font-medium">2.1 Information You Provide</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li>Account information (name, email, password)</li>
                  <li>Profile information (username, bio, avatar)</li>
                  <li>Content you create (lists, descriptions, comments)</li>
                  <li>Communications with other users</li>
                </ul>

                <h3 className="text-xl font-medium mt-4">2.2 Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li>Device information (IP address, browser type)</li>
                  <li>Usage data (interactions, preferences)</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li>Provide and maintain our service</li>
                  <li>Personalize your experience</li>
                  <li>Process your requests and transactions</li>
                  <li>Send you updates and notifications</li>
                  <li>Improve our service</li>
                  <li>Detect and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                <li>Service providers who assist in our operations</li>
                <li>Other users (based on your privacy settings)</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Your Rights</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing of your information</li>
                  <li>Export your data</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Children&apos;s Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not intended for children under 13. We do not knowingly collect information from children under 13.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Changes to Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us through our feedback form.
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