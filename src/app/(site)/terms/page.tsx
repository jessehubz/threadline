import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Threadline",
  description: "Terms of Service for the Threadline platform.",
};

export default function TermsPage() {
  return (
    <article className="site-page-content">
      <h1
        style={{
          fontSize: "36px",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          marginBottom: "8px",
        }}
      >
        Terms of Service
      </h1>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "40px" }}>
        Last updated: July 1, 2026
      </p>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          1. Acceptance of Terms
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          By accessing or using Threadline (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
          If you do not agree to these terms, you may not access or use the Service. These terms apply to all
          visitors, users, and others who access or use the Service.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          2. Description of Service
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Threadline is a collaborative task management platform built around visual dependency graphs.
          The Service includes task tracking, project collaboration, real-time messaging, file attachments,
          analytics, and related features accessible via the web application.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          3. User Accounts
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "12px" }}>
          You are responsible for safeguarding the password and credentials associated with your account.
          You agree not to disclose your password to any third party and to notify us immediately upon
          becoming aware of any breach of security or unauthorized use of your account.
        </p>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          You must be at least 13 years old to use the Service. By agreeing to these Terms, you represent
          and warrant that you are at least 13 years of age.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          4. Acceptable Use
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "12px" }}>
          You agree not to use the Service to:
        </p>
        <ul style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, paddingLeft: "24px", listStyleType: "disc" }}>
          <li style={{ marginBottom: "8px" }}>Violate any applicable law or regulation</li>
          <li style={{ marginBottom: "8px" }}>Infringe on any third-party intellectual property rights</li>
          <li style={{ marginBottom: "8px" }}>Transmit malware, viruses, or other harmful code</li>
          <li style={{ marginBottom: "8px" }}>Attempt to gain unauthorized access to other accounts or systems</li>
          <li style={{ marginBottom: "8px" }}>Harass, abuse, or harm another person or group</li>
          <li style={{ marginBottom: "8px" }}>Send spam or unsolicited communications</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          5. Intellectual Property
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          The Service and its original content, features, and functionality are owned by Threadline and are
          protected by international copyright, trademark, patent, trade secret, and other intellectual
          property laws. You retain ownership of all content you upload to the Service.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          6. Termination
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          We may terminate or suspend your account immediately, without prior notice or liability, for any
          reason whatsoever, including without limitation if you breach the Terms. Upon termination, your
          right to use the Service will immediately cease. You may request a copy of your data within 30
          days of termination.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          7. Limitation of Liability
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          In no event shall Threadline, nor its directors, employees, partners, agents, suppliers, or
          affiliates, be liable for any indirect, incidental, special, consequential or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
          resulting from your access to or use of or inability to access or use the Service.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          8. Changes to Terms
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          We reserve the right to modify or replace these Terms at any time. If a revision is material,
          we will try to provide at least 30 days&apos; notice prior to any new terms taking effect.
          What constitutes a material change will be determined at our sole discretion.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          9. Contact Us
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          If you have any questions about these Terms, please contact us at{" "}
          <a href="mailto:legal@threadline.app" style={{ color: "var(--accent)", textDecoration: "none" }}>
            legal@threadline.app
          </a>.
        </p>
      </section>
    </article>
  );
}
