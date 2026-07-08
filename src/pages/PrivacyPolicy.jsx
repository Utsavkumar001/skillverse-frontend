import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 inline-block">
        ← Back to home
      </Link>

      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: June 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-600 leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="mb-2">We collect the following information when you use SkillVerse:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account information:</strong> Name, email address, and password.</li>
            <li><strong>Profile information:</strong> Bio, expertise, LinkedIn, and portfolio links (for Creators).</li>
            <li><strong>Usage data:</strong> Chat history with AI agents, agent interactions.</li>
            <li><strong>Payment information:</strong> Transaction records (processed by Razorpay — we do not store card details).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide and improve the SkillVerse platform.</li>
            <li>To process payments and manage your account.</li>
            <li>To send you important updates and notifications.</li>
            <li>To verify Creator identities and review agent submissions.</li>
            <li>To prevent fraud and ensure platform security.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data Sharing</h2>
          <p className="mb-2">We do not sell your personal data. We may share data with:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Razorpay:</strong> For payment processing.</li>
            <li><strong>Groq:</strong> AI responses are processed via Groq API. Chat messages are sent to Groq for generating responses.</li>
            <li><strong>Legal authorities:</strong> If required by law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Data Storage</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your data is stored on secure servers (MongoDB Atlas).</li>
            <li>Chat history is stored to enable conversation continuity.</li>
            <li>Passwords are encrypted using bcrypt.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Your Rights</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You can request deletion of your account and data.</li>
            <li>You can update your profile information at any time.</li>
            <li>You can opt out of non-essential communications.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Cookies</h2>
          <p>SkillVerse uses localStorage for authentication tokens. We do not use tracking cookies or third-party advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Children's Privacy</h2>
          <p>SkillVerse is not intended for users under 13 years of age. We do not knowingly collect data from children.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
          <p>We may update this policy. We will notify users of significant changes via email or platform notification.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Contact</h2>
          <p>For privacy concerns, contact us at <a href="mailto:privacy@skillverse.ai" className="text-gray-900 underline">privacy@skillverse.ai</a></p>
        </section>

      </div>
    </div>
  );
}