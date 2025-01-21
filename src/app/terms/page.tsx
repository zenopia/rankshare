import { MainLayout } from "@/components/layout/main-layout";

export default function TermsOfServicePage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 space-y-8">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
          <p>
            By accessing or using Favely, you agree to be bound by these Terms of Service. If you disagree
            with any part of these terms, you may not access the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. User Accounts</h2>
          <div className="space-y-2">
            <p>When creating an account on Favely, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update your account information if it changes</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. User Content</h2>
          <div className="space-y-2">
            <p>
              Our service allows you to create, share, and manage lists and other content. You retain ownership
              of your content, but grant us a license to use, store, and share it according to your privacy settings.
            </p>
            <p>You agree not to post content that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violates any laws or regulations</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malicious software or code</li>
              <li>Harasses, abuses, or threatens others</li>
              <li>Is spam, fraudulent, or misleading</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Intellectual Property</h2>
          <p>
            The service and its original content (excluding user-generated content) are and will remain
            the exclusive property of Favely and its licensors. Our trademarks and trade dress may not
            be used without our prior written permission.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Service Modifications</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of our service at any time,
            with or without notice. We shall not be liable to you or any third party for any modification,
            suspension, or discontinuation of the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Privacy and Data Protection</h2>
          <p>
            Your use of Favely is also governed by our Privacy Policy. By using our service,
            you consent to our collection and use of information as detailed in the Privacy Policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Third-Party Services</h2>
          <p>
            Our service may contain links to third-party websites or services not owned or controlled
            by Favely. We have no control over and assume no responsibility for the content, privacy
            policies, or practices of any third-party services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the service immediately, without
            prior notice, for conduct that we believe violates these Terms or is harmful to other
            users, us, or third parties, or for any other reason.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
          <p>
            In no event shall Favely, its directors, employees, partners, agents, suppliers, or
            affiliates be liable for any indirect, incidental, special, consequential, or punitive
            damages, including loss of profits, data, or other intangible losses.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any
            material changes by posting the new Terms on this page and updating the date at the top.
            Your continued use of the service after such modifications constitutes your acceptance
            of the new Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at terms@favely.net.
          </p>
        </section>
      </div>
    </MainLayout>
  );
} 