'use client';

import Link from 'next/link';

export default function TermsOfService() {
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
            Terms of Service
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
              Welcome
            </h2>
            <p className="text-sm leading-relaxed">
              By using Little Letter Griddle, you agree to these simple terms. We've kept them short and friendly because that's our style.
            </p>
          </section>
          
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              The Game
            </h2>
            <p className="text-sm leading-relaxed">
              Little Letter Griddle is a free word puzzle game. A new puzzle is released daily at 7:30 PM EST. The game is provided "as is" for your enjoyment.
            </p>
          </section>
          
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Your Use
            </h2>
            <p className="text-sm leading-relaxed mb-2">
              You're welcome to:
            </p>
            <ul className="text-sm space-y-1 text-purple-300 mb-3">
              <li>• Play the game as much as you like</li>
              <li>• Share your results with friends</li>
              <li>• Tell others about the game</li>
            </ul>
            <p className="text-sm leading-relaxed">
              Please don't:
            </p>
            <ul className="text-sm space-y-1 text-purple-300">
              <li>• Copy or redistribute the game</li>
              <li>• Use automated systems to play</li>
              <li>• Attempt to access our systems inappropriately</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Intellectual Property
            </h2>
            <p className="text-sm leading-relaxed">
              Little Letter Griddle, including its design, puzzles, and content, is the property of its creators. All rights reserved.
            </p>
          </section>
          
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Changes
            </h2>
            <p className="text-sm leading-relaxed">
              We may update the game or these terms from time to time. Continued use of the game means you accept any changes.
            </p>
          </section>
          
          <section>
            <h2 className="text-yellow-100 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Contact
            </h2>
            <p className="text-sm leading-relaxed">
              Questions? Reach out at{' '}
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
