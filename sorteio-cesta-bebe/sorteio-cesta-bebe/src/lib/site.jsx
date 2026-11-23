import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, configured } from './supabase.js';
import { DEFAULT_META_PIXEL_ID, loadPixel, revokePixel } from './pixel.js';

const PIXEL_CONSENT_KEY = 'sorteiobb_meta_pixel_consent_v1';
const Ctx = createContext({ status: null, settings: {}, reload: () => {}, pixelConsent: 'unset', setPixelConsent: () => {} });
export const useSite = () => useContext(Ctx);

function readPixelConsent() {
  try {
    const value = localStorage.getItem(PIXEL_CONSENT_KEY);
    return value === 'accepted' || value === 'rejected' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

export function SiteProvider({ children }) {
  const [status, setStatus] = useState(null);
  const [pixelConsent, setPixelConsentState] = useState(readPixelConsent);

  const reload = useCallback(async () => {
    if (!configured) return;
    const { data, error } = await supabase.rpc('public_status');
    if (!error && data) setStatus(data);
  }, []);

  const setPixelConsent = useCallback((choice) => {
    const next = choice === 'accepted' || choice === 'rejected' ? choice : 'unset';
    try {
      if (next === 'unset') localStorage.removeItem(PIXEL_CONSENT_KEY);
      else localStorage.setItem(PIXEL_CONSENT_KEY, next);
    } catch {
      // A preferência ainda vale durante esta sessão, mesmo se o navegador bloquear armazenamento local.
    }
    setPixelConsentState(next);
    if (next !== 'accepted') revokePixel();
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (pixelConsent === 'accepted' && status) {
      loadPixel(DEFAULT_META_PIXEL_ID);
    }
    if (pixelConsent === 'rejected') revokePixel();
  }, [pixelConsent, status]);

  return (
    <Ctx.Provider value={{ status, settings: status?.settings || {}, reload, pixelConsent, setPixelConsent }}>
      {children}
    </Ctx.Provider>
  );
}
