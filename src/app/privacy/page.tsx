import { MainLayout } from "@/components/layout/main-layout";

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 space-y-8">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Introduction</h2>
          <p>
            Welcome to Favely (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We respect your privacy and are committed to protecting your personal data.
            This privacy policy explains how we collect, use, and safeguard your information when you use our service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email address)</li>
              <li>Profile information (username, bio, profile picture)</li>
              <li>Content you create (lists, comments, interactions)</li>
              <li>Communications with us</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Automatically Collected Information</h3>
            <p>When you use our service, we automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usage data (interactions, features used)</li>
              <li>Device information (browser type, IP address)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain our service</li>
            <li>Improve and personalize your experience</li>
            <li>Communicate with you about updates and changes</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Sharing and Disclosure</h2>
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Service providers (hosting, authentication, analytics)</li>
            <li>Other users (based on your privacy settings)</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information.
            However, no method of transmission over the Internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Request data portability</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Third-Party Services</h2>
          <p>
            We use third-party services like Clerk for authentication and Google Analytics for usage analysis.
            These services have their own privacy policies, and we encourage you to review them.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Children&apos;s Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect
            personal information from children under 13. If you become aware that a child
            has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any
            changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our practices,
            please contact us at privacy@favely.net.
          </p>
        </section>
      </div>
    </MainLayout>
  );
} 