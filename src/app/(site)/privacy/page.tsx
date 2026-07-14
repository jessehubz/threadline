import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Threadline",
  description: "Privacy Policy for the Threadline platform.",
};

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "40px" }}>
        Last updated: July 1, 2026
      </p>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          1. Information We Collect
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "12px" }}>
          We collect information you provide directly to us when you create an account, use the Service,
          or communicate with us. This includes:
        </p>
        <ul style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, paddingLeft: "24px", listStyleType: "disc" }}>
          <li style={{ marginBottom: "8px" }}>Account information (name, email address, profile picture)</li>
          <li style={{ marginBottom: "8px" }}>Project and task data you create within the Service</li>
          <li style={{ marginBottom: "8px" }}>Messages and comments sent through the platform</li>
          <li style={{ marginBottom: "8px" }}>Files and attachments you upload</li>
          <li style={{ marginBottom: "8px" }}>Usage data (pages visited, features used, timestamps)</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          2. How We Use Your Information
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "12px" }}>
          We use the information we collect to:
        </p>
        <ul style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, paddingLeft: "24px", listStyleType: "disc" }}>
          <li style={{ marginBottom: "8px" }}>Provide, maintain, and improve the Service</li>
          <li style={{ marginBottom: "8px" }}>Send you notifications and updates about your projects</li>
          <li style={{ marginBottom: "8px" }}>Respond to your comments, questions, and customer service requests</li>
          <li style={{ marginBottom: "8px" }}>Monitor and analyze trends, usage, and activities</li>
          <li style={{ marginBottom: "8px" }}>Detect, investigate, and prevent security incidents</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          3. Data Sharing
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          We do not sell your personal information. We may share your information with third-party service
          providers who perform services on our behalf (e.g., hosting, analytics, email delivery). These
          providers are bound by contractual obligations to keep personal information confidential and to
          use it only for the purposes for which we disclose it to them.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          4. Data Security
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          We implement appropriate technical and organizational security measures to protect your personal
          data against unauthorized access, alteration, disclosure, or destruction. This includes encryption
          in transit and at rest, regular security audits, and role-based access controls.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          5. Data Retention
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          We retain your personal data only for as long as necessary to fulfill the purposes for which it
          was collected, including satisfying any legal, accounting, or reporting requirements. When you
          delete your account, we will delete or anonymize your personal data within 30 days, except where
          we are required by law to retain it.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          6. Your Rights
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "12px" }}>
          Depending on your location, you may have the following rights regarding your personal data:
        </p>
        <ul style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, paddingLeft: "24px", listStyleType: "disc" }}>
          <li style={{ marginBottom: "8px" }}>Right to access your personal data</li>
          <li style={{ marginBottom: "8px" }}>Right to rectification of inaccurate data</li>
          <li style={{ marginBottom: "8px" }}>Right to erasure (right to be forgotten)</li>
          <li style={{ marginBottom: "8px" }}>Right to restrict processing</li>
          <li style={{ marginBottom: "8px" }}>Right to data portability</li>
          <li style={{ marginBottom: "8px" }}>Right to object to processing</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          7. Cookies
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          We use essential cookies required for the Service to function (authentication, session management,
          and theme preferences). We do not use advertising or tracking cookies. No third-party cookies are
          set without your explicit consent.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          8. Children&apos;s Privacy
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          The Service is not directed to children under 13. We do not knowingly collect personal information
          from children under 13. If we become aware that we have collected personal data from a child
          under 13, we will take steps to delete that information immediately.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          9. Contact Us
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@threadline.app" style={{ color: "var(--accent)", textDecoration: "none" }}>
            privacy@threadline.app
          </a>.
        </p>
      </section>
    </article>
  );
}
