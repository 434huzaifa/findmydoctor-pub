"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useGetConsultationQuery } from "@/store/fmdApi";

export default function ConsultationWaitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [dots, setDots] = useState("");

  const { data: consultation, isLoading } = useGetConsultationQuery(
    parseInt(id),
    { pollingInterval: 5000 }
  );

  useEffect(() => {
    const i = setInterval(() => setDots((p) => (p.length >= 3 ? "" : p + ".")), 500);
    return () => clearInterval(i);
  }, []);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Consultation not found</p>
          <Link href="/" className="text-blue-600 hover:underline">Return home</Link>
        </div>
      </div>
    );
  }

  // ─── ACTIVE — Immersive Jitsi ─────────────────────────────────────────────
  if (consultation.status === "active" && consultation.videoLink) {
    const doctorName = consultation.doctor?.name ?? "Doctor";
    return (
      <div className="h-screen bg-[#16161e] flex flex-col overflow-hidden">
        {/* Minimal top bar */}
        <div className="bg-[#1e1e2e] border-b border-white/10 px-4 py-2 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-green-400 animate-pulse">●</span>
            <span className="text-white/90 text-sm font-medium">{doctorName}</span>
            <span className="text-white/40 text-xs">· #{consultation.id}</span>
          </div>
          <Link href="/" className="text-white/40 text-xs hover:text-white/70">Leave</Link>
        </div>

        {/* Jitsi — takes all remaining space */}
        <JitsiEmbed
          roomUrl={consultation.videoLink}
          userName={consultation.patientName}
          doctorName={doctorName}
        />

        {/* Prescription overlay */}
        {consultation.prescriptionText && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 z-10">
            <div className="max-w-2xl mx-auto rounded-xl bg-purple-900/60 backdrop-blur-sm border border-purple-500/30 p-4">
              <p className="text-purple-300 text-xs font-semibold mb-1">📝 Prescription from {doctorName}</p>
              <pre className="text-purple-100 text-sm font-mono whitespace-pre-wrap leading-relaxed">{consultation.prescriptionText}</pre>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── DONE ─────────────────────────────────────────────────────────────────
  if (consultation.status === "done") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-white border shadow-lg p-8 text-center">
          <span className="text-6xl">✅</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Consultation Complete</h1>
          <p className="mt-2 text-gray-600">Thank you for your visit.</p>
          {consultation.prescriptionText && (
            <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-4 text-left">
              <p className="text-xs font-semibold text-purple-700 mb-1">📝 Your Prescription</p>
              <pre className="whitespace-pre-wrap text-sm text-purple-900 font-mono">{consultation.prescriptionText}</pre>
            </div>
          )}
          <Link href="/" className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // ─── WAITING ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl bg-white border border-blue-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
            <span className="text-5xl animate-bounce">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Waiting for Doctor{dots}</h1>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-blue-800 font-medium">{consultation.patientName}</p>
            <p className="text-sm text-blue-700">{consultation.patientPhone}</p>
          </div>
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-center text-sm text-gray-600">You are in the queue. The doctor will accept you shortly.</p>
          <p className="text-center text-xs text-gray-400">Auto-refreshes every 5 seconds</p>
        </div>
      </div>
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}

// ─── Immersive Jitsi Embed ──────────────────────────────────────────────────

function JitsiEmbed({ roomUrl, userName, doctorName }: { roomUrl: string; userName: string; doctorName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<unknown>(null);
  const [loaded, setLoaded] = useState(false);

  const roomName = roomUrl.replace("https://meet.jit.si/", "");

  const initJitsi = useCallback(() => {
    if (!containerRef.current || apiRef.current) return;

    const JitsiMeetExternalAPI = (window as unknown as Record<string, unknown>)
      .JitsiMeetExternalAPI as
      | (new (domain: string, options: Record<string, unknown>) => unknown)
      | undefined;

    if (!JitsiMeetExternalAPI) return;

    apiRef.current = new JitsiMeetExternalAPI("meet.jit.si", {
      roomName,
      parentNode: containerRef.current,
      userInfo: { displayName: userName },
      configOverwrite: {
        // ─── Immersive: start ready ──────────────────────────────
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: true,
        disableDeepLinking: true,

        // ─── Subject shows doctor name ───────────────────────────
        subject: `Consultation with ${doctorName}`,

        // ─── Full toolbar ────────────────────────────────────────
        toolbarButtons: [
          "camera", "chat", "closedcaptions", "desktop",
          "filmstrip", "fullscreen", "hangup", "microphone",
          "noisesuppression", "participants-pane", "profile",
          "raisehand", "select-background", "settings",
          "shareaudio", "shortcuts", "tileview", "toggle-camera",
          "videoquality", "whiteboard",
        ],

        // ─── Chat & collaboration ────────────────────────────────
        enableChat: true,
        openBridgeChannel: "websocket",

        // ─── Reactions & engagement ──────────────────────────────
        enableReactions: true,
        enableTalkWhileMuted: true,
        enableNoAudioDetection: true,
        enableNoisyMicDetection: true,

        // ─── Visual ──────────────────────────────────────────────
        disableTileView: false,
        enableLobby: false,
        hideConferenceSubject: false,
        hideConferenceTimer: false,
        hideParticipantsStats: false,
        enableInsecureRoomNameWarning: false,

        // ─── Background blur ─────────────────────────────────────
        enableVirtualBackground: true,
        disableVirtualBackground: false,

        // ─── Notifications ───────────────────────────────────────
        disableJoinLeaveNotifications: false,
        enableChatNotifications: true,

        // ─── Quality defaults ────────────────────────────────────
        resolution: 720,
        constraints: { video: { height: { ideal: 720, max: 1080, min: 240 } } },
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: "#16161e",
        TOOLBAR_ALWAYS_VISIBLE: false,
        INITIAL_TOOLBAR_TIMEOUT: 4000,
        TOOLBAR_TIMEOUT: 4000,
        SHOW_CHROME_EXTENSION_BANNER: false,
        FILM_STRIP_MAX_HEIGHT: 150,
        DISABLE_VIDEO_BACKGROUND: false,
        MOBILE_APP_PROMO: false,
        ENABLE_DIAL_OUT: false,
        DISPLAY_WELCOME_FOOTER: false,
        APP_NAME: "FindMyDoctor",
        NATIVE_APP_NAME: "FindMyDoctor",
        PROVIDER_NAME: "FindMyDoctor",
        DEFAULT_REMOTE_DISPLAY_NAME: doctorName,
        DEFAULT_LOCAL_DISPLAY_NAME: userName,
        // ─── Immersive: auto-hide toolbar ────────────────────────
        HIDE_INVITE_MORE_HEADER: true,
      },
      width: "100%",
      height: "100%",
    });

    setLoaded(true);
  }, [roomName, userName, doctorName]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (
      typeof window !== "undefined" &&
      !(window as unknown as Record<string, unknown>).JitsiMeetExternalAPI
    ) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => initJitsi();
      document.head.appendChild(script);
    } else {
      timer = setTimeout(() => initJitsi(), 0);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (apiRef.current && typeof (apiRef.current as Record<string, unknown>).dispose === "function") {
        (apiRef.current as { dispose: () => void }).dispose();
        apiRef.current = null;
      }
    };
  }, [initJitsi]);

  return (
    <div className="flex-1 relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#16161e] z-20">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-t-transparent mx-auto mb-4" />
            <p className="text-white/70 text-sm">Connecting to {doctorName}...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
