/**
 * Android SDK version to Android version name mapping.
 */
export const SDK_TO_ANDROID_VERSION: Record<number, string> = {
    36: "Android 16 (Baklava)",
    35: "Android 15 (Vanilla Ice Cream)",
    34: "Android 14 (Upside Down Cake)",
    33: "Android 13 (Tiramisu)",
    32: "Android 12L",
    31: "Android 12 (Snow Cone)",
    30: "Android 11 (Red Velvet Cake)",
    29: "Android 10 (Quince Tart)",
    28: "Android 9 (Pie)",
    27: "Android 8.1 (Oreo)",
    26: "Android 8.0 (Oreo)",
    25: "Android 7.1 (Nougat)",
    24: "Android 7.0 (Nougat)",
    23: "Android 6.0 (Marshmallow)",
    22: "Android 5.1 (Lollipop)",
    21: "Android 5.0 (Lollipop)",
    19: "Android 4.4 (KitKat)",
    18: "Android 4.3 (Jelly Bean)",
    17: "Android 4.2 (Jelly Bean)",
    16: "Android 4.1 (Jelly Bean)",
    15: "Android 4.0.3 (Ice Cream Sandwich)",
    14: "Android 4.0 (Ice Cream Sandwich)",
};

export const DANGEROUS_PERMISSIONS = new Set<string>([
    "android.permission.READ_CALENDAR",
    "android.permission.WRITE_CALENDAR",
    "android.permission.CAMERA",
    "android.permission.READ_CONTACTS",
    "android.permission.WRITE_CONTACTS",
    "android.permission.GET_ACCOUNTS",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.ACCESS_BACKGROUND_LOCATION",
    "android.permission.RECORD_AUDIO",
    "android.permission.READ_PHONE_STATE",
    "android.permission.READ_PHONE_NUMBERS",
    "android.permission.CALL_PHONE",
    "android.permission.ANSWER_PHONE_CALLS",
    "android.permission.READ_CALL_LOG",
    "android.permission.WRITE_CALL_LOG",
    "android.permission.ADD_VOICEMAIL",
    "android.permission.USE_SIP",
    "android.permission.BODY_SENSORS",
    "android.permission.BODY_SENSORS_BACKGROUND",
    "android.permission.SEND_SMS",
    "android.permission.RECEIVE_SMS",
    "android.permission.READ_SMS",
    "android.permission.RECEIVE_WAP_PUSH",
    "android.permission.RECEIVE_MMS",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.ACCESS_MEDIA_LOCATION",
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.NEARBY_WIFI_DEVICES",
    "android.permission.BLUETOOTH_SCAN",
    "android.permission.BLUETOOTH_CONNECT",
    "android.permission.BLUETOOTH_ADVERTISE",
    "android.permission.READ_MEDIA_AUDIO",
    "android.permission.READ_MEDIA_IMAGES",
    "android.permission.READ_MEDIA_VIDEO",
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.WRITE_SETTINGS",
]);

export interface ManifestPermission {
    name: string;
    isDangerous: boolean;
    protectionLevel?: string;
    maxSdkVersion?: string;
}

export interface ManifestComponent {
    name: string;
    exported: boolean | null;
    permission?: string;
    authorities?: string;
    actions: string[];
}

export interface ManifestFeature {
    name: string;
    required: boolean;
}

export interface ParsedAndroidManifest {
    packageName?: string;
    versionCode?: string;
    versionName?: string;
    minSdkVersion?: string;
    targetSdkVersion?: string;
    compileSdkVersion?: string;
    sharedUserId?: string;
    appLabel?: string;
    appComponentFactory?: string;
    debuggable?: boolean;
    allowBackup?: boolean;
    usesCleartextTraffic?: boolean;
    extractNativeLibs?: boolean;
    permissions: ManifestPermission[];
    declaredPermissions: ManifestPermission[];
    activities: ManifestComponent[];
    services: ManifestComponent[];
    receivers: ManifestComponent[];
    providers: ManifestComponent[];
    features: ManifestFeature[];
    rawJson: Record<string, unknown>;
}

/**
 * Extracts attribute value regardless of XML namespace prefixes (@ns0:, @android:, @, or bare).
 */
export function getXmlAttr(obj: unknown, attrName: string): string | undefined {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return undefined;
    const rec = obj as Record<string, unknown>;

    const directCandidates = [
        `@ns0:${attrName}`,
        `@android:${attrName}`,
        `@${attrName}`,
        attrName,
    ];

    for (const key of directCandidates) {
        const val = rec[key];
        if (val !== undefined && val !== null) {
            return String(val).trim();
        }
    }

    const lower = attrName.toLowerCase();
    for (const [key, val] of Object.entries(rec)) {
        const cleaned = key.replace(/^@(?:ns\d+:|android:)?/, "").toLowerCase();
        if (cleaned === lower && val !== undefined && val !== null) {
            return String(val).trim();
        }
    }

    return undefined;
}

/**
 * Converts a value that may be a single item, an array, or undefined into a typed array.
 */
export function toSafeArray<T = unknown>(val: unknown): T[] {
    if (val === null || val === undefined) return [];
    if (Array.isArray(val)) return val as T[];
    return [val as T];
}

/**
 * Helper to get a child element by name regardless of namespace.
 */
export function getXmlChild<T = Record<string, unknown>>(obj: unknown, tagName: string): T | undefined {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return undefined;
    const rec = obj as Record<string, unknown>;

    const candidates = [tagName, tagName.toLowerCase(), `ns0:${tagName}`, `android:${tagName}`];
    for (const key of candidates) {
        if (rec[key] !== undefined && rec[key] !== null) {
            return rec[key] as T;
        }
    }

    const lower = tagName.toLowerCase();
    for (const [key, val] of Object.entries(rec)) {
        if (key.toLowerCase() === lower && val !== undefined && val !== null) {
            return val as T;
        }
    }

    return undefined;
}

export function getAndroidCodename(sdk: string | number | null | undefined): string | null {
    if (sdk === undefined || sdk === null) return null;
    const num = typeof sdk === "number" ? sdk : parseInt(sdk, 10);
    if (Number.isNaN(num)) return null;
    return SDK_TO_ANDROID_VERSION[num] ?? null;
}

function parseBooleanAttr(val: string | undefined): boolean | undefined {
    if (val === undefined) return undefined;
    const norm = val.toLowerCase().trim();
    if (norm === "true" || norm === "1") return true;
    if (norm === "false" || norm === "0") return false;
    return undefined;
}

function extractIntentActions(component: unknown): string[] {
    if (!component || typeof component !== "object") return [];
    const intentFilters = toSafeArray(getXmlChild(component, "intent-filter"));
    const actions: string[] = [];

    for (const filter of intentFilters) {
        if (!filter || typeof filter !== "object") continue;
        const actionNodes = toSafeArray(getXmlChild(filter, "action"));
        for (const action of actionNodes) {
            const name = getXmlAttr(action, "name");
            if (name) actions.push(name);
        }
    }

    return actions;
}

function parseComponent(comp: unknown): ManifestComponent | null {
    if (!comp || typeof comp !== "object") return null;
    const name = getXmlAttr(comp, "name");
    if (!name) return null;

    const exportedRaw = getXmlAttr(comp, "exported");
    const exported = parseBooleanAttr(exportedRaw) ?? null;
    const permission = getXmlAttr(comp, "permission");
    const authorities = getXmlAttr(comp, "authorities");
    const actions = extractIntentActions(comp);

    return {
        name,
        exported,
        permission,
        authorities,
        actions,
    };
}

/**
 * Parses raw manifest dictionary (object or JSON string) into a structured ParsedAndroidManifest.
 * Returns null if the manifest is empty, nullish, or invalid.
 */
export function parseAndroidManifest(rawInput: unknown): ParsedAndroidManifest | null {
    if (!rawInput) return null;

    let raw: Record<string, unknown>;
    if (typeof rawInput === "string") {
        try {
            raw = JSON.parse(rawInput);
        } catch {
            return null;
        }
    } else if (typeof rawInput === "object") {
        raw = rawInput as Record<string, unknown>;
    } else {
        return null;
    }

    if (!raw || Object.keys(raw).length === 0) {
        return null;
    }

    // Root is usually {"manifest": {...}} or direct {...}
    const manifestRoot = (getXmlChild(raw, "manifest") as Record<string, unknown>) ?? raw;
    if (!manifestRoot || typeof manifestRoot !== "object" || Object.keys(manifestRoot).length === 0) {
        return null;
    }

    const packageName = getXmlAttr(manifestRoot, "package");
    const versionCode = getXmlAttr(manifestRoot, "versionCode");
    const versionName = getXmlAttr(manifestRoot, "versionName");
    const compileSdkVersion = getXmlAttr(manifestRoot, "compileSdkVersion");
    const sharedUserId = getXmlAttr(manifestRoot, "sharedUserId");

    // uses-sdk
    const usesSdk = getXmlChild(manifestRoot, "uses-sdk");
    const minSdkVersion = getXmlAttr(usesSdk, "minSdkVersion");
    const targetSdkVersion = getXmlAttr(usesSdk, "targetSdkVersion");

    // application
    const application = getXmlChild(manifestRoot, "application");
    const appLabel = getXmlAttr(application, "label");
    const appComponentFactory = getXmlAttr(application, "appComponentFactory");
    const debuggable = parseBooleanAttr(getXmlAttr(application, "debuggable"));
    const allowBackup = parseBooleanAttr(getXmlAttr(application, "allowBackup"));
    const usesCleartextTraffic = parseBooleanAttr(getXmlAttr(application, "usesCleartextTraffic"));
    const extractNativeLibs = parseBooleanAttr(getXmlAttr(application, "extractNativeLibs"));

    // uses-permission
    const permissions: ManifestPermission[] = [];
    const usesPermNodes = toSafeArray(getXmlChild(manifestRoot, "uses-permission"));
    for (const node of usesPermNodes) {
        const name = getXmlAttr(node, "name");
        if (name) {
            permissions.push({
                name,
                isDangerous: DANGEROUS_PERMISSIONS.has(name),
                maxSdkVersion: getXmlAttr(node, "maxSdkVersion"),
            });
        }
    }

    // permission (custom declared permissions)
    const declaredPermissions: ManifestPermission[] = [];
    const declaredPermNodes = toSafeArray(getXmlChild(manifestRoot, "permission"));
    for (const node of declaredPermNodes) {
        const name = getXmlAttr(node, "name");
        if (name) {
            declaredPermissions.push({
                name,
                isDangerous: DANGEROUS_PERMISSIONS.has(name),
                protectionLevel: getXmlAttr(node, "protectionLevel"),
            });
        }
    }

    // Components inside <application>
    const activities: ManifestComponent[] = [];
    for (const act of toSafeArray(getXmlChild(application, "activity"))) {
        const parsed = parseComponent(act);
        if (parsed) activities.push(parsed);
    }

    const services: ManifestComponent[] = [];
    for (const srv of toSafeArray(getXmlChild(application, "service"))) {
        const parsed = parseComponent(srv);
        if (parsed) services.push(parsed);
    }

    const receivers: ManifestComponent[] = [];
    for (const rec of toSafeArray(getXmlChild(application, "receiver"))) {
        const parsed = parseComponent(rec);
        if (parsed) receivers.push(parsed);
    }

    const providers: ManifestComponent[] = [];
    for (const prov of toSafeArray(getXmlChild(application, "provider"))) {
        const parsed = parseComponent(prov);
        if (parsed) providers.push(parsed);
    }

    // uses-feature
    const features: ManifestFeature[] = [];
    for (const feat of toSafeArray(getXmlChild(manifestRoot, "uses-feature"))) {
        const name = getXmlAttr(feat, "name");
        if (name) {
            const reqRaw = getXmlAttr(feat, "required");
            const required = parseBooleanAttr(reqRaw) ?? true;
            features.push({ name, required });
        }
    }

    // Only return parsed manifest if at least one meaningful attribute was discovered
    const hasMeaningfulData = Boolean(
        packageName ||
        versionCode ||
        versionName ||
        targetSdkVersion ||
        minSdkVersion ||
        permissions.length > 0 ||
        activities.length > 0 ||
        services.length > 0 ||
        receivers.length > 0 ||
        providers.length > 0
    );

    if (!hasMeaningfulData) {
        return null;
    }

    return {
        packageName,
        versionCode,
        versionName,
        minSdkVersion,
        targetSdkVersion,
        compileSdkVersion,
        sharedUserId,
        appLabel,
        appComponentFactory,
        debuggable,
        allowBackup,
        usesCleartextTraffic,
        extractNativeLibs,
        permissions,
        declaredPermissions,
        activities,
        services,
        receivers,
        providers,
        features,
        rawJson: raw,
    };
}
