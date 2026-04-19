import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';

import type { DocumentType, FinanceSummary, UserProfile } from './types';

function moneyLabel(cents: number) {
  const value = Number(cents || 0) / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString([], { dateStyle: 'medium' });
}

export function getDocumentLabel(documentType: DocumentType) {
  if (documentType === 'exam-card') return 'Exam Card';
  if (documentType === 'transcript') return 'Transcript';
  return 'Gatepass';
}

export function buildDocumentHtml({
  documentType,
  profile,
  finance,
}: {
  documentType: DocumentType;
  profile: UserProfile;
  finance: FinanceSummary;
}) {
  const isCleared = finance.feesCleared && finance.balanceCents <= 0;
  const title = getDocumentLabel(documentType);
  const fileTitle = documentType === 'transcript' ? 'Transcripts' : 'Transcripts';
  const stamp = isCleared
    ? `
      <div style="position:absolute; top:28px; right:28px; transform:rotate(-12deg); border:4px solid #1b7a2f; color:#1b7a2f; padding:14px 20px; border-radius:18px; font-weight:800; letter-spacing:0.22em; font-size:18px;">
        CLEARED
      </div>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page { margin: 24px; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #153126;
            background: #f5f7f5;
          }
          .sheet {
            position: relative;
            min-height: 100vh;
            border: 2px solid #154f2d;
            border-radius: 24px;
            padding: 28px;
            background: linear-gradient(180deg, #ffffff 0%, #f1f7f2 100%);
            box-sizing: border-box;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
          }
          .brand {
            text-transform: uppercase;
            letter-spacing: 0.26em;
            font-size: 12px;
            color: #46705a;
            font-weight: 700;
          }
          .title {
            margin: 10px 0 0;
            font-size: 30px;
            line-height: 1.1;
            color: #0c2b1b;
            font-weight: 800;
          }
          .subtitle {
            margin-top: 8px;
            color: #4d675c;
            font-size: 14px;
            line-height: 1.7;
          }
          .card {
            margin-top: 22px;
            border-radius: 20px;
            background: #ffffff;
            border: 1px solid #d8e7dc;
            padding: 18px;
          }
          .row { display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
          .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: #678176;
            margin-bottom: 6px;
            font-weight: 700;
          }
          .value { font-size: 16px; color: #0b2a1a; font-weight: 700; }
          .muted { color: #597166; font-size: 13px; line-height: 1.7; }
          .stamp-box {
            margin-top: 20px;
            border-radius: 20px;
            border: 2px dashed ${isCleared ? '#1b7a2f' : '#b98b4f'};
            color: ${isCleared ? '#1b7a2f' : '#6b4e23'};
            padding: 18px;
            text-align: center;
            font-weight: 800;
            letter-spacing: 0.18em;
          }
          .stamp-note {
            margin-top: 10px;
            font-size: 12px;
            color: #597166;
            text-align: center;
          }
          .footer {
            margin-top: 26px;
            padding-top: 18px;
            border-top: 1px solid #d8e7dc;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          ${stamp}
          <div class="header">
            <div>
              <div class="brand">Chuka University</div>
              <div class="title">${title}</div>
              <div class="subtitle">
                ${fileTitle} prepared for ${profile.fullName}. The document status follows the current fee clearance record.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="row">
              <div>
                <div class="label">Student name</div>
                <div class="value">${profile.fullName}</div>
              </div>
              <div>
                <div class="label">Registration no.</div>
                <div class="value">${profile.regNumber || 'N/A'}</div>
              </div>
              <div>
                <div class="label">Department</div>
                <div class="value">${profile.department || 'N/A'}</div>
              </div>
            </div>

            <div class="row" style="margin-top: 18px;">
              <div>
                <div class="label">Email</div>
                <div class="value">${profile.email}</div>
              </div>
              <div>
                <div class="label">Balance</div>
                <div class="value">${moneyLabel(finance.balanceCents)}</div>
              </div>
              <div>
                <div class="label">Last payment</div>
                <div class="value">${formatDate(finance.lastPaymentAt)}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="label">Status</div>
            <div class="value">${isCleared ? 'Cleared for release' : 'Pending balance - clearance on hold'}</div>
            <div class="muted" style="margin-top: 8px;">
              ${isCleared
                ? 'The student has no pending balance, so the cleared stamp is included.'
                : 'There is an outstanding balance. The cleared stamp is withheld until payment is updated.'}
            </div>
            ${isCleared ? '<div class="stamp-box">CLEARED</div>' : ''}
            <div class="stamp-note">
              This document is stored as ${fileTitle.toLowerCase()}.pdf and can be saved to the Downloads folder on Android.
            </div>
          </div>

          <div class="footer">
            <div class="muted">Generated by the Chuka campus app</div>
            <div class="muted">${new Date().toLocaleString()}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function exportDocumentPdf(options: {
  html: string;
  fileName: string;
  androidDirectoryUri?: string | null;
}) {
  const result = await Print.printToFileAsync({ html: options.html, base64: true });
  const base64 = result.base64 || (await new File(result.uri).base64());

  if (Platform.OS === 'android') {
    let directoryUri = options.androidDirectoryUri;
    if (!directoryUri) {
      const permissionResult = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
        FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download')
      );

      if (!permissionResult.granted) {
        throw new Error('Download folder permission was not granted.');
      }

      directoryUri = permissionResult.directoryUri;
    }

    const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(String(directoryUri), options.fileName, 'application/pdf');
    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
    return { uri: fileUri, base64, directoryUri };
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf' });
  }

  return { uri: result.uri, base64, directoryUri: null as string | null };
}
