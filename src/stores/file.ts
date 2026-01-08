import { create } from 'zustand';
import { fileUploadService } from '@/services/adb-streamer/file/file-service.ts';

interface FileState {
  files: string[];
  apps: string[];
  setFiles: (files: string[]) => void;
  setApps: (files: string[]) => void;
  upload: (files: FileList, params?: any) => Promise<any>;
  getUplaods: (params?: any) => Promise<void>;
  getApps: (params?: any) => Promise<void>;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  apps: [],

  setFiles: (files) => {
    set({ files });
  },

  setApps: (files) => {
    set({ apps: files });
  },

  upload: async (files, params = {}) => {
    const result = await fileUploadService.upload(files, params);
    if (result.data) {
      set({ files: result.data });
      return result;
    }
  },

  getUplaods: async (params) => {
    const result = await fileUploadService.getUploads(params);
    if (result.data) {
      set({ files: result.data });
    }
  },

  getApps: async (params) => {
    const result = await fileUploadService.getApps(params);
    if (result.data) {
      set({ apps: result.data });
    }
  },
}));
