import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    KeyRoundIcon,
    ShieldAlertIcon,
    EyeIcon,
    EyeOffIcon,
    CheckCircle2Icon,
    AlertCircleIcon,
    SlidersHorizontalIcon,
    Trash2Icon,
} from "lucide-react";
import {
    useScannerConfigStore,
    validateVirusTotalApiKey,
} from "@/stores/scanner-config-store.ts";
import { useToastStore } from "@/stores/toast.ts";

export interface ScannerConfigDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialScanner?: "VIRUSTOTAL" | "TRUFFLEHOG";
    children?: React.ReactNode;
}

export function ScannerConfigDialog({
    open,
    onOpenChange,
    initialScanner = "VIRUSTOTAL",
    children,
}: Readonly<ScannerConfigDialogProps>) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

    const {
        configs,
        setVirusTotalApiKey,
        setTruffleHogScanMode,
        clearScannerConfig,
    } = useScannerConfigStore();
    const toast = useToastStore();

    const [activeTab, setActiveTab] = useState<"VIRUSTOTAL" | "TRUFFLEHOG">(initialScanner);
    const [apiKeyInput, setApiKeyInput] = useState<string>(configs.VIRUSTOTAL.apiKey || "");
    const [showKey, setShowKey] = useState<boolean>(false);
    const [truffleHogMode, setTruffleHogMode] = useState<"lightweight" | "apktool">(
        configs.TRUFFLEHOG.scanMode || "lightweight"
    );

    // Keep inputs synced when dialog opens
    const handleDialogOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setApiKeyInput(configs.VIRUSTOTAL.apiKey || "");
            setShowKey(false);
            setTruffleHogMode(configs.TRUFFLEHOG.scanMode || "lightweight");
        }
        setDialogOpen(isOpen);
    };

    const vtValidation = validateVirusTotalApiKey(apiKeyInput);
    const isVtCurrentlyConfigured = validateVirusTotalApiKey(configs.VIRUSTOTAL.apiKey || "").isValid;

    const handleSaveVirusTotal = () => {
        if (!apiKeyInput.trim()) {
            toast.error("Please enter a VirusTotal API key.");
            return;
        }
        const validation = validateVirusTotalApiKey(apiKeyInput);
        if (!validation.isValid) {
            toast.error(validation.error || "Invalid API key format.");
            return;
        }

        setVirusTotalApiKey(apiKeyInput);
        toast.success("VirusTotal API key successfully saved.");
        setDialogOpen(false);
    };

    const handleClearVirusTotal = () => {
        clearScannerConfig("VIRUSTOTAL");
        setApiKeyInput("");
        toast.success("VirusTotal API key cleared.");
    };

    const handleSaveTruffleHog = () => {
        setTruffleHogScanMode(truffleHogMode);
        toast.success("TruffleHog scan mode updated.");
        setDialogOpen(false);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
            <DialogContent className="sm:max-w-lg border-border/70 bg-card/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                        <SlidersHorizontalIcon className="size-4 text-primary" aria-hidden="true" />
                        Scanner Settings & Credentials
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Configure scanner-specific parameters and credentials required for analysis execution.
                    </DialogDescription>
                </DialogHeader>

                {/* Sub-tabs for Configurable Modules */}
                <div className="flex border-b border-border/50 gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("VIRUSTOTAL")}
                        className={`pb-2 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === "VIRUSTOTAL"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <ShieldAlertIcon className="size-3.5" />
                        VirusTotal
                        {isVtCurrentlyConfigured ? (
                            <Badge variant="outline" className="text-[10px] py-0 h-4 border-emerald-500/40 text-emerald-400">
                                Ready
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="text-[10px] py-0 h-4">
                                Setup Needed
                            </Badge>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("TRUFFLEHOG")}
                        className={`pb-2 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === "TRUFFLEHOG"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <KeyRoundIcon className="size-3.5" />
                        TruffleHog
                        <Badge variant="secondary" className="text-[10px] py-0 h-4">
                            Optional
                        </Badge>
                    </button>
                </div>

                {activeTab === "VIRUSTOTAL" && (
                    <div className="space-y-4 pt-2 text-xs">
                        <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5 space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-amber-500 dark:text-amber-400">
                                <AlertCircleIcon className="size-3.5 shrink-0" />
                                <span>API Key Mandatory for VirusTotal Scans</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                VirusTotal queries multi-engine antivirus detection for application binaries.
                                A valid VirusTotal API key must be provided before scans can be dispatched.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vt-api-key-input" className="text-xs font-medium text-foreground">
                                VirusTotal API Key:
                            </Label>
                            <div className="relative">
                                <Input
                                    id="vt-api-key-input"
                                    type={showKey ? "text" : "password"}
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    placeholder="Enter your 64-character VirusTotal API key"
                                    className="pr-10 text-xs font-mono h-9"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                    aria-label={showKey ? "Hide API key" : "Show API key"}
                                >
                                    {showKey ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                                </button>
                            </div>

                            {/* Validation status hint */}
                            {apiKeyInput.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px] pt-1">
                                    {vtValidation.isValid ? (
                                        <span className="text-emerald-500 flex items-center gap-1">
                                            <CheckCircle2Icon className="size-3" />
                                            API key format looks valid.
                                        </span>
                                    ) : (
                                        <span className="text-rose-500 flex items-center gap-1">
                                            <AlertCircleIcon className="size-3" />
                                            {vtValidation.error}
                                        </span>
                                    )}
                                </div>
                            )}

                            <p className="text-[10px] text-muted-foreground pt-1">
                                Credentials are kept safely in your client browser session storage and only sent with authenticated scan requests.
                            </p>
                        </div>

                        <DialogFooter className="flex items-center justify-between sm:justify-between pt-3 border-t border-border/50">
                            {isVtCurrentlyConfigured ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearVirusTotal}
                                    className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1.5"
                                >
                                    <Trash2Icon className="size-3.5" />
                                    Clear Saved Key
                                </Button>
                            ) : <div />}

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDialogOpen(false)}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={!vtValidation.isValid}
                                    onClick={handleSaveVirusTotal}
                                    className="text-xs"
                                >
                                    Save API Key
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                )}

                {activeTab === "TRUFFLEHOG" && (
                    <div className="space-y-4 pt-2 text-xs">
                        <div className="space-y-1">
                            <Label htmlFor="trufflehog-mode-select" className="text-xs font-medium text-foreground">
                                Scan Execution Mode:
                            </Label>
                            <Select
                                value={truffleHogMode}
                                onValueChange={(val) => setTruffleHogMode(val as "lightweight" | "apktool")}
                            >
                                <SelectTrigger id="trufflehog-mode-select" className="text-xs h-9">
                                    <SelectValue placeholder="Select scan mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lightweight" className="text-xs">
                                        Lightweight (ZIP Stream & Fast Regex Matching)
                                    </SelectItem>
                                    <SelectItem value="apktool" className="text-xs">
                                        Apktool (Full Resource Decompilation)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground pt-1">
                                Lightweight mode is recommended for mass indexing, scanning raw binaries directly. Apktool mode produces deeper coverage of manifest resources.
                            </p>
                        </div>

                        <DialogFooter className="flex items-center justify-end pt-3 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDialogOpen(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveTruffleHog}
                                className="text-xs"
                            >
                                Apply Mode
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
