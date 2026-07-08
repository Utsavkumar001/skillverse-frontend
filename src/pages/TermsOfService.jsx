import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 inline-block">
        ← Back to home
      </Link>

      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: June 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-600 leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using SkillVerse ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
          <p>SkillVerse is an AI agents marketplace where verified experts ("Creators") can publish AI-powered agents and users can discover, use, and purchase them. We act as a platform connecting Creators and Users.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">3. User Accounts</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You must be at least 13 years of age to use SkillVerse.</li>
            <li>One person may not maintain more than one account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Creator Terms</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Creators must apply and be approved before publishing agents.</li>
            <li>All agents are reviewed by SkillVerse before being published.</li>
            <li>Creators earn 80% of revenue from their agents. SkillVerse retains 20% as platform fee.</li>
            <li>Creators are responsible for the accuracy and quality of their agents.</li>
            <li>SkillVerse reserves the right to unpublish agents that violate our policies.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Payments & Refunds</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Payments are processed securely via Razorpay.</li>
            <li>All prices are in Indian Rupees (₹) and inclusive of applicable taxes.</li>
            <li>Refunds may be requested within 7 days of purchase if the agent is non-functional.</li>
            <li>Refund requests are evaluated on a case-by-case basis.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Prohibited Conduct</h2>
          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use the platform for illegal purposes.</li>
            <li>Attempt to reverse engineer or scrape the platform.</li>
            <li>Share your account credentials with others.</li>
            <li>Submit false or misleading information.</li>
            <li>Use AI agents to generate harmful, offensive, or misleading content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
          <p>Creators retain ownership of their agent content. By publishing on SkillVerse, Creators grant us a license to display and distribute their agents on the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Disclaimer</h2>
          <p>AI agents on SkillVerse are tools to assist users. They do not replace professional advice (medical, legal, financial). SkillVerse is not liable for decisions made based on agent outputs.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms. Users may delete their accounts at any time by contacting support.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:support@skillverse.ai" className="text-gray-900 underline">support@skillverse.ai</a></p>
        </section>

      </div>
    </div>
  );
}