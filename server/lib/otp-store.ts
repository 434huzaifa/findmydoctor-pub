
const OTP_CODE = "1234";
const OTP_TTL_MS = 5 * 60 * 1000;
const sessions = new Map<string, { phone: string; expiresAt: number }>();
export function issueOtpToken(phone: string) {
  const token = `${phone}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  sessions.set(token, { phone, expiresAt: Date.now() + OTP_TTL_MS });
  return token;
}
export function verifyOtpToken(phone: string, token: string) {
  const s = sessions.get(token);
  if (!s) return false;
  if (s.expiresAt < Date.now()) { sessions.delete(token); return false; }
  return s.phone === phone;
}
export { OTP_CODE, OTP_TTL_MS };
