import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFileStore } from '@/stores/file';

vi.mock('@/services/adb-streamer/file/file-service.ts', () => ({
    fileUploadService: {
        upload: vi.fn(),
        getUploads: vi.fn(),
        getApps: vi.fn(),
    },
}));

import { fileUploadService } from '@/services/adb-streamer/file/file-service.ts';

const mockedUpload = vi.mocked(fileUploadService.upload);
const mockedGetUploads = vi.mocked(fileUploadService.getUploads);
const mockedGetApps = vi.mocked(fileUploadService.getApps);

beforeEach(() => {
    useFileStore.setState({ files: [], apps: [] });
    vi.clearAllMocks();
});

describe('useFileStore – initial state', () => {
    it('starts with empty files and apps', () => {
        const { files, apps } = useFileStore.getState();
        expect(files).toEqual([]);
        expect(apps).toEqual([]);
    });
});

describe('useFileStore.setFiles', () => {
    it('updates the files list', () => {
        useFileStore.getState().setFiles(['a.apk', 'b.apk']);
        expect(useFileStore.getState().files).toEqual(['a.apk', 'b.apk']);
    });
});

describe('useFileStore.setApps', () => {
    it('updates the apps list', () => {
        useFileStore.getState().setApps(['app1', 'app2']);
        expect(useFileStore.getState().apps).toEqual(['app1', 'app2']);
    });
});

describe('useFileStore.upload', () => {
    it('stores returned file list and returns the result', async () => {
        mockedUpload.mockResolvedValue({ data: ['uploaded.apk'] } as any);

        const fakeFile = new File(['content'], 'test.apk');
        const fileList = [fakeFile] as unknown as FileList;
        const result = await useFileStore.getState().upload(fileList);

        expect(mockedUpload).toHaveBeenCalledWith(fileList, {});
        expect(useFileStore.getState().files).toEqual(['uploaded.apk']);
        expect(result.data).toEqual(['uploaded.apk']);
    });

    it('does not update files when API returns no data', async () => {
        mockedUpload.mockResolvedValue({ data: null } as any);

        const fileList = [] as unknown as FileList;
        await useFileStore.getState().upload(fileList);

        expect(useFileStore.getState().files).toEqual([]);
    });
});

describe('useFileStore.getUplaods', () => {
    it('updates files from API response', async () => {
        mockedGetUploads.mockResolvedValue({ data: ['remote.apk'] } as any);

        await useFileStore.getState().getUplaods();

        expect(useFileStore.getState().files).toEqual(['remote.apk']);
    });

    it('does not update files when API returns no data', async () => {
        mockedGetUploads.mockResolvedValue({ data: null } as any);

        await useFileStore.getState().getUplaods();

        expect(useFileStore.getState().files).toEqual([]);
    });
});

describe('useFileStore.getApps', () => {
    it('updates apps from API response', async () => {
        mockedGetApps.mockResolvedValue({ data: ['com.example.app'] } as any);

        await useFileStore.getState().getApps();

        expect(useFileStore.getState().apps).toEqual(['com.example.app']);
    });

    it('does not update apps when API returns no data', async () => {
        mockedGetApps.mockResolvedValue({ data: null } as any);

        await useFileStore.getState().getApps();

        expect(useFileStore.getState().apps).toEqual([]);
    });
});
