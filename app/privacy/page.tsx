export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] to-[#1a1a2e] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold gradient-text mb-6">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to IdeaCapture ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we handle your personal data when you use our mobile application and website,
              and tell you about your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Data We Collect</h2>
            <p className="mb-4">We collect and process the following types of data:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address, password (encrypted), account creation date</li>
              <li><strong>Idea Content:</strong> Voice recordings, transcriptions, titles, descriptions, categories, and refinement data you create</li>
              <li><strong>AI Interactions:</strong> Questions generated, answers provided, validation results</li>
              <li><strong>Usage Data:</strong> Features used, timestamps, app interactions</li>
              <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Data</h2>
            <p className="mb-4">We use your personal data for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Provide Service:</strong> To deliver IdeaCapture's core functionality including voice recording, AI refinement, and idea management</li>
              <li><strong>AI Processing:</strong> Your idea content is sent to Anthropic's Claude API for refinement and validation analysis</li>
              <li><strong>Account Management:</strong> To create, maintain, and secure your account</li>
              <li><strong>Communication:</strong> To send service updates, security alerts, and support messages</li>
              <li><strong>Improvement:</strong> To analyze usage patterns and improve our service (anonymized data only)</li>
              <li><strong>Billing:</strong> To process subscription payments (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Third Parties</h2>
            <p className="mb-4">We share your data with the following third parties:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Supabase:</strong> Database and authentication provider (data hosting)</li>
              <li><strong>Anthropic:</strong> AI analysis provider (Claude API) - receives idea content for processing</li>
              <li><strong>Stripe:</strong> Payment processor (if you subscribe to paid plans) - receives billing information only</li>
              <li><strong>Vercel/Hosting Provider:</strong> Application hosting and delivery</li>
            </ul>
            <p className="mt-4">
              <strong>We do NOT:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sell your personal data to third parties</li>
              <li>Use your data for advertising</li>
              <li>Share your ideas with other users</li>
              <li>Train AI models on your private data without explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
            <p className="mb-4">We implement industry-standard security measures:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Encryption:</strong> All data transmitted via HTTPS/TLS encryption</li>
              <li><strong>Database Security:</strong> Row Level Security (RLS) ensures users can only access their own data</li>
              <li><strong>Password Protection:</strong> Passwords are hashed using bcrypt (never stored in plain text)</li>
              <li><strong>Access Control:</strong> Strict authentication requirements for all API endpoints</li>
              <li><strong>Regular Updates:</strong> Security patches applied promptly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
            <p className="mb-4">
              We retain your personal data for as long as your account is active. When you delete your account:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All your ideas, recordings, and refinement data are permanently deleted within 30 days</li>
              <li>Your email and account information are removed from our active database</li>
              <li>Backups containing your data are purged within 90 days</li>
              <li>Some anonymized usage statistics may be retained for analytics purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights (GDPR & CCPA)</h2>
            <p className="mb-4">You have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Right to Access:</strong> Request a copy of all data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Correct any inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Delete your account and all associated data</li>
              <li><strong>Right to Data Portability:</strong> Export your data in JSON format</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Object:</strong> Opt out of certain data processing activities</li>
              <li><strong>Right to Withdraw Consent:</strong> Revoke permissions at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, visit your Settings page or contact us at privacy@ideacapture.app
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p>
              IdeaCapture is not intended for users under the age of 13 (or 16 in the EU). We do not knowingly collect
              personal data from children. If you believe a child has provided us with personal data, please contact us
              immediately and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies and Tracking</h2>
            <p className="mb-4">We use the following cookies:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and security (cannot be disabled)</li>
              <li><strong>Session Cookies:</strong> Maintain your login state</li>
              <li><strong>Preference Cookies:</strong> Remember your settings (dark mode, default view, etc.)</li>
            </ul>
            <p className="mt-4">
              <strong>We do NOT use:</strong> Analytics cookies, advertising cookies, or third-party tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside your jurisdiction. We ensure adequate
              safeguards are in place through:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Standard Contractual Clauses with our service providers</li>
              <li>Compliance with GDPR for EU users</li>
              <li>Compliance with CCPA for California users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Posting the new policy on this page with an updated "Last updated" date</li>
              <li>Sending an email notification (if you've opted in to communications)</li>
              <li>Displaying an in-app notification on your next login</li>
            </ul>
            <p className="mt-4">
              Your continued use of IdeaCapture after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> privacy@ideacapture.app</li>
              <li><strong>Support:</strong> support@ideacapture.app</li>
              <li><strong>Website:</strong> https://ideacapture.app</li>
            </ul>
            <p className="mt-4">
              <strong>For EU users:</strong> Our Data Protection Officer can be reached at dpo@ideacapture.app
            </p>
          </section>

          <section className="mt-12 p-6 glass rounded-2xl">
            <h3 className="text-xl font-semibold mb-4">Summary of Key Points</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>We collect only data necessary to provide IdeaCapture's services</li>
              <li>Your ideas are private and protected by Row Level Security</li>
              <li>We use Anthropic's Claude AI to analyze your ideas (sent securely via API)</li>
              <li>We never sell your data or use it for advertising</li>
              <li>You can export or delete all your data at any time</li>
              <li>We comply with GDPR, CCPA, and other privacy regulations</li>
              <li>Contact us anytime with privacy concerns</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} IdeaCapture. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
