import * as Tabs from "@radix-ui/react-tabs";
import { Play, Video } from "lucide-react";

type TabValue = "websocket" | "webrtc";

interface Props {
    activeTab: TabValue;
    setActiveTab: (v: TabValue) => void;
    tabsListStyle?: React.CSSProperties;
    tabButtonBase?: React.CSSProperties;
    tabActiveExtra?: React.CSSProperties;
}

export function EmulatorTabs({
                                 activeTab,
                                 setActiveTab,
                                 tabsListStyle = {},
                                 tabButtonBase = {},
                                 tabActiveExtra = {},
                             }: Props) {
    return (
        <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <Tabs.List style={tabsListStyle} aria-label="Connection type">
                <Tabs.Trigger value="websocket" asChild>
                    <button
                        type="button"
                        className="emulator-button"
                        style={{
                            ...tabButtonBase,
                            ...(activeTab === "websocket" ? tabActiveExtra : {}),
                            borderRadius: 8,
                            paddingLeft: 12,
                            paddingRight: 12,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                        aria-pressed={activeTab === "websocket"}
                    >
                        <Play size={14} />
                        <span style={{ fontSize: 13 }}>WebSocket</span>
                    </button>
                </Tabs.Trigger>

                <Tabs.Trigger value="webrtc" asChild>
                    <button
                        type="button"
                        className="emulator-button"
                        style={{
                            ...tabButtonBase,
                            ...(activeTab === "webrtc" ? tabActiveExtra : {}),
                            borderRadius: 8,
                            paddingLeft: 12,
                            paddingRight: 12,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                        aria-pressed={activeTab === "webrtc"}
                    >
                        <Video size={14} />
                        <span style={{ fontSize: 13 }}>WebRTC</span>
                    </button>
                </Tabs.Trigger>
            </Tabs.List>
        </Tabs.Root>
    );
}

export default EmulatorTabs;
