import { MasterLedgerState } from '@/core/types/ledger';

const DRIVE_FILE_NAME = 'mm_master_ledger.json';
const DRIVE_MIME_TYPE = 'application/json';

export interface DriveSyncStatus {
  isSignedIn: boolean;
  userEmail?: string;
  isSyncing: boolean;
  lastSyncedAt?: string;
  error?: string;
}

/**
 * Client-Side Google Drive REST API v3 Integration
 * Scope: https://www.googleapis.com/auth/drive.file
 */
export class GoogleDriveSyncClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
  }

  hasToken(): boolean {
    return Boolean(this.accessToken);
  }

  private getHeaders(): HeadersInit {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Drive.');
    }
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Search for existing mm_master_ledger.json in user's Drive
   */
  async findMasterFile(): Promise<{ id: string; modifiedTime: string } | null> {
    const q = `name = '${DRIVE_FILE_NAME}' and trashed = false`;
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,modifiedTime)`,
      { headers: this.getHeaders() }
    );

    if (!res.ok) {
      throw new Error(`Drive search failed: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return {
        id: data.files[0].id,
        modifiedTime: data.files[0].modifiedTime,
      };
    }
    return null;
  }

  /**
   * Download mm_master_ledger.json from user's Drive
   */
  async downloadMasterFile(fileId: string): Promise<MasterLedgerState> {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: this.getHeaders() }
    );

    if (!res.ok) {
      throw new Error(`Drive download failed: ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Upload or update mm_master_ledger.json in user's Drive
   */
  async uploadMasterFile(state: MasterLedgerState, existingFileId?: string): Promise<string> {
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: DRIVE_FILE_NAME,
      mimeType: DRIVE_MIME_TYPE,
      description: 'mm-analytics Master Ledger Data File',
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(state, null, 2) +
      closeDelimiter;

    const url = existingFileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

    const res = await fetch(url, {
      method: existingFileId ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      throw new Error(`Drive upload failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.id;
  }
}

export const driveClient = new GoogleDriveSyncClient();

