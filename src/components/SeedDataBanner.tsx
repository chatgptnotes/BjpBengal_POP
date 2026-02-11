import React from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SeedDataBannerProps {
  message?: string;
  className?: string;
}

/**
 * Reusable banner component that prompts users to seed the database
 * Shows when data is missing or empty
 */
export default function SeedDataBanner({
  message = 'No data found in database. Seed the database to view demo data.',
  className = ''
}: SeedDataBannerProps) {
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
          <Database className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Database Setup Required</h3>
          <p className="text-blue-800 text-sm mb-4">{message}</p>
          <div className="flex items-center gap-3">
            <Link
              to="/seed-data"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
            >
              <Database className="w-4 h-4" />
              Seed Database Now
            </Link>
            <a
              href="/seed-data"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              Open in New Tab
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-4 text-xs text-blue-600 bg-blue-100 rounded-lg p-3">
            <strong>Quick Start:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Click "Seed Database Now" above</li>
              <li>Wait for the seeding process to complete</li>
              <li>Return to this page and refresh</li>
              <li>Explore all features with demo data!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SeedDataInlineProps {
  text?: string;
}

/**
 * Inline seed data link for compact spaces
 */
export function SeedDataInline({ text = 'Seed Database' }: SeedDataInlineProps) {
  return (
    <Link
      to="/seed-data"
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm underline"
    >
      <Database className="w-4 h-4" />
      {text}
    </Link>
  );
}
