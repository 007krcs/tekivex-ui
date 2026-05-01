/**
 * Thin fetch helpers around the ShubhBio backend. Endpoints are documented in
 * apps/api/src/routes — any change there should be mirrored here.
 */

import { ENV } from './env';
import type { Biodata } from '@shubhbio/schemas';

interface ApiError extends Error {
  status: number;
  payload?: unknown;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${ENV.apiBase}${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const err = new Error(`api ${path} failed: ${res.status}`) as ApiError;
    err.status = res.status;
    try {
      err.payload = await res.json();
    } catch {
      /* ignore body */
    }
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  /* Drafts (anonymous, cookie-bound) */
  createDraft(input: { religion: string; templateId: string }) {
    return request<{ draftId: string }>('/draft', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  saveDraft(draftId: string, biodata: Partial<Biodata>) {
    return request<{ ok: true }>(`/draft/${draftId}`, {
      method: 'PUT',
      body: JSON.stringify(biodata),
    });
  },
  getDraft(draftId: string) {
    return request<{ draftId: string; biodata: Partial<Biodata>; templateId: string }>(
      `/draft/${draftId}`,
    );
  },

  /* Photo upload (returns photoId stored on the server) */
  async uploadPhoto(draftId: string, blob: Blob) {
    const form = new FormData();
    form.append('photo', blob, 'profile.jpg');
    const res = await fetch(`${ENV.apiBase}/draft/${draftId}/photo`, {
      method: 'POST',
      credentials: 'same-origin',
      body: form,
    });
    if (!res.ok) throw new Error(`upload failed: ${res.status}`);
    return res.json() as Promise<{ photoId: string }>;
  },

  /* Payment */
  createOrder(draftId: string) {
    return request<{ orderId: string; amount: number; currency: string }>(
      `/pay/${draftId}/order`,
      { method: 'POST' },
    );
  },
  verifyPayment(args: {
    draftId: string;
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    return request<{ downloadUrl: string }>('/pay/verify', {
      method: 'POST',
      body: JSON.stringify(args),
    });
  },

  /* Templates */
  listTemplates(audience?: string) {
    const q = audience ? `?audience=${encodeURIComponent(audience)}` : '';
    return request<Array<{ id: string; label: string; audience: string }>>(
      `/templates${q}`,
    );
  },
};
