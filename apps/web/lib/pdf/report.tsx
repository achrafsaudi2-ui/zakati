'use client';

/**
 * Branded zakat receipt — generated client-side via @react-pdf/renderer.
 * Lazy-imported on demand to keep the initial bundle light.
 */

import type { CalcOutput, View } from '@zakati/engine';
import { formatMoney } from '@/lib/utils';

interface ReportInput {
  result: CalcOutput;
  view: View;
  primaryCurrency: string;
  generatedAt: Date;
}

/**
 * Returns a Blob of the rendered PDF. Caller is responsible for triggering
 * the download or share flow.
 */
export async function generateZakatReport(input: ReportInput): Promise<Blob> {
  // Lazy-load to keep this off the initial bundle
  const { Document, Page, Text, View, StyleSheet, pdf, Font } = await import('@react-pdf/renderer');

  // Cormorant Garamond from Google Fonts CDN — react-pdf can register web fonts
  Font.register({
    family: 'Cormorant',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjQAllvuQWJ5heb_w.ttf',
      },
    ],
  });

  const styles = StyleSheet.create({
    page: {
      padding: 56,
      fontSize: 11,
      fontFamily: 'Helvetica',
      color: '#1a1d21',
      backgroundColor: '#fefdfa',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#e8e0d0',
      paddingBottom: 16,
      marginBottom: 28,
    },
    logoText: {
      fontFamily: 'Cormorant',
      fontSize: 24,
      color: '#0a7c5a',
    },
    metaText: {
      fontSize: 9,
      color: '#888780',
      textAlign: 'right',
    },
    titleEyebrow: {
      fontSize: 8,
      letterSpacing: 1.5,
      color: '#888780',
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    titleAmount: {
      fontFamily: 'Cormorant',
      fontSize: 42,
      color: '#0a7c5a',
      marginBottom: 6,
    },
    titleSub: {
      fontSize: 10,
      color: '#5f5e5a',
    },
    sectionLabel: {
      fontSize: 8,
      letterSpacing: 1.5,
      color: '#888780',
      textTransform: 'uppercase',
      marginTop: 32,
      marginBottom: 8,
    },
    card: {
      backgroundColor: '#f8f4ec',
      borderRadius: 8,
      padding: 16,
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 3,
    },
    cardRowDivider: {
      borderTopWidth: 1,
      borderTopColor: '#e8e0d0',
      paddingTop: 6,
      marginTop: 3,
    },
    label: { fontSize: 10, color: '#5f5e5a' },
    value: { fontSize: 10, color: '#1a1d21' },
    valueBold: { fontSize: 11, color: '#1a1d21', fontFamily: 'Helvetica-Bold' },
    valueAccent: { fontSize: 11, color: '#0a7c5a', fontFamily: 'Helvetica-Bold' },
    footnote: {
      fontSize: 8,
      color: '#888780',
      marginTop: 28,
      lineHeight: 1.5,
    },
    pillStrip: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 8,
    },
    pill: {
      fontSize: 8,
      color: '#0a7c5a',
      backgroundColor: '#e8f4ee',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    footer: {
      position: 'absolute',
      bottom: 32,
      left: 56,
      right: 56,
      fontSize: 8,
      color: '#888780',
      textAlign: 'center',
      borderTopWidth: 1,
      borderTopColor: '#e8e0d0',
      paddingTop: 10,
    },
  });

  const { result, view: viewKey, primaryCurrency, generatedAt } = input;

  const document = (
    <Document
      title={`Zakat receipt · ${formatMoney(result.zakatNetInPrimary, primaryCurrency)}`}
      author="Zakati"
      subject="Personal zakat calculation"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Zakati</Text>
          <View>
            <Text style={styles.metaText}>Generated {generatedAt.toLocaleDateString('en-GB')}</Text>
            <Text style={styles.metaText}>{viewKey} view</Text>
          </View>
        </View>

        {/* Hero */}
        <Text style={styles.titleEyebrow}>Your zakat to pay</Text>
        <Text style={styles.titleAmount}>
          {formatMoney(result.zakatNetInPrimary, primaryCurrency)}
        </Text>
        <Text style={styles.titleSub}>
          For the lunar year ending {new Date(result.zakatDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <View style={styles.pillStrip}>
          <Text style={styles.pill}>Above nisab</Text>
          <Text style={styles.pill}>2.5% rate</Text>
          <Text style={styles.pill}>{viewKey} methodology</Text>
        </View>

        {/* Breakdown */}
        <Text style={styles.sectionLabel}>Calculation breakdown</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Gross zakatable wealth</Text>
            <Text style={styles.value}>
              {formatMoney(result.totalZakatableInPrimary, primaryCurrency)}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Less deductible liabilities</Text>
            <Text style={styles.value}>
              −{formatMoney(result.totalDeductibleLiabilitiesInPrimary, primaryCurrency)}
            </Text>
          </View>
          <View style={[styles.cardRow, styles.cardRowDivider]}>
            <Text style={styles.label}>Net zakatable wealth</Text>
            <Text style={styles.valueBold}>
              {formatMoney(result.netZakatableInPrimary, primaryCurrency)}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>× 2.5% zakat rate</Text>
            <Text style={styles.value}>
              {formatMoney(result.zakatGrossInPrimary, primaryCurrency)}
            </Text>
          </View>
          {result.prepaidInPrimary > 0 && (
            <View style={styles.cardRow}>
              <Text style={styles.label}>Less prepaid zakat</Text>
              <Text style={styles.value}>
                −{formatMoney(result.prepaidInPrimary, primaryCurrency)}
              </Text>
            </View>
          )}
          <View style={[styles.cardRow, styles.cardRowDivider]}>
            <Text style={styles.label}>Zakat net to pay</Text>
            <Text style={styles.valueAccent}>
              {formatMoney(result.zakatNetInPrimary, primaryCurrency)}
            </Text>
          </View>
        </View>

        {/* Methodology note */}
        <Text style={styles.sectionLabel}>Methodology notes</Text>
        <View style={styles.card}>
          <Text style={[styles.value, { lineHeight: 1.6 }]}>
            This receipt reflects the {viewKey} methodology, which is one of three views Zakati
            supports. Nisab threshold used: {formatMoney(result.nisabThresholdInPrimary, primaryCurrency)} (silver-equivalent
            of 612.36g). All multi-currency holdings were converted to {primaryCurrency} at the
            rates shown in the app.
          </Text>
        </View>

        {/* Footnote */}
        <Text style={styles.footnote}>
          This document is for your records. It is not a fatwa nor official scholarly certification.
          Consult a qualified scholar for binding rulings on edge cases. Generated entirely on your
          device — no data was transmitted.
        </Text>

        <Text style={styles.footer} fixed>
          zakati.app · sadaqah jariyah · May Allah accept it from you
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(document).toBlob();
  return blob;
}

/** Convenience wrapper: build the PDF and trigger a download. */
export async function downloadZakatReport(input: ReportInput, filename?: string) {
  const blob = await generateZakatReport(input);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `zakati-${input.result.zakatDate}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Share via Web Share API if available; falls back to clipboard text. */
export async function shareZakatSummary(input: ReportInput): Promise<'shared' | 'copied'> {
  const { result, view, primaryCurrency } = input;
  const summary =
    `My zakat for this year (${view} view): ${formatMoney(result.zakatNetInPrimary, primaryCurrency)}\n` +
    `Calculated privately on zakati.app — built as sadaqah jariyah.`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'My zakat calculation',
        text: summary,
        url: 'https://zakati.app',
      });
      return 'shared';
    } catch {
      // User cancelled; fall through to clipboard
    }
  }

  await navigator.clipboard.writeText(summary);
  return 'copied';
}
