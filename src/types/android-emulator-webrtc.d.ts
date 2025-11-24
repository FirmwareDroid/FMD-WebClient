// typescript
declare module "android-emulator-webrtc/emulator" {
    import * as React from "react";

    interface EmulatorProps {
        uri: string;
        width?: number | string;
        height?: number | string;
        onError?: (error: any) => void;
        onStateChange?: (state: string) => void;
        onAudioStateChange?: (hasAudio: boolean) => void;
        view?: string;
        gps?: any;
        volume?: number;
        muted?: boolean;
        [key: string]: any;
    }

    export const Emulator: React.ComponentType<EmulatorProps>;
    export default Emulator;
}
