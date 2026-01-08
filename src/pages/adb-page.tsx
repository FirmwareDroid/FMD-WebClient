import { BasePage } from "@/pages/base-page.tsx";
import AdbEmulatorView from "@/components/adb-client/adb-emulator-view";

export function AdbConnectionTestPage() {
    return (
        <BasePage title="">
            <AdbEmulatorView />
        </BasePage>
    );
}
