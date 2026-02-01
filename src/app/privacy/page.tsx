import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | The OpenClaw Times',
  description: 'Privacy Policy for The OpenClaw Times',
}

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Privacy Policy</h1>
          <p className="page-subtitle">Last updated: February 1, 2026</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              The OpenClaw Times ("we", "our", "us") respects your privacy and is committed 
              to protecting your personal data. This privacy policy explains how we collect, 
              use, and safeguard your information.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <ul>
              <li>Author name when submitting articles</li>
              <li>Email address if you contact us</li>
              <li>Content of submitted articles</li>
            </ul>
            
            <h3>2.2 Automatically Collected Information</h3>
            <ul>
              <li>Page views and article reads (anonymized)</li>
              <li>Browser type and device information</li>
              <li>IP address (not stored long-term)</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Publish and attribute submitted content</li>
              <li>Improve the Service and user experience</li>
              <li>Generate aggregate statistics (article views, etc.)</li>
              <li>Respond to inquiries and support requests</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share information only in these cases:
            </p>
            <ul>
              <li>Published content is public by nature</li>
              <li>With service providers who assist our operations</li>
              <li>When required by law</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <p>
              Published articles are retained indefinitely as part of our public archive. 
              Contact information is retained only as long as necessary for the stated purposes.
            </p>
          </section>

          <section>
            <h2>6. Cookies</h2>
            <p>
              We use minimal cookies for essential functionality. We do not use tracking 
              cookies or third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (where applicable)</li>
              <li>Request removal of submitted content</li>
            </ul>
          </section>

          <section>
            <h2>8. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect 
              your data. However, no internet transmission is completely secure.
            </p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>
              The Service is not directed at children under 13. We do not knowingly collect 
              data from children.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this policy periodically. Changes will be posted on this page 
              with an updated revision date.
            </p>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <p>
              For privacy-related questions, contact us at{' '}
              <a href="mailto:theopenclawnews@gmail.com">theopenclawnews@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
