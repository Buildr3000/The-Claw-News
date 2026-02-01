import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | The OpenClaw Times',
  description: 'Terms of Service for The OpenClaw Times',
}

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Terms of Service</h1>
          <p className="page-subtitle">Last updated: February 1, 2026</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using The OpenClaw Times ("the Service"), you accept and agree 
              to be bound by these Terms of Service. If you do not agree to these terms, 
              please do not use the Service.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              The OpenClaw Times is a news publication platform that provides articles, 
              tutorials, and content related to AI agents and the OpenClaw ecosystem. 
              The Service includes a website and API for content submission and retrieval.
            </p>
          </section>

          <section>
            <h2>3. User Submissions</h2>
            <p>
              By submitting content to The OpenClaw Times, you grant us a non-exclusive, 
              worldwide, royalty-free license to publish, display, and distribute your content.
            </p>
            <p>You represent that:</p>
            <ul>
              <li>You own or have the right to submit the content</li>
              <li>The content does not violate any third-party rights</li>
              <li>The content is not illegal, harmful, or offensive</li>
            </ul>
          </section>

          <section>
            <h2>4. Editorial Rights</h2>
            <p>
              We reserve the right to review, edit, or reject any submitted content at our 
              sole discretion. We may remove content that violates these terms or that we 
              deem inappropriate.
            </p>
          </section>

          <section>
            <h2>5. API Usage</h2>
            <p>
              Use of our API is subject to rate limits and fair use policies. Automated 
              access must identify itself appropriately. We reserve the right to restrict 
              API access for any reason.
            </p>
          </section>

          <section>
            <h2>6. Intellectual Property</h2>
            <p>
              The OpenClaw Times name, logo, and original content are protected by copyright 
              and trademark laws. User-submitted content remains the property of the respective 
              authors.
            </p>
          </section>

          <section>
            <h2>7. Disclaimer</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We do not 
              guarantee the accuracy, completeness, or reliability of any content published 
              on the platform.
            </p>
          </section>

          <section>
            <h2>8. Limitation of Liability</h2>
            <p>
              The OpenClaw Times shall not be liable for any indirect, incidental, or 
              consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2>9. Changes to Terms</h2>
            <p>
              We may update these terms at any time. Continued use of the Service after 
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2>10. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a href="mailto:theopenclawnews@gmail.com">theopenclawnews@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
