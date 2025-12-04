import PageWrapper from '@/app/components/PageWrapper'

export const metadata = {
  title: 'Terms of Service | BELA.AI',
  description: 'Terms of Service for BELA.AI - Instagram DM Management for 23 Nailroom Bali',
}

export default function TermsOfServicePage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-sm text-neutral-500">Last updated: December 4, 2025</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By interacting with 23 Nailroom Bali through Instagram Direct Messages, 
          you agree to these Terms of Service. If you do not agree with these terms, 
          please do not use our messaging service.
        </p>

        <h2>2. Service Description</h2>
        <p>
          BELA.AI provides an automated and human-assisted customer service system 
          for 23 Nailroom Bali. Our service allows you to:
        </p>
        <ul>
          <li>Inquire about our nail services and pricing</li>
          <li>Ask questions about availability and appointments</li>
          <li>Get information about our location and business hours</li>
          <li>Receive customer support</li>
        </ul>

        <h2>3. AI-Assisted Communication</h2>
        <p>
          Our service uses artificial intelligence to help respond to messages. 
          Please be aware that:
        </p>
        <ul>
          <li>Some responses may be generated or suggested by AI</li>
          <li>AI responses are reviewed and supervised by human staff</li>
          <li>You can request to speak with a human at any time</li>
          <li>AI-generated information should be verified for accuracy</li>
        </ul>

        <h2>4. User Conduct</h2>
        <p>When using our messaging service, you agree not to:</p>
        <ul>
          <li>Send abusive, harassing, or threatening messages</li>
          <li>Attempt to spam or flood our messaging system</li>
          <li>Impersonate others or provide false information</li>
          <li>Use our service for any illegal purposes</li>
          <li>Attempt to exploit or hack our systems</li>
        </ul>

        <h2>5. Appointments and Bookings</h2>
        <p>
          While you can inquire about appointments through our messaging service:
        </p>
        <ul>
          <li>Appointment confirmations are subject to availability</li>
          <li>We reserve the right to cancel or reschedule appointments</li>
          <li>Cancellation policies apply as communicated during booking</li>
          <li>Prices quoted are estimates and may vary</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          All content, branding, and technology used in BELA.AI and 23 Nailroom Bali 
          are protected by intellectual property laws. You may not copy, modify, or 
          distribute our content without permission.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          BELA.AI and 23 Nailroom Bali are not liable for:
        </p>
        <ul>
          <li>Errors or inaccuracies in AI-generated responses</li>
          <li>Service interruptions or technical issues</li>
          <li>Delays in response times</li>
          <li>Any indirect or consequential damages</li>
        </ul>

        <h2>8. Privacy</h2>
        <p>
          Your use of our service is also governed by our{' '}
          <a href="/privacy">Privacy Policy</a>. Please review it to understand 
          how we collect and use your information.
        </p>

        <h2>9. Modifications to Service</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue our messaging 
          service at any time without prior notice. We may also update these 
          Terms of Service periodically.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms of Service are governed by the laws of Indonesia. Any disputes 
          shall be resolved in the courts of Bali, Indonesia.
        </p>

        <h2>11. Contact Information</h2>
        <p>
          For questions about these Terms of Service, please contact us:
        </p>
        <ul>
          <li><strong>Instagram:</strong> @23nailroombali</li>
          <li><strong>Location:</strong> Ubud, Bali, Indonesia</li>
        </ul>

        <hr className="my-8" />
        <p className="text-sm text-neutral-500">
          By continuing to use our Instagram messaging service, you acknowledge 
          that you have read, understood, and agree to these Terms of Service.
        </p>
      </div>
    </PageWrapper>
  )
}
