/**
 * Jitsi Meet — Free, open-source video conferencing.
 * No API key needed. No payment. Works on Vercel free tier.
 */

const JITSI_DOMAIN = "meet.jit.si";
const ROOM_PREFIX = "FMD_";

/**
 * Generate a Jitsi room URL that encodes doctor name for context.
 */
export function createVideoRoomUrl(
  consultationId: number | string,
  doctorName?: string
): string {
  // Clean doctor name for URL (remove special chars)
  const cleanName = (doctorName || "Doctor")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 30);

  const roomName = `${ROOM_PREFIX}${cleanName}_${consultationId}`;
  return `https://${JITSI_DOMAIN}/${roomName}`;
}

/**
 * Get the Jitsi domain for IFrame API.
 */
export function getJitsiDomain(): string {
  return JITSI_DOMAIN;
}

/**
 * Extract room name from full URL.
 */
export function extractRoomName(url: string): string {
  return url.replace(`https://${JITSI_DOMAIN}/`, "");
}

/** No-op — Jitsi rooms are ephemeral. */
export async function deleteVideoRoom(): Promise<void> {}
