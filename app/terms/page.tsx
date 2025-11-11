export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] to-[#1a1a2e] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold gradient-text mb-6">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
            <p className="mb-4">
              By accessing or using IdeaCapture ("Service," "App," "we," "our"), you agree to be bound by these Terms of Service
              ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use the Service, whether through our website,
              mobile application (iOS/Android), or Progressive Web App (PWA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Eligibility</h2>
            <p className="mb-4">You must meet the following requirements to use IdeaCapture:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Be at least 13 years old (or 16 in the European Union)</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Not be prohibited from using the Service under applicable laws</li>
              <li>Provide accurate and complete registration information</li>
            </ul>
            <p className="mt-4">
              If you are using the Service on behalf of an organization, you represent that you have the authority to bind
              that organization to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
            <p className="mb-4">To use IdeaCapture, you must create an account. You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms or provide false information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription Plans and Billing</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.1 Free Plan</h3>
            <p className="mb-4">The Free plan includes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Up to 10 ideas</li>
              <li>Basic voice recording (up to 2 minutes per recording)</li>
              <li>Limited AI refinement (3 questions)</li>
              <li>No AI validation</li>
              <li>Basic idea management</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.2 Pro Plan ($4.99/month or $49.99/year)</h3>
            <p className="mb-4">The Pro plan includes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Unlimited ideas</li>
              <li>Extended voice recording (up to 5 minutes per recording)</li>
              <li>Full AI refinement (5 targeted questions)</li>
              <li>AI validation with market analysis</li>
              <li>Mind map visualization</li>
              <li>Priority support</li>
              <li>Export to JSON/PDF (coming soon)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.3 Billing Terms</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>Payment is processed securely through Stripe</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You can cancel anytime from your Settings page</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>No refunds for partial months or unused features</li>
              <li>Price changes will be communicated 30 days in advance</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.4 Free Trial</h3>
            <p>
              New users may receive a 14-day free trial of the Pro plan. You will not be charged until the trial period ends.
              Cancel anytime during the trial to avoid charges.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use Policy</h2>
            <p className="mb-4">You agree NOT to use IdeaCapture to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Scrape, data mine, or extract data without permission</li>
              <li>Reverse engineer or attempt to access our source code</li>
              <li>Use the Service for spam or unsolicited communications</li>
              <li>Store illegal content or content that infringes intellectual property rights</li>
              <li>Bypass usage limits or access controls</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
            <p className="mt-4">
              Violation of this policy may result in immediate account suspension or termination without refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.1 Your Content</h3>
            <p className="mb-4">
              You retain all ownership rights to the ideas, voice recordings, and content you create using IdeaCapture
              ("Your Content"). By using the Service, you grant us a limited license to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Store and process Your Content to provide the Service</li>
              <li>Send Your Content to Anthropic's Claude API for AI analysis</li>
              <li>Create backups for disaster recovery purposes</li>
            </ul>
            <p className="mt-4">
              <strong>We do NOT:</strong> Claim ownership of Your Content, use it for marketing without permission, or share
              it with third parties except as required to provide the Service.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.2 Our Intellectual Property</h3>
            <p>
              The Service, including its design, code, features, and branding, is owned by IdeaCapture and protected by
              copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our
              intellectual property without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. AI-Powered Features</h2>
            <p className="mb-4">
              IdeaCapture uses Anthropic's Claude AI to provide refinement questions and validation analysis. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AI-generated content is provided "as is" without guarantees of accuracy</li>
              <li>Validation scores are estimates, not professional financial or business advice</li>
              <li>You should not rely solely on AI analysis for major business decisions</li>
              <li>AI models may occasionally produce unexpected or incorrect results</li>
              <li>Your idea content is sent to Anthropic's API (covered by their privacy policy)</li>
            </ul>
            <p className="mt-4">
              <strong>Disclaimer:</strong> IdeaCapture is a tool to organize and develop ideas. It does not replace professional
              consultation with lawyers, accountants, or business advisors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Privacy and Data Protection</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy, which describes how we collect, use, and protect
              your personal data. By using IdeaCapture, you consent to our Privacy Policy.
            </p>
            <p className="mt-4">
              Key points:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your ideas are private and protected by Row Level Security (RLS)</li>
              <li>We never sell your data or use it for advertising</li>
              <li>You can export or delete all your data at any time</li>
              <li>We comply with GDPR, CCPA, and other privacy regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Service Availability and Modifications</h2>
            <p className="mb-4">
              We strive to provide reliable service, but we cannot guarantee uninterrupted access. We reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify, suspend, or discontinue any feature at any time</li>
              <li>Perform scheduled maintenance (with advance notice when possible)</li>
              <li>Update these Terms with 30 days' notice for material changes</li>
              <li>Change subscription pricing with 30 days' notice to existing subscribers</li>
            </ul>
            <p className="mt-4">
              <strong>Uptime Target:</strong> We aim for 99.5% uptime, but are not liable for service interruptions due to
              maintenance, third-party failures, or circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">10.1 Termination by You</h3>
            <p className="mb-4">You may terminate your account at any time by:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Using the "Delete Account" option in Settings</li>
              <li>Contacting support@ideacapture.app</li>
            </ul>
            <p className="mt-4">
              Upon termination, your data will be deleted within 30 days (see Privacy Policy for details).
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">10.2 Termination by Us</h3>
            <p className="mb-4">We may suspend or terminate your account if:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You violate these Terms or our Acceptable Use Policy</li>
              <li>Your account is involved in fraudulent activity</li>
              <li>We are required to do so by law</li>
              <li>You fail to pay subscription fees</li>
            </ul>
            <p className="mt-4">
              We will provide notice when reasonably possible, but may terminate immediately for serious violations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Disclaimers and Limitations of Liability</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">11.1 No Warranties</h3>
            <p className="mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
              BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">11.2 Limitation of Liability</h3>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IDEACAPTURE SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages resulting from AI-generated content or analysis</li>
              <li>Third-party actions or content</li>
              <li>Service interruptions or data loss</li>
            </ul>
            <p className="mt-4">
              Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim,
              or $100, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless IdeaCapture, its officers, directors, employees, and agents from any
              claims, damages, losses, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your use or misuse of the Service</li>
              <li>Violation of these Terms</li>
              <li>Infringement of third-party rights</li>
              <li>Your Content uploaded to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">13.1 Informal Resolution</h3>
            <p className="mb-4">
              Before filing a claim, you agree to contact us at support@ideacapture.app to attempt an informal resolution.
              We will work in good faith to resolve disputes within 30 days.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">13.2 Arbitration</h3>
            <p className="mb-4">
              If informal resolution fails, disputes will be resolved through binding arbitration rather than in court, except:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Small claims court disputes (under $10,000)</li>
              <li>Intellectual property disputes</li>
              <li>Injunctive relief requests</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">13.3 Class Action Waiver</h3>
            <p>
              You agree to resolve disputes on an individual basis only. You waive the right to participate in class actions,
              class arbitrations, or representative proceedings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of California, United States, without regard to conflict of
              law principles. You consent to the exclusive jurisdiction of courts in San Francisco County, California for
              any disputes not subject to arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. General Provisions</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and IdeaCapture</li>
              <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in effect</li>
              <li><strong>No Waiver:</strong> Our failure to enforce any right does not waive that right</li>
              <li><strong>Assignment:</strong> You may not assign these Terms; we may assign to successors or affiliates</li>
              <li><strong>Force Majeure:</strong> We are not liable for delays or failures due to circumstances beyond our control</li>
              <li><strong>Export Compliance:</strong> You agree to comply with all export laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">16. App Store Additional Terms</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">16.1 Apple App Store</h3>
            <p className="mb-4">If you download IdeaCapture from the Apple App Store:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>These Terms are between you and IdeaCapture, not Apple</li>
              <li>Apple has no obligation to provide support or maintenance</li>
              <li>Apple is not responsible for addressing claims related to the App</li>
              <li>Apple is a third-party beneficiary of these Terms</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">16.2 Google Play Store</h3>
            <p className="mb-4">If you download IdeaCapture from Google Play:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You agree to Google Play's Terms of Service</li>
              <li>These Terms take precedence over Google's terms in case of conflict</li>
              <li>Google is not responsible for the App or its content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">17. Contact Information</h2>
            <p className="mb-4">For questions about these Terms, please contact us:</p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> legal@ideacapture.app</li>
              <li><strong>Support:</strong> support@ideacapture.app</li>
              <li><strong>Website:</strong> https://ideacapture.app</li>
              <li><strong>Address:</strong> [Your business address - required for some jurisdictions]</li>
            </ul>
          </section>

          <section className="mt-12 p-6 glass rounded-2xl">
            <h3 className="text-xl font-semibold mb-4">Summary (Not Legally Binding)</h3>
            <p className="mb-4">This is a quick summary for your convenience. The full Terms above are legally binding.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>You must be 13+ to use IdeaCapture (16+ in EU)</li>
              <li>Free plan: 10 ideas. Pro plan ($4.99/mo): unlimited ideas and AI features</li>
              <li>You own your ideas. We use them only to provide the Service</li>
              <li>AI analysis is helpful but not professional advice</li>
              <li>Don't use the Service for illegal or harmful activities</li>
              <li>We can modify the Service with reasonable notice</li>
              <li>You can delete your account anytime</li>
              <li>Contact us with any questions</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} IdeaCapture. All rights reserved.</p>
          <p className="mt-2">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            {' • '}
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
