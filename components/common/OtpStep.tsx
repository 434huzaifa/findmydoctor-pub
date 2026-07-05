"use client";

const ACCENT_BORDER_CLASSES: Record<string, string> = {
  blue: "border-blue-600",
  purple: "border-purple-600",
};

interface OtpStepProps {
  phone: string;
  otpValue: string;
  onOtpValueChange: (value: string) => void;
  onResend: () => void;
  isResending?: boolean;
  accentColor?: "blue" | "purple";
}

export function OtpStep({
  phone,
  otpValue,
  onOtpValueChange,
  onResend,
  isResending = false,
  accentColor = "blue",
}: OtpStepProps) {
  return (
    <div className="text-center py-4">
      <p className="text-sm text-gray-600 mb-1">
        Please enter the 4-digit OTP sent to
      </p>
      <p className="text-sm font-semibold text-gray-900 mb-4">{phone}</p>
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={otpValue}
        onChange={(e) => onOtpValueChange(e.target.value.replace(/\D/g, ""))}
        className={`w-32 text-center text-2xl tracking-widest rounded-lg border-2 ${ACCENT_BORDER_CLASSES[accentColor]} px-2 py-2 outline-none`}
        placeholder="0000"
        autoFocus
      />
      <div className="mt-3">
        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className="text-xs text-gray-500 underline disabled:opacity-50"
        >
          {isResending ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
