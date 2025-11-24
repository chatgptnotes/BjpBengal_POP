import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Groups,
  School,
  HealthAndSafety,
  Agriculture,
  Work,
  AccountBalance,
  Campaign,
  LocationCity,
  VolunteerActivism,
  EmojiEvents,
  AutoAwesome,
  Login as LoginIcon
} from '@mui/icons-material';
import { BJPLogo } from '../components/BJPLogo';

const BJPLandingPage = () => {
  // Load ElevenLabs ConvAI widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-1.5">
            {/* Logo and Name */}
            <div className="flex items-center gap-2">
              <BJPLogo size={40} />
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">
                  <span className="text-orange-600">Bharatiya Janata Party</span>
                </h1>
                <p className="text-[10px] text-gray-600 leading-tight">West Bengal</p>
              </div>
            </div>

            {/* Login/Signup Buttons */}
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:text-orange-600 font-semibold transition-colors"
              >
                <LoginIcon className="w-4 h-4" />
                Login
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:from-orange-700 hover:to-orange-800 transition-all shadow-md"
              >
                <VolunteerActivism className="w-4 h-4" />
                <span className="hidden sm:inline">Join Movement</span>
                <span className="sm:hidden">Join</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-green-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
          <Campaign className="w-4 h-4" />
          <span className="font-semibold">West Bengal Elections 2026</span>
          <span className="hidden sm:inline">- Nation First, People Always</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-white/10 to-green-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-green-600 blur-lg opacity-50"></div>
                <div className="relative bg-white p-4 rounded-full shadow-2xl">
                  <EmojiEvents className="w-16 h-16 text-orange-600" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-orange-600">Bharatiya Janata Party</span>
            </h1>
            <p className="text-2xl text-gray-700 mb-4 font-semibold">
              West Bengal
            </p>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Building a Developed West Bengal with Good Governance, Development, and Prosperity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <VolunteerActivism />
                Join BJP Movement
              </Link>
              <a
                href="#vision"
                className="bg-white text-orange-600 border-2 border-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                <AutoAwesome />
                Our Vision 2026
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">23</div>
              <div className="text-gray-600">Districts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">294</div>
              <div className="text-gray-600">Constituencies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">150K+</div>
              <div className="text-gray-600">Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">2026</div>
              <div className="text-gray-600">Victory Target</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-xl text-white/90 max-w-4xl mx-auto">
            "Sabka Saath, Sabka Vikas, Sabka Vishwas, Sabka Prayas"
          </p>
          <p className="text-lg text-white/80 mt-4 max-w-3xl mx-auto">
            To create a prosperous, developed West Bengal through good governance,
            economic development, and inclusive growth for all citizens.
          </p>
        </div>
      </section>

      {/* Key Focus Areas */}
      <section className="py-20 bg-gray-50" id="vision">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Key Focus Areas
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            Transforming West Bengal through targeted development
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-orange-600">
              <School className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Education Excellence</h3>
              <p className="text-gray-600">
                Quality education for all, skill development centers, digital literacy,
                and competitive exam preparation support.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-green-600">
              <Groups className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Youth Empowerment</h3>
              <p className="text-gray-600">
                Creating job opportunities, entrepreneurship support, startup ecosystem,
                and youth participation in governance.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-orange-600">
              <HealthAndSafety className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Healthcare for All</h3>
              <p className="text-gray-600">
                Ayushman Bharat coverage, upgraded health centers, free medicines,
                and health insurance for every family.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-green-600">
              <Agriculture className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Farmer Welfare</h3>
              <p className="text-gray-600">
                PM-KISAN support, fair MSP, agricultural modernization, and
                direct benefit transfer to farmers.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-orange-600">
              <Work className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Industrial Growth</h3>
              <p className="text-gray-600">
                Attracting investments, MSME support, industrial corridors,
                and employment generation.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-green-600">
              <AccountBalance className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Good Governance</h3>
              <p className="text-gray-600">
                Transparent administration, corruption-free governance, digital services,
                and citizen-centric approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Digital Campaign Platform
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            Advanced tools for modern political campaigning
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Constituency Analytics
                </h3>
                <p className="text-gray-600">
                  Real-time voter sentiment tracking, booth-level analysis, and data-driven
                  campaign strategies for all 294 constituencies.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Groups className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Volunteer Management
                </h3>
                <p className="text-gray-600">
                  Organize and coordinate with thousands of volunteers across West Bengal
                  with our mobile-first platform.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <LocationCity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Geographic Mapping
                </h3>
                <p className="text-gray-600">
                  Interactive maps showing district, constituency, and booth-level data
                  with voter demographics and political trends.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Campaign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Campaign Planning
                </h3>
                <p className="text-gray-600">
                  Plan rallies, door-to-door campaigns, and events with AI-powered
                  scheduling and resource allocation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Be Part of West Bengal's Transformation
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of volunteers and campaign workers using our platform
            to connect with voters and build a stronger West Bengal.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            <VolunteerActivism />
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BJPLogo size={32} />
                <span className="font-bold text-lg">BJP West Bengal</span>
              </div>
              <p className="text-gray-400 text-sm">
                Building a prosperous West Bengal through good governance and inclusive development.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#vision" className="hover:text-white transition-colors">Our Vision</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">About BJP</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a href="https://twitter.com/BJP4Bengal" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="https://facebook.com/BJPWestBengal" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="https://instagram.com/bjp4bengal" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Bharatiya Janata Party - West Bengal. All rights reserved.</p>
            <p className="mt-2">Pulse of People Campaign Management Platform v1.0.0</p>
          </div>
        </div>
      </footer>

      {/* ElevenLabs ConvAI Widget */}
      <elevenlabs-convai agent-id="agent_2501k9rprn1de53rm33gjv0hx84e"></elevenlabs-convai>
    </div>
  );
};

export default BJPLandingPage;
