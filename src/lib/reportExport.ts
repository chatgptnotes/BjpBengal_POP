/**
 * Report Export Utility
 * Generates professional PDF and Excel reports using jsPDF and xlsx
 */

import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import type {
  SentimentReportData,
  TrendReportData,
  CompetitiveReportData,
  RegionalReportData
} from '@/services/reportService';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

type ReportData = SentimentReportData | TrendReportData | CompetitiveReportData | RegionalReportData;

interface ReportConfig {
  title: string;
  subtitle?: string;
  logoUrl?: string;
}

// =====================================================
// BRANDING CONSTANTS
// =====================================================

const COLORS = {
  primary: '#FF9933', // BJP Saffron
  secondary: '#138808', // BJP Green
  accent: '#000080', // BJP Blue
  text: '#333333',
  lightText: '#666666',
  border: '#E0E0E0',
  headerBg: '#FF9933',
  headerText: '#FFFFFF',
  positive: '#22C55E',
  negative: '#EF4444',
  neutral: '#6B7280'
};

const REPORT_TITLES: Record<string, string> = {
  sentiment: 'Sentiment Analysis Report',
  trends: 'Trend Analysis Report',
  competitor: 'Competitive Analysis Report',
  regional: 'Regional Analysis Report'
};

// =====================================================
// PDF EXPORT - SENTIMENT REPORT
// =====================================================

async function generateSentimentPDF(data: SentimentReportData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Header
  doc.setFillColor(255, 153, 51); // BJP Saffron
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Sentiment Analysis Report', margin, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('BJP West Bengal - Political Intelligence', margin, 30);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, pageWidth - margin - 60, 30);

  yPos = 50;

  // Summary Section
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPos);
  yPos += 10;

  // Summary Cards (simulated)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const summaryItems = [
    { label: 'Overall Sentiment', value: `${data.summary.overallSentiment}%`, color: data.summary.overallSentiment >= 60 ? COLORS.positive : data.summary.overallSentiment >= 40 ? COLORS.neutral : COLORS.negative },
    { label: 'Total Issues Analyzed', value: data.summary.totalIssues.toString() },
    { label: 'Positive Issues', value: data.summary.positiveCount.toString(), color: COLORS.positive },
    { label: 'Negative Issues', value: data.summary.negativeCount.toString(), color: COLORS.negative },
    { label: 'Neutral Issues', value: data.summary.neutralCount.toString(), color: COLORS.neutral },
    { label: 'Top Positive Issue', value: data.summary.topPositiveIssue },
    { label: 'Top Negative Issue', value: data.summary.topNegativeIssue }
  ];

  summaryItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * 90;
    const y = yPos + row * 12;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text(`${item.label}:`, x, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text(item.value, x + 60, y);
  });

  yPos += 50;

  // Issue Breakdown Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('Issue-wise Sentiment Breakdown', margin, yPos);
  yPos += 8;

  // Table Headers
  const tableHeaders = ['Issue', 'Category', 'Score', 'Sentiment', 'Trend', 'Change'];
  const colWidths = [45, 35, 25, 30, 25, 20];

  doc.setFillColor(255, 153, 51);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  let xPos = margin + 2;
  tableHeaders.forEach((header, i) => {
    doc.text(header, xPos, yPos + 5.5);
    xPos += colWidths[i];
  });

  yPos += 10;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);

  data.issueBreakdown.slice(0, 15).forEach((issue, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, 'F');
    }

    xPos = margin + 2;
    doc.text(issue.issue.substring(0, 20), xPos, yPos);
    xPos += colWidths[0];
    doc.text(issue.category.substring(0, 15), xPos, yPos);
    xPos += colWidths[1];
    doc.text(`${issue.score}%`, xPos, yPos);
    xPos += colWidths[2];

    // Sentiment with color
    const sentimentColor = issue.sentiment === 'positive' ? [34, 197, 94] : issue.sentiment === 'negative' ? [239, 68, 68] : [107, 114, 128];
    doc.setTextColor(sentimentColor[0], sentimentColor[1], sentimentColor[2]);
    doc.text(issue.sentiment, xPos, yPos);
    xPos += colWidths[3];

    doc.setTextColor(51, 51, 51);
    const trendArrow = issue.trend === 'up' ? '\u2191' : issue.trend === 'down' ? '\u2193' : '\u2192';
    doc.text(trendArrow, xPos, yPos);
    xPos += colWidths[4];
    doc.text(`${issue.change > 0 ? '+' : ''}${issue.change}%`, xPos, yPos);

    yPos += 8;
  });

  yPos += 15;

  // Sentiment by Source
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('Sentiment by Source', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  data.sentimentBySource.forEach((source, index) => {
    const barY = yPos + index * 15;
    const barWidth = 120;
    const barHeight = 10;

    doc.text(source.source, margin, barY + 7);

    // Draw stacked bar
    const total = source.positive + source.neutral + source.negative;
    const posWidth = (source.positive / total) * barWidth;
    const neuWidth = (source.neutral / total) * barWidth;
    const negWidth = (source.negative / total) * barWidth;

    let barX = margin + 45;

    doc.setFillColor(34, 197, 94);
    doc.rect(barX, barY, posWidth, barHeight, 'F');
    barX += posWidth;

    doc.setFillColor(156, 163, 175);
    doc.rect(barX, barY, neuWidth, barHeight, 'F');
    barX += neuWidth;

    doc.setFillColor(239, 68, 68);
    doc.rect(barX, barY, negWidth, barHeight, 'F');

    doc.setTextColor(51, 51, 51);
    doc.text(`${source.positive}% / ${source.neutral}% / ${source.negative}%`, margin + 170, barY + 7);
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | BJP West Bengal Political Intelligence | Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

// =====================================================
// PDF EXPORT - TREND REPORT
// =====================================================

async function generateTrendPDF(data: TrendReportData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Header
  doc.setFillColor(19, 136, 8); // BJP Green
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Trend Analysis Report', margin, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Time Period: ${data.summary.timeRangeLabel}`, margin, 30);
  doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, pageWidth - margin - 60, 30);

  yPos = 50;

  // Summary
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Trend Summary', margin, yPos);
  yPos += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const trendIcon = data.summary.overallTrend === 'improving' ? '\u2191 Improving' :
    data.summary.overallTrend === 'declining' ? '\u2193 Declining' : '\u2192 Stable';

  doc.text(`Overall Trend: ${trendIcon}`, margin, yPos);
  yPos += 8;
  doc.text(`Data Points: ${data.summary.dataPoints}`, margin, yPos);
  yPos += 8;
  doc.text(`Average Change: ${data.summary.avgChange > 0 ? '+' : ''}${data.summary.avgChange}%`, margin, yPos);
  yPos += 15;

  // Week over Week Changes
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Week-over-Week Changes', margin, yPos);
  yPos += 10;

  data.weekOverWeek.forEach((item) => {
    const trendColor = item.trend === 'up' ? [34, 197, 94] : item.trend === 'down' ? [239, 68, 68] : [107, 114, 128];
    const arrow = item.trend === 'up' ? '\u2191' : item.trend === 'down' ? '\u2193' : '\u2192';

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(`${item.issue}:`, margin, yPos);

    doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
    doc.text(`${arrow} ${item.change > 0 ? '+' : ''}${item.change}%`, margin + 50, yPos);

    yPos += 8;
  });

  yPos += 15;

  // Trend Data Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('Historical Data (Sample)', margin, yPos);
  yPos += 10;

  // Table headers
  const headers = ['Date', 'Jobs', 'Infrastructure', 'Health', 'Education', 'Law & Order'];
  const colWidth = (pageWidth - 2 * margin) / headers.length;

  doc.setFillColor(19, 136, 8);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  headers.forEach((header, i) => {
    doc.text(header, margin + i * colWidth + 2, yPos + 5.5);
  });

  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);

  // Show last 15 data points
  const sampleData = data.trendData.slice(-15);
  sampleData.forEach((row, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
    }

    const values = [row.date, row.jobs, row.infrastructure, row.health, row.education, row.lawOrder];
    values.forEach((val, i) => {
      doc.text(String(val), margin + i * colWidth + 2, yPos);
    });

    yPos += 7;
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | BJP West Bengal Political Intelligence | Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

// =====================================================
// PDF EXPORT - COMPETITIVE REPORT
// =====================================================

async function generateCompetitivePDF(data: CompetitiveReportData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Header
  doc.setFillColor(0, 0, 128); // BJP Blue
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Competitive Analysis Report', margin, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('BJP vs Competitors - West Bengal', margin, 30);
  doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, pageWidth - margin - 60, 30);

  yPos = 50;

  // Summary
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Competitive Summary', margin, yPos);
  yPos += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Competitors Analyzed: ${data.summary.totalCompetitors}`, margin, yPos);
  yPos += 8;
  doc.text(`BJP Rank: #${data.summary.bjpRank}`, margin, yPos);
  yPos += 8;

  doc.setTextColor(34, 197, 94);
  doc.text(`Leading in: ${data.summary.leadingIn.join(', ') || 'None'}`, margin, yPos);
  yPos += 8;

  doc.setTextColor(239, 68, 68);
  doc.text(`Trailing in: ${data.summary.trailingIn.join(', ') || 'None'}`, margin, yPos);
  yPos += 15;

  // Competitor Metrics Table
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Competitor Metrics', margin, yPos);
  yPos += 10;

  const headers = ['Party', 'Sentiment', 'Mentions', 'Reach', 'Engagement', 'Trend'];
  const colWidths = [35, 28, 30, 32, 28, 25];

  doc.setFillColor(0, 0, 128);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  let xPos = margin + 2;
  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos + 5.5);
    xPos += colWidths[i];
  });

  yPos += 10;

  doc.setFont('helvetica', 'normal');

  data.competitors.forEach((comp, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, 'F');
    }

    xPos = margin + 2;
    doc.setTextColor(51, 51, 51);
    doc.text(comp.name, xPos, yPos);
    xPos += colWidths[0];
    doc.text(`${Math.round(comp.sentiment)}%`, xPos, yPos);
    xPos += colWidths[1];
    doc.text(comp.mentions.toLocaleString(), xPos, yPos);
    xPos += colWidths[2];
    doc.text(comp.reach.toLocaleString(), xPos, yPos);
    xPos += colWidths[3];
    doc.text(`${comp.engagement.toFixed(1)}%`, xPos, yPos);
    xPos += colWidths[4];

    const trendArrow = comp.trend === 'up' ? '\u2191' : comp.trend === 'down' ? '\u2193' : '\u2192';
    doc.text(trendArrow, xPos, yPos);

    yPos += 8;
  });

  yPos += 15;

  // Issue Comparison
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('Issue-wise Comparison', margin, yPos);
  yPos += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  data.issueComparison.forEach((issue) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${issue.issue}: BJP ${issue.bjpScore}%`, margin, yPos);
    doc.setFont('helvetica', 'normal');

    const competitorText = issue.competitors.map(c => `${c.name}: ${c.score}%`).join(' | ');
    doc.setTextColor(102, 102, 102);
    doc.text(competitorText, margin + 60, yPos);

    doc.setTextColor(issue.bjpLeading ? 34 : 239, issue.bjpLeading ? 197 : 68, issue.bjpLeading ? 94 : 68);
    doc.text(issue.bjpLeading ? '\u2713 Leading' : '\u2717 Trailing', pageWidth - margin - 25, yPos);

    doc.setTextColor(51, 51, 51);
    yPos += 10;
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | BJP West Bengal Political Intelligence | Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

// =====================================================
// PDF EXPORT - REGIONAL REPORT
// =====================================================

async function generateRegionalPDF(data: RegionalReportData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Header
  doc.setFillColor(255, 153, 51); // BJP Saffron
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Regional Analysis Report', margin, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('West Bengal Constituency Analysis', margin, 30);
  doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, pageWidth - margin - 60, 30);

  yPos = 50;

  // Summary
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Regional Summary', margin, yPos);
  yPos += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  doc.text(`Total Constituencies: ${data.summary.totalConstituencies}`, margin, yPos);
  yPos += 8;
  doc.text(`Average Sentiment: ${data.summary.avgSentiment}%`, margin, yPos);
  yPos += 8;
  doc.text(`Top Performing: ${data.summary.topPerforming}`, margin, yPos);
  yPos += 8;
  doc.text(`Needs Attention: ${data.summary.needsAttention}`, margin, yPos);
  yPos += 8;
  doc.text(`Urban: ${data.summary.urbanCount} | Rural: ${data.summary.ruralCount}`, margin, yPos);
  yPos += 15;

  // Urban vs Rural
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Urban vs Rural Comparison', margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  doc.text(`Urban Areas: ${data.urbanVsRural.urban.avgSentiment}% avg sentiment (${data.urbanVsRural.urban.count} constituencies)`, margin, yPos);
  yPos += 8;
  doc.text(`Rural Areas: ${data.urbanVsRural.rural.avgSentiment}% avg sentiment (${data.urbanVsRural.rural.count} constituencies)`, margin, yPos);
  yPos += 15;

  // District Aggregation
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('District-wise Performance', margin, yPos);
  yPos += 10;

  const distHeaders = ['District', 'Avg Sentiment', 'Constituencies', 'Top Issue'];
  const distColWidths = [50, 35, 35, 50];

  doc.setFillColor(255, 153, 51);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  let xPos = margin + 2;
  distHeaders.forEach((header, i) => {
    doc.text(header, xPos, yPos + 5.5);
    xPos += distColWidths[i];
  });

  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);

  data.districtAggregation.slice(0, 15).forEach((district, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, 'F');
    }

    xPos = margin + 2;
    doc.text(district.district.substring(0, 25), xPos, yPos);
    xPos += distColWidths[0];
    doc.text(`${district.avgSentiment}%`, xPos, yPos);
    xPos += distColWidths[1];
    doc.text(district.constituencyCount.toString(), xPos, yPos);
    xPos += distColWidths[2];
    doc.text(district.topIssue.substring(0, 25), xPos, yPos);

    yPos += 8;
  });

  yPos += 15;

  // Constituency Details (Top 20)
  if (yPos > 150) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Performing Constituencies', margin, yPos);
  yPos += 10;

  const constHeaders = ['Constituency', 'District', 'Type', 'Sentiment', 'Voters'];
  const constColWidths = [45, 40, 25, 30, 35];

  doc.setFillColor(255, 153, 51);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  xPos = margin + 2;
  constHeaders.forEach((header, i) => {
    doc.text(header, xPos, yPos + 5.5);
    xPos += constColWidths[i];
  });

  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);

  data.constituencyData.slice(0, 20).forEach((constituency, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, 'F');
    }

    xPos = margin + 2;
    doc.text(constituency.name.substring(0, 22), xPos, yPos);
    xPos += constColWidths[0];
    doc.text(constituency.district.substring(0, 20), xPos, yPos);
    xPos += constColWidths[1];
    doc.text(constituency.isUrban ? 'Urban' : 'Rural', xPos, yPos);
    xPos += constColWidths[2];
    doc.text(`${constituency.sentiment}%`, xPos, yPos);
    xPos += constColWidths[3];
    doc.text(constituency.voterCount.toLocaleString(), xPos, yPos);

    yPos += 8;
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | BJP West Bengal Political Intelligence | Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

// =====================================================
// EXCEL EXPORT FUNCTIONS
// =====================================================

function generateSentimentExcel(data: SentimentReportData): Blob {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Sentiment Analysis Report'],
    ['Generated:', new Date(data.generatedAt).toLocaleString()],
    [''],
    ['Executive Summary'],
    ['Overall Sentiment:', `${data.summary.overallSentiment}%`],
    ['Total Issues:', data.summary.totalIssues],
    ['Positive Issues:', data.summary.positiveCount],
    ['Negative Issues:', data.summary.negativeCount],
    ['Neutral Issues:', data.summary.neutralCount],
    ['Top Positive Issue:', data.summary.topPositiveIssue],
    ['Top Negative Issue:', data.summary.topNegativeIssue]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Issue Breakdown Sheet
  const issueData = [
    ['Issue', 'Category', 'Score (%)', 'Sentiment', 'Trend', 'Change (%)'],
    ...data.issueBreakdown.map(i => [i.issue, i.category, i.score, i.sentiment, i.trend, i.change])
  ];
  const issueSheet = XLSX.utils.aoa_to_sheet(issueData);
  XLSX.utils.book_append_sheet(wb, issueSheet, 'Issue Breakdown');

  // Sentiment by Source Sheet
  const sourceData = [
    ['Source', 'Positive (%)', 'Neutral (%)', 'Negative (%)'],
    ...data.sentimentBySource.map(s => [s.source, s.positive, s.neutral, s.negative])
  ];
  const sourceSheet = XLSX.utils.aoa_to_sheet(sourceData);
  XLSX.utils.book_append_sheet(wb, sourceSheet, 'By Source');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function generateTrendExcel(data: TrendReportData): Blob {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Trend Analysis Report'],
    ['Time Period:', data.summary.timeRangeLabel],
    ['Generated:', new Date(data.generatedAt).toLocaleString()],
    [''],
    ['Summary'],
    ['Overall Trend:', data.summary.overallTrend],
    ['Data Points:', data.summary.dataPoints],
    ['Average Change:', `${data.summary.avgChange}%`]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Week over Week Sheet
  const wowData = [
    ['Issue', 'Change (%)', 'Trend'],
    ...data.weekOverWeek.map(w => [w.issue, w.change, w.trend])
  ];
  const wowSheet = XLSX.utils.aoa_to_sheet(wowData);
  XLSX.utils.book_append_sheet(wb, wowSheet, 'Week over Week');

  // Trend Data Sheet
  const trendSheetData = [
    ['Date', 'Jobs', 'Infrastructure', 'Health', 'Education', 'Law & Order'],
    ...data.trendData.map(t => [t.date, t.jobs, t.infrastructure, t.health, t.education, t.lawOrder])
  ];
  const trendSheet = XLSX.utils.aoa_to_sheet(trendSheetData);
  XLSX.utils.book_append_sheet(wb, trendSheet, 'Historical Data');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function generateCompetitiveExcel(data: CompetitiveReportData): Blob {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Competitive Analysis Report'],
    ['Generated:', new Date(data.generatedAt).toLocaleString()],
    [''],
    ['Summary'],
    ['Total Competitors:', data.summary.totalCompetitors],
    ['BJP Rank:', `#${data.summary.bjpRank}`],
    ['Leading In:', data.summary.leadingIn.join(', ')],
    ['Trailing In:', data.summary.trailingIn.join(', ')]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Competitors Sheet
  const compData = [
    ['Party', 'Full Name', 'Leader', 'Sentiment (%)', 'Mentions', 'Reach', 'Engagement (%)', 'Trend'],
    ...data.competitors.map(c => [c.name, c.party_name, c.leader_name, Math.round(c.sentiment), c.mentions, c.reach, c.engagement.toFixed(2), c.trend])
  ];
  const compSheet = XLSX.utils.aoa_to_sheet(compData);
  XLSX.utils.book_append_sheet(wb, compSheet, 'Competitors');

  // Issue Comparison Sheet
  const issueHeaders = ['Issue', 'BJP Score'];
  if (data.issueComparison.length > 0 && data.issueComparison[0].competitors.length > 0) {
    data.issueComparison[0].competitors.forEach(c => issueHeaders.push(`${c.name} Score`));
  }
  issueHeaders.push('BJP Leading');

  const issueData = [
    issueHeaders,
    ...data.issueComparison.map(i => {
      const row: (string | number | boolean)[] = [i.issue, i.bjpScore];
      i.competitors.forEach(c => row.push(c.score));
      row.push(i.bjpLeading ? 'Yes' : 'No');
      return row;
    })
  ];
  const issueSheet = XLSX.utils.aoa_to_sheet(issueData);
  XLSX.utils.book_append_sheet(wb, issueSheet, 'Issue Comparison');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function generateRegionalExcel(data: RegionalReportData): Blob {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Regional Analysis Report'],
    ['Generated:', new Date(data.generatedAt).toLocaleString()],
    [''],
    ['Summary'],
    ['Total Constituencies:', data.summary.totalConstituencies],
    ['Average Sentiment:', `${data.summary.avgSentiment}%`],
    ['Top Performing:', data.summary.topPerforming],
    ['Needs Attention:', data.summary.needsAttention],
    ['Urban Count:', data.summary.urbanCount],
    ['Rural Count:', data.summary.ruralCount],
    [''],
    ['Urban vs Rural'],
    ['Urban Avg Sentiment:', `${data.urbanVsRural.urban.avgSentiment}%`],
    ['Rural Avg Sentiment:', `${data.urbanVsRural.rural.avgSentiment}%`]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // District Aggregation Sheet
  const districtData = [
    ['District', 'Avg Sentiment (%)', 'Constituency Count', 'Top Issue'],
    ...data.districtAggregation.map(d => [d.district, d.avgSentiment, d.constituencyCount, d.topIssue])
  ];
  const districtSheet = XLSX.utils.aoa_to_sheet(districtData);
  XLSX.utils.book_append_sheet(wb, districtSheet, 'Districts');

  // Constituency Data Sheet
  const constData = [
    ['Constituency', 'District', 'Urban/Rural', 'Sentiment (%)', 'Top Issue', 'Voter Count'],
    ...data.constituencyData.map(c => [c.name, c.district, c.isUrban ? 'Urban' : 'Rural', c.sentiment, c.topIssue, c.voterCount])
  ];
  const constSheet = XLSX.utils.aoa_to_sheet(constData);
  XLSX.utils.book_append_sheet(wb, constSheet, 'Constituencies');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// =====================================================
// CSV EXPORT FUNCTIONS
// =====================================================

function generateCSV(data: any[], headers: string[]): Blob {
  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header.toLowerCase().replace(/ /g, '')] ?? row[header] ?? '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  });

  // Add BOM for Excel compatibility
  const BOM = '\uFEFF';
  return new Blob([BOM + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
}

// =====================================================
// MAIN EXPORT FUNCTION
// =====================================================

export async function exportReport(
  reportType: string,
  data: ReportData,
  format: 'pdf' | 'excel' | 'csv'
): Promise<Blob> {
  console.log(`[ReportExport] Exporting ${reportType} report as ${format}`);

  switch (format) {
    case 'pdf':
      switch (reportType) {
        case 'sentiment':
          return generateSentimentPDF(data as SentimentReportData);
        case 'trends':
          return generateTrendPDF(data as TrendReportData);
        case 'competitor':
          return generateCompetitivePDF(data as CompetitiveReportData);
        case 'regional':
          return generateRegionalPDF(data as RegionalReportData);
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

    case 'excel':
      switch (reportType) {
        case 'sentiment':
          return generateSentimentExcel(data as SentimentReportData);
        case 'trends':
          return generateTrendExcel(data as TrendReportData);
        case 'competitor':
          return generateCompetitiveExcel(data as CompetitiveReportData);
        case 'regional':
          return generateRegionalExcel(data as RegionalReportData);
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

    case 'csv':
      // Flatten data for CSV export
      let csvData: any[] = [];
      let headers: string[] = [];

      switch (reportType) {
        case 'sentiment':
          const sentData = data as SentimentReportData;
          csvData = sentData.issueBreakdown;
          headers = ['issue', 'category', 'score', 'sentiment', 'trend', 'change'];
          break;
        case 'trends':
          const trendData = data as TrendReportData;
          csvData = trendData.trendData;
          headers = ['date', 'jobs', 'infrastructure', 'health', 'education', 'lawOrder'];
          break;
        case 'competitor':
          const compData = data as CompetitiveReportData;
          csvData = compData.competitors.map(c => ({
            name: c.name,
            party_name: c.party_name,
            sentiment: Math.round(c.sentiment),
            mentions: c.mentions,
            reach: c.reach,
            engagement: c.engagement.toFixed(2),
            trend: c.trend
          }));
          headers = ['name', 'party_name', 'sentiment', 'mentions', 'reach', 'engagement', 'trend'];
          break;
        case 'regional':
          const regData = data as RegionalReportData;
          csvData = regData.constituencyData.map(c => ({
            name: c.name,
            district: c.district,
            type: c.isUrban ? 'Urban' : 'Rural',
            sentiment: c.sentiment,
            topIssue: c.topIssue,
            voterCount: c.voterCount
          }));
          headers = ['name', 'district', 'type', 'sentiment', 'topIssue', 'voterCount'];
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      return generateCSV(csvData, headers);

    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}

// =====================================================
// DOWNLOAD HELPER
// =====================================================

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default {
  exportReport,
  downloadBlob
};
