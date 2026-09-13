// src/services/PdfService.ts
// Handles HTML template generation, A4 PDF rendering via expo-print,
// local file caching via expo-file-system/legacy, and Android sharing via expo-sharing.

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import type { QuotationDetail, BusinessProfile } from '../types/models';
import { formatCurrency } from '../utils/calculations';

export class PdfService {
  /**
   * Builds clean, responsive A4 HTML template for print/PDF generation.
   */
  static buildQuotationHtml(
    detail: QuotationDetail,
    profile: BusinessProfile,
    options?: { pdfMode?: 'detailed' | 'simple' }
  ): string {
    const isDetailed = (options?.pdfMode ?? detail.pdfMode) === 'detailed';
    const currency = detail.currencySymbol || profile.currencySymbol || 'Rs.';

    const materials = detail.lineItems.filter((l) => l.isMaterial);
    const labour = detail.lineItems.filter((l) => !l.isMaterial);

    const renderTableRows = (items: typeof detail.lineItems) => {
      if (items.length === 0) {
        return `<tr><td colspan="4" class="empty-row">No items listed</td></tr>`;
      }
      return items
        .map((item, idx) => `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td>${item.description}</td>
            <td style="text-align: right; font-weight: 600;">${item.quantity}</td>
            <td style="text-align: center;">${item.unit}</td>
          </tr>
        `)
        .join('');
    };

    const logoHtml = profile.logoUri
      ? `<img src="${profile.logoUri}" style="max-height: 70px; max-width: 180px; object-fit: contain; margin-bottom: 8px;" alt="Logo" />`
      : '';

    const custAddress = [
      detail.customer.addressLine1,
      detail.customer.addressLine2,
      detail.customer.city,
    ].filter(Boolean).join(', ');

    const bizAddress = [
      profile.addressLine1,
      profile.addressLine2,
      profile.city,
    ].filter(Boolean).join(', ');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation ${detail.referenceNo}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 13px;
            line-height: 1.5;
            background: #ffffff;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 16px;
          }
          .biz-title {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
          }
          .biz-sub {
            color: #475569;
            font-size: 12px;
          }
          .doc-title {
            font-size: 26px;
            font-weight: 800;
            color: #d97706;
            text-align: right;
            margin: 0;
            letter-spacing: 1px;
          }
          .doc-ref {
            font-size: 14px;
            font-weight: 600;
            color: #334155;
            text-align: right;
          }
          .meta-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          .meta-card {
            width: 48%;
            vertical-align: top;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
          }
          .card-header {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
          }
          .card-name {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .card-text {
            color: #334155;
            font-size: 12px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 20px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .items-table th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            text-align: left;
          }
          .items-table td {
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
            font-size: 12px;
          }
          .empty-row {
            text-align: center;
            color: #94a3b8;
            font-style: italic;
            padding: 12px;
          }
          .summary-table {
            width: 320px;
            margin-left: auto;
            border-collapse: collapse;
            margin-top: 16px;
            margin-bottom: 24px;
          }
          .summary-table td {
            padding: 6px 12px;
            font-size: 13px;
          }
          .summary-label {
            color: #475569;
          }
          .summary-val {
            text-align: right;
            font-weight: 600;
            color: #0f172a;
          }
          .grand-total-row td {
            background: #fef3c7;
            border-top: 2px solid #d97706;
            border-bottom: 2px solid #d97706;
            font-size: 16px;
            font-weight: 800;
            color: #78350f;
            padding: 10px 12px;
          }
          .notes-box {
            background: #f8fafc;
            border-left: 4px solid #d97706;
            padding: 12px 16px;
            margin-top: 20px;
            border-radius: 0 6px 6px 0;
          }
          .notes-heading {
            font-weight: 700;
            font-size: 12px;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .notes-body {
            font-size: 12px;
            color: #334155;
            white-space: pre-line;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <!-- Header Table -->
        <table class="header-table">
          <tr>
            <td style="vertical-align: top;">
              ${logoHtml}
              <div class="biz-title">${profile.tradingName || profile.name}</div>
              <div class="biz-sub">${bizAddress || 'Electrician Services'}</div>
              ${profile.phone ? `<div class="biz-sub">Tel: ${profile.phone}</div>` : ''}
              ${profile.email ? `<div class="biz-sub">Email: ${profile.email}</div>` : ''}
              ${profile.regNumber ? `<div class="biz-sub">Reg: ${profile.regNumber}</div>` : ''}
            </td>
            <td style="vertical-align: top; text-align: right;">
              <div class="doc-title">MATERIAL LIST</div>
              <div class="doc-ref">${detail.referenceNo}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 6px;">
                <strong>Date:</strong> ${detail.issueDate}<br>
                ${detail.validUntil ? `<strong>Valid Until:</strong> ${detail.validUntil}` : ''}
              </div>
            </td>
          </tr>
        </table>

        <!-- Metadata Grid -->
        <table class="meta-grid">
          <tr>
            <td class="meta-card">
              <div class="card-header">Customer Information</div>
              <div class="card-name">${detail.customer.name}</div>
              ${detail.customer.company ? `<div class="card-text">${detail.customer.company}</div>` : ''}
              ${custAddress ? `<div class="card-text">${custAddress}</div>` : ''}
              ${detail.customer.phone ? `<div class="card-text">Tel: ${detail.customer.phone}</div>` : ''}
            </td>
            <td style="width: 4%;"></td>
            <td class="meta-card">
              <div class="card-header">Project Information</div>
              <div class="card-name">${detail.project.name}</div>
              ${detail.project.siteAddress ? `<div class="card-text">Site: ${detail.project.siteAddress}</div>` : ''}
              ${detail.project.description ? `<div class="card-text">${detail.project.description}</div>` : ''}
            </td>
          </tr>
        </table>

        <!-- Materials Section -->
        <div class="section-title">1. Materials Catalogue</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Description</th>
              <th style="width: 80px; text-align: right;">Quantity</th>
              <th style="width: 80px; text-align: center;">Unit</th>
            </tr>
          </thead>
          <tbody>
            ${renderTableRows(materials)}
          </tbody>
        </table>

        <!-- Labour Section -->
        <div class="section-title">2. Labour Items & Work</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Description</th>
              <th style="width: 80px; text-align: right;">Quantity</th>
              <th style="width: 80px; text-align: center;">Unit</th>
            </tr>
          </thead>
          <tbody>
            ${renderTableRows(labour)}
          </tbody>
        </table>

        <!-- Summary Table -->
        <table class="summary-table">
          <tr class="grand-total-row">
            <td class="summary-label">Total Listed Items:</td>
            <td class="summary-val">${detail.lineItems.length} items</td>
          </tr>
        </table>

        <!-- Notes and Terms -->
        ${
          detail.notes || detail.terms || profile.defaultPaymentTerms
            ? `<div class="notes-box">
                ${detail.notes ? `<div class="notes-heading">Notes:</div><div class="notes-body">${detail.notes}</div>` : ''}
                ${
                  detail.terms || profile.defaultPaymentTerms
                    ? `<div class="notes-heading" style="margin-top: 8px;">Terms & Conditions:</div>
                       <div class="notes-body">${detail.terms || profile.defaultPaymentTerms}</div>`
                    : ''
                }
                ${
                  profile.bankName && profile.bankAccount
                    ? `<div class="notes-heading" style="margin-top: 8px;">Bank Details:</div>
                       <div class="notes-body">${profile.bankName} — A/C: ${profile.bankAccount} (${profile.bankBranch || ''})</div>`
                    : ''
                }
              </div>`
            : ''
        }

        <!-- Footer -->
        <div class="footer">
          Thank you for your business! — Generated by ElectroQuote App
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates A4 PDF and stores in documentDirectory so Android FileProvider
   * can access it for sharing via WhatsApp, Email, etc.
   */
  static async generateQuotationPdf(
    detail: QuotationDetail,
    profile: BusinessProfile,
    options?: { pdfMode?: 'detailed' | 'simple' }
  ): Promise<string> {
    const html = this.buildQuotationHtml(detail, profile, options);

    // Generate initial PDF file from HTML (lands in system cache/tmp)
    const file = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const safeRef = detail.referenceNo.replace(/[^a-zA-Z0-9-]/g, '_');
    const fileName = `Quotation-${safeRef}.pdf`;

    // MUST copy to documentDirectory — Android FileProvider only allows
    // sharing files from app's own document directory, not system tmp paths.
    const docDir = FileSystem.documentDirectory;
    if (docDir) {
      const targetPath = `${docDir}${fileName}`;
      try {
        // Remove stale copy first to avoid EEXIST
        const info = await FileSystem.getInfoAsync(targetPath);
        if (info.exists) {
          await FileSystem.deleteAsync(targetPath, { idempotent: true });
        }
        await FileSystem.copyAsync({ from: file.uri, to: targetPath });
        return targetPath;
      } catch {
        // Fall back to original uri
      }
    }

    return file.uri;
  }

  /**
   * Triggers Android system share sheet for sharing PDF via WhatsApp, Email, Bluetooth, etc.
   */
  static async sharePdf(pdfUri: string, referenceNo: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share Quotation ${referenceNo}`,
      UTI: 'com.adobe.pdf',
    });
  }
}
