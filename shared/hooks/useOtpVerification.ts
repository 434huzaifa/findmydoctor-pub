"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useRequestLookupOtpMutation,
  useVerifyLookupOtpMutation,
} from "@/store/fmdApi";

export function useOtpVerification(phone: string) {
  const [step, setStep] = useState<"info" | "otp">("info");
  const [otpValue, setOtpValue] = useState("");

  const [requestOtp, { isLoading: isRequesting }] =
    useRequestLookupOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyLookupOtpMutation();

  async function goToOtpStep() {
    try {
      await requestOtp({ phone }).unwrap();
      setStep("otp");
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message ??
          "Failed to send OTP"
      );
    }
  }

  async function verify(): Promise<string> {
    const result = await verifyOtp({ phone, otp: otpValue }).unwrap();
    return result.otpToken;
  }

  function reset() {
    setStep("info");
    setOtpValue("");
  }

  return {
    step,
    otpValue,
    setOtpValue,
    goToOtpStep,
    verify,
    reset,
    isRequesting,
    isVerifying,
  };
}
