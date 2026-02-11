import React, { ReactNode } from 'react';
import { AlertTriangle, Database, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DataLoadingWrapperProps {
  loading?: boolean;
  error?: string | null;
  hasData?: boolean;
  dataType?: string;
  children: ReactNode;
  showSeedButton?: boolean;
  minItems?: number;
}

/**
 * Wrapper component that handles loading states, errors, and empty data scenarios
 * Provides helpful messages and links to seed data page when database is empty
 */
export default function DataLoadingWrapper({
  loading = false,
  error = null,
  hasData = true,
  dataType = 'data',
  children,
  showSeedButton = true,
  minItems = 0
}: DataLoadingWrapperProps) {
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading {dataType}...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            {showSeedButton && (
              <Link
                to="/seed-data"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Database className="w-4 h-4" />
                Seed Database
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!hasData) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
        <div className="flex items-start">
          <Database className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-blue-800 font-semibold mb-2">No Data Available</h3>
            <p className="text-blue-700 text-sm mb-4">
              The database appears to be empty. You need to seed the database with sample data to view this dashboard.
            </p>
            <div className="space-y-3">
              {showSeedButton && (
                <Link
                  to="/seed-data"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Database className="w-4 h-4" />
                  Seed Database Now
                </Link>
              )}
              <div className="text-sm text-blue-600 mt-2">
                <p className="font-medium mb-1">After seeding:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Sample {dataType} will be created</li>
                  <li>Refresh this page to view the dashboard</li>
                  <li>Explore all features with demo data</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show actual content when data is available
  return <>{children}</>;
}
