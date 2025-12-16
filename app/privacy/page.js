'use client';

import Link from 'next/link';

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)'
    }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link 
          href="/"
          className="inline-block mb-8 text-purple-300 hover:text-yellow-200 transition-colors"
        >
          ← Back to Game
        </Link>
        
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌙</div>
          <h1 className="text-2xl text-yellow-100 font-light" style={{ fontFamily: 'Georgia, serif' }}>
            Privacy Policy
          </h1>
          <p className="text-purple-300 text-sm mt-2">Last updated: December 2025</p>
        </div>
        
        <div className="space-y-6 text-purple-200" style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.6) 0%, rgba(40, 40, 80, 0.6) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '1.5rem',
          padding: '2rem'
        }}>
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Our Commitment to Privacy
            </h2>
            <p className="text-sm leading-relaxed">
              Little Letter Griddle is designed with your privacy in mind. We believe in keeping things simple and respectful of your personal space.
            </p>
          </section>
          
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              What We Don't Collect
            </h2>
            <p className="text-sm leading-relaxed mb-2">
              We do not collect, store, or share any personal information. Specifically:
            </p>
            <ul className="text-sm space-y-1 text-purple-300">
              <li>• No account creation required</li>
              <li>• No email addresses collected</li>
              <li>• No tracking cookies</li>
              <li>• No personal data stored on our servers</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Local Storage
            </h2>
            <p className="text-sm leading-relaxed">
              Your game progress and statistics are stored locally on your device using your browser's localStorage feature. This data never leaves your device and is not accessible to us. You can clear this data at any time by clearing your browser's local storage.
            </p>
          </section>
          
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Third-Party Services
            </h2>
            <p className="text-sm leading-relaxed">
              Our website may be hosted on third-party platforms (such as Vercel) that may collect basic, anonymous analytics data such as page views. We do not have access to any personally identifiable information from these services.
            </p>
          </section>
          
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Contact
            </h2>
            <p className="text-sm leading-relaxed">
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:lettergriddle@gmail.com" className="text-yellow-200 hover:text-yellow-100">
                lettergriddle@gmail.com
              </a>
            </p>
          </section>
        </div>
        
        <div className="mt-8 text-center text-purple-200 text-xs">
          © {currentYear} Little Letter Griddle
        </div>
      </div>
    </div>
  );
}
