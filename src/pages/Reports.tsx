import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, Loader2 } from 'lucide-react';
import { TIME_RANGES, EXPORT_FORMATS } from '../utils/constants';
import {
  reportService,
  type ReportFilters as ServiceReportFilters,
  type SentimentReportData,
  type TrendReportData,
  type CompetitiveReportData,
  type RegionalReportData
} from '../services/reportService';
import { exportReport, downloadBlob } from '../lib/reportExport';

interface ReportFilters {
  timeRange: string;
  issues: string[];
  regions: string[];
  format: 'pdf' | 'excel' | 'csv';
}

type ReportPreviewData = SentimentReportData | TrendReportData | CompetitiveReportData | RegionalReportData | null;

export default function Reports() {
  const [filters, setFilters] = useState<ReportFilters>({
    timeRange: '30d',
    issues: [],
    regions: [],
    format: 'pdf'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [activeReport, setActiveReport] = useState('sentiment');
  const [previewData, setPreviewData] = useState<ReportPreviewData>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch preview data when report type or filters change
  useEffect(() => {
    const fetchPreviewData = async () => {
      setIsLoadingPreview(true);
      setError(null);

      const serviceFilters: ServiceReportFilters = {
        timeRange: filters.timeRange,
        issues: filters.issues,
        regions: filters.regions
      };

      try {
        let data: ReportPreviewData = null;

        switch (activeReport) {
          case 'sentiment':
            data = await reportService.getSentimentReportData(serviceFilters);
            break;
          case 'trends':
            data = await reportService.getTrendReportData(serviceFilters);
            break;
          case 'competitor':
            data = await reportService.getCompetitiveReportData(serviceFilters);
            break;
          case 'regional':
            data = await reportService.getRegionalReportData(serviceFilters);
            break;
        }

        setPreviewData(data);
      } catch (err) {
        console.error('[Reports] Error fetching preview data:', err);
        setError('Failed to load report preview');
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchPreviewData();
  }, [activeReport, filters.timeRange, filters.issues, filters.regions]);

  const reportTypes = [
    {
      id: 'sentiment',
      title: 'Sentiment Analysis Report',
      description: 'Comprehensive analysis of public sentiment across all issues',
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'trends',
      title: 'Trend Analysis Report', 
      description: 'Historical trends and patterns in sentiment over time',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 'competitor',
      title: 'Competitive Analysis Report',
      description: 'Comparison with competitors across key issues',
      icon: PieChart,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'regional',
      title: 'Regional Analysis Report',
      description: 'Geographic breakdown of sentiment by region',
      icon: FileText,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  const handleGenerateReport = async () => {
    if (!previewData) {
      setError('No report data available. Please wait for preview to load.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate report using the export service
      const blob = await exportReport(activeReport, previewData, filters.format);

      // Determine file extension
      const extensions: Record<string, string> = {
        pdf: 'pdf',
        excel: 'xlsx',
        csv: 'csv'
      };
      const ext = extensions[filters.format] || filters.format;

      // Create filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${activeReport}-report-${timestamp}.${ext}`;

      // Download the file
      downloadBlob(blob, filename);

      console.log(`[Reports] Successfully generated ${filename}`);
    } catch (err) {
      console.error('[Reports] Failed to generate report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFilter = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate detailed reports and export data</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Types</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                    activeReport === report.id
                      ? report.color + ' border-2'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <report.icon className={`w-6 h-6 mr-3 mt-1 ${
                      activeReport === report.id ? '' : 'text-gray-400'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Report Preview</h4>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-[200px]">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">Loading preview...</span>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-600 py-8">{error}</div>
                ) : (
                  <>
                    {activeReport === 'sentiment' && previewData && 'summary' in previewData && previewData.reportType === 'sentiment' && (
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Sentiment Analysis Summary</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-blue-600">
                              {previewData.summary.overallSentiment}%
                            </div>
                            <div className="text-sm text-gray-600">Overall Sentiment</div>
                          </div>
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-gray-900">
                              {previewData.summary.totalIssues}
                            </div>
                            <div className="text-sm text-gray-600">Issues Analyzed</div>
                          </div>
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-600">
                              {previewData.summary.positiveCount}
                            </div>
                            <div className="text-sm text-gray-600">Positive Issues</div>
                          </div>
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-red-600">
                              {previewData.summary.negativeCount}
                            </div>
                            <div className="text-sm text-gray-600">Negative Issues</div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm">
                          <span className="text-green-600">Top Positive: {previewData.summary.topPositiveIssue}</span>
                          <span className="mx-3">|</span>
                          <span className="text-red-600">Top Negative: {previewData.summary.topNegativeIssue}</span>
                        </div>
                      </div>
                    )}

                    {activeReport === 'trends' && previewData && 'summary' in previewData && previewData.reportType === 'trends' && (
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Trend Analysis Summary</h5>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className={`text-xl font-bold ${
                              previewData.summary.overallTrend === 'improving' ? 'text-green-600' :
                              previewData.summary.overallTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {previewData.summary.overallTrend === 'improving' ? '↑ Improving' :
                               previewData.summary.overallTrend === 'declining' ? '↓ Declining' : '→ Stable'}
                            </div>
                            <div className="text-sm text-gray-600">Overall Trend</div>
                          </div>
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-gray-900">
                              {previewData.summary.dataPoints}
                            </div>
                            <div className="text-sm text-gray-600">Data Points</div>
                          </div>
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className={`text-xl font-bold ${previewData.summary.avgChange > 0 ? 'text-green-600' : previewData.summary.avgChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              {previewData.summary.avgChange > 0 ? '+' : ''}{previewData.summary.avgChange}%
                            </div>
                            <div className="text-sm text-gray-600">Avg Change</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Time Period: {previewData.summary.timeRangeLabel}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm mt-2">
                          {previewData.weekOverWeek.map((item, idx) => (
                            <span key={idx} className={
                              item.trend === 'up' ? 'text-green-600' :
                              item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }>
                              {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} {item.issue}: {item.change > 0 ? '+' : ''}{item.change}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeReport === 'competitor' && previewData && 'summary' in previewData && previewData.reportType === 'competitor' && (
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Competitive Analysis Summary</h5>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-gray-900">
                              {previewData.summary.totalCompetitors}
                            </div>
                            <div className="text-sm text-gray-600">Competitors Analyzed</div>
                          </div>
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-blue-600">
                              #{previewData.summary.bjpRank}
                            </div>
                            <div className="text-sm text-gray-600">BJP Rank</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Leading In:</span>
                            <div className="text-green-600">{previewData.summary.leadingIn.join(', ') || 'None'}</div>
                          </div>
                          <div>
                            <span className="font-medium">Trailing In:</span>
                            <div className="text-orange-600">{previewData.summary.trailingIn.join(', ') || 'None'}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeReport === 'regional' && previewData && 'summary' in previewData && previewData.reportType === 'regional' && (
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Regional Analysis Summary</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-gray-900">
                              {previewData.summary.totalConstituencies}
                            </div>
                            <div className="text-sm text-gray-600">Constituencies</div>
                          </div>
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-blue-600">
                              {previewData.summary.avgSentiment}%
                            </div>
                            <div className="text-sm text-gray-600">Avg Sentiment</div>
                          </div>
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-purple-600">
                              {previewData.summary.urbanCount}
                            </div>
                            <div className="text-sm text-gray-600">Urban</div>
                          </div>
                          <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-green-600">
                              {previewData.summary.ruralCount}
                            </div>
                            <div className="text-sm text-gray-600">Rural</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-green-600">Top: {previewData.summary.topPerforming}</span>
                          <span className="mx-3">|</span>
                          <span className="text-red-600">Needs Attention: {previewData.summary.needsAttention}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Urban Avg: {previewData.urbanVsRural.urban.avgSentiment}% | Rural Avg: {previewData.urbanVsRural.rural.avgSentiment}%
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Time Range
                </label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => updateFilter('timeRange', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(TIME_RANGES).map(([key, range]) => (
                    <option key={key} value={key}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="space-y-2">
                  {EXPORT_FORMATS.map(format => (
                    <label key={format} className="flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={filters.format === format}
                        onChange={(e) => updateFilter('format', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issues
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Jobs', 'Infrastructure', 'Health', 'Education', 'Law & Order'].map(issue => (
                    <label key={issue} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.issues.includes(issue)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('issues', [...filters.issues, issue]);
                          } else {
                            updateFilter('issues', filters.issues.filter(i => i !== issue));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{issue}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regions
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'].map(region => (
                    <label key={region} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.regions.includes(region)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('regions', [...filters.regions, region]);
                          } else {
                            updateFilter('regions', filters.regions.filter(r => r !== region));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{region}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Reports</h4>
            <div className="space-y-3">
              {[
                { name: 'Monthly Sentiment Report', date: '2024-08-01', size: '2.3 MB' },
                { name: 'Q2 Trend Analysis', date: '2024-07-15', size: '1.8 MB' },
                { name: 'Regional Breakdown', date: '2024-07-10', size: '3.1 MB' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{report.name}</div>
                    <div className="text-xs text-gray-500">{report.date} • {report.size}</div>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}