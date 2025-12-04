import PageWrapper from '@/app/components/PageWrapper'

export const metadata = {
  title: 'Privacy Policy | BELA.AI',
  description:
    'Privacy Policy for BELA.AI - Instagram DM Management for 23 Nailroom Bali',
}

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-neutral-500">
          Last updated: December 4, 2025
        </p>

        <h2>1. Introduction</h2>
        <p>
          BELA.AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates
          a customer service management platform for 23 Nailroom Bali. This
          Privacy Policy explains how we collect, use, and protect information
          when you interact with us through Instagram Direct Messages.
        </p>

        <h2>2. Information We Collect</h2>
        <p>When you send us a message on Instagram, we may collect:</p>
        <ul>
          <li>
            <strong>Instagram User ID:</strong> Your unique Instagram identifier
          </li>
          <li>
            <strong>Message Content:</strong> The text of messages you send us
          </li>
          <li>
            <strong>Timestamp:</strong> When messages were sent and received
          </li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul>
          <li>Respond to your inquiries about our nail services</li>
          <li>Schedule and manage appointments</li>
          <li>Provide customer support</li>
          <li>Improve our services and response quality</li>
        </ul>

        <h2>4. AI-Assisted Responses</h2>
        <p>
          We use AI technology (Google Gemini) to help generate responses to
          common questions. Your messages may be processed by this AI system to
          provide faster and more accurate responses. A human team member
          reviews and can intervene in all conversations.
        </p>

        <h2>5. Data Storage and Security</h2>
        <p>
          Your data is stored securely using Supabase, a trusted database
          provider. We implement appropriate security measures to protect your
          information from unauthorized access, alteration, or disclosure.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          We retain message data for as long as necessary to provide our
          services and comply with legal obligations. You can request deletion
          of your data at any time.
        </p>

        <h2>7. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li>
            <strong>Meta/Instagram:</strong> For receiving and sending messages
          </li>
          <li>
            <strong>Google AI (Gemini):</strong> For generating response
            suggestions
          </li>
          <li>
            <strong>Supabase:</strong> For secure data storage
          </li>
          <li>
            <strong>Vercel:</strong> For hosting our application
          </li>
        </ul>

        <h2>8. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent for data processing</li>
        </ul>

        <h2>9. Data Deletion</h2>
        <p>
          To request deletion of your data, please send a message to
          @23nailroombali on Instagram with the subject &quot;Data Deletion
          Request&quot; or contact us at the email address below.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or our data practices,
          please contact us:
        </p>
        <ul>
          <li>
            <strong>Instagram:</strong> @23nailroombali
          </li>
          <li>
            <strong>Location:</strong> Canggu, Bali, Indonesia
          </li>
        </ul>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last updated&quot; date.
        </p>

        <hr className="my-8" />
        <p className="text-sm text-neutral-500">
          This privacy policy is provided for BELA.AI, a customer service
          management tool for 23 Nailroom Bali.
        </p>
      </div>
    </PageWrapper>
  )
}
