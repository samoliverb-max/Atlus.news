const productUrl = (
  import.meta.env.VITE_APP_URL?.trim() ||
  (import.meta.env.DEV ? "http://localhost:3000" : "https://app.joinatlus.com")
).replace(/\/$/, "");

export const joinUrl = import.meta.env.DEV
  ? `${productUrl}/onboarding`
  : `${productUrl}/login?mode=signup`;

export const signInUrl = `${productUrl}/login`;

// Temporary route while some networks still cache an old DNS answer for the app subdomain.
const backupProductUrl = (
  import.meta.env.VITE_APP_BACKUP_URL?.trim() || "https://atlus-mvp-deploy.vercel.app"
).replace(/\/$/, "");

export const backupJoinUrl = `${backupProductUrl}/login?mode=signup`;
export const backupSignInUrl = `${backupProductUrl}/login`;
