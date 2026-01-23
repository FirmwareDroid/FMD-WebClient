// File: src/pages/emulator-page.tsx
import "../components/ui/styles/emulator.css";
import { useEffect, useState } from "react";
import { BasePage } from "@/pages/base-page.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import EmulatorTabs from "@/pages/emulator/emulator-tabs.tsx";
import AdbEmulatorView from "@/components/adb-client/adb-emulator-view";
import WebRtcEmulatorView from "@/components/webrtc-client/webrtc-emulator-view";
import { storage } from '@/services/adb-streamer/storage';

const EMU_URL_KEY = 'emulatorUri';

export function EmulatorPage() {
    const [activeTab, setActiveTab] = useState<"websocket" | "webrtc">("websocket");
    const [emuUrl, setEmuUrl] = useState<string>("");

    // Load emulator URL from local storage on mount (if previously provided)
    useEffect(() => {
        try {
            const stored = storage.getLocal(EMU_URL_KEY) || storage.getSession(EMU_URL_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (typeof parsed === 'string' && parsed.trim()) {
                        setEmuUrl(parsed);
                    }
                } catch {
                    // not JSON; use raw
                    if (typeof stored === 'string' && stored.trim()) setEmuUrl(stored);
                }
            }
        } catch (e) {
            // ignore
        }
    }, []);

    // Persist emulator URL to local storage whenever it changes (or remove when empty)
    useEffect(() => {
        try {
            if (emuUrl && emuUrl.trim()) {
                storage.setLocal(EMU_URL_KEY, JSON.stringify(emuUrl));
            } else {
                storage.removeLocal(EMU_URL_KEY);
            }
        } catch (e) {
            // ignore
        }
    }, [emuUrl]);

    return (
        <BasePage title="Device Streaming">
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, width: "100%" }}>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", alignItems: "center" }}>
                    <EmulatorTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>

            {!emuUrl.trim() && (
                <Card className="w-full max-w-5xl">
                    <CardContent>
                        <p className="text-body">
                            On this page, you can connect to an emulator. Select connection type and provide the emulator
                            URL above.
                        </p>
                    </CardContent>
                </Card>
            )}

            <div style={{ marginTop: 12, width: "100%" }}>
                {activeTab === "websocket" ? (
                    // Cast props to any to work around typing mismatch for AdbEmulatorView
                    <AdbEmulatorView {...({ backendBaseUrl: emuUrl } as any)} />
                ) : (
                    <WebRtcEmulatorView emuUrl={emuUrl} />
                )}
            </div>
        </BasePage>
    );
}

export default EmulatorPage;
