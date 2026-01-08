import React, { useState } from 'react';
import { useAdbStore } from '@/stores/adb';
import { useFileStore } from '@/stores/file';
import { useToastStore } from '@/stores/toast';
import { adbService } from '@/services/adb-streamer/adb/adb-service.ts';
import FileUpload from './FileUpload';

const FileList: React.FC = () => {
  const adbStore = useAdbStore();
  const fileStore = useFileStore();
  const toastStore = useToastStore();
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

  const install = async (fileName: string, device: string | null, source: string) => {
    const toastTimeout = 5000;
    const toast = toastStore.info('Install in progress...', toastTimeout);
    const { data } = await adbService.install({ app: fileName, device, source });
    toastStore.remove(toast);
    if (data.logs?.length) {
      toastStore.success(data.logs, toastTimeout);
    }
    if (data.errors?.length) {
      toastStore.error(data.errors, toastTimeout);
    }
  };

  const start = async (fileName: string, device: string | null) => {
    const toastTimeout = 5000;
    const toast = toastStore.info('Start in progress...', toastTimeout);
    const { data } = await adbService.start({ app: fileName, device });
    toastStore.remove(toast);
    if (data.logs?.length) {
      toastStore.success(data.logs, toastTimeout);
    }
    if (data.errors?.length) {
      toastStore.error(data.errors, toastTimeout);
    }
  };

  const pin = async (fileName: string, device: string | null) => {
    const toastTimeout = 5000;
    const toast = toastStore.info('Pin in progress...', toastTimeout);
    const { data } = await adbService.pin({ app: fileName, device });
    toastStore.remove(toast);
    if (data.logs?.length) {
      toastStore.success(data.logs, toastTimeout);
    }
    if (data.errors?.length) {
      toastStore.error(data.errors, toastTimeout);
    }
  };

  const unpin = async (fileName: string, device: string | null) => {
    const toastTimeout = 5000;
    const toast = toastStore.info('Unpin in progress...', toastTimeout);
    const { data } = await adbService.unpin({ app: fileName, device });
    toastStore.remove(toast);
    if (data.logs?.length) {
      toastStore.success(data.logs, toastTimeout);
    }
    if (data.errors?.length) {
      toastStore.error(data.errors, toastTimeout);
    }
  };

  const togglePanel = (panel: string) => {
    setExpandedPanels((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );
  };

  const renderFileTable = (files: string[], source: string) => {
    if (!files?.length) {
      return (
        <div
          style={{
            padding: '8px 16px',
            margin: '8px',
            backgroundColor: '#ff9800',
            color: 'white',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        >
          No apps available
        </div>
      );
    }

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
            <th style={{ textAlign: 'center', padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ textAlign: 'left', padding: '12px' }}>{file}</td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <button
                  onClick={() => install(file, adbStore.device, source)}
                  title="Install"
                  style={{
                    padding: '6px',
                    margin: '0 4px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ⚙️
                </button>
                <button
                  onClick={() => start(file, adbStore.device)}
                  title="Start"
                  style={{
                    padding: '6px',
                    margin: '0 4px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ▶️
                </button>
                <button
                  onClick={() => pin(file, adbStore.device)}
                  title="Pin"
                  style={{
                    padding: '6px',
                    margin: '0 4px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  📌
                </button>
                <button
                  onClick={() => unpin(file, adbStore.device)}
                  title="Unpin"
                  style={{
                    padding: '6px',
                    margin: '0 4px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  📍
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px' }}>
        <div
          onClick={() => togglePanel('apps')}
          style={{
            padding: '12px',
            cursor: 'pointer',
            backgroundColor: '#f5f5f5',
            borderBottom: expandedPanels.includes('apps') ? '1px solid #ddd' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>
              {expandedPanels.includes('apps') ? '📂' : '📁'}
            </span>
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#1976d2',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '0.75rem',
              }}
            >
              {fileStore.apps.length}
            </span>
          </span>
          <span
            style={{
              padding: '4px 12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          >
            /apps
          </span>
        </div>
        {expandedPanels.includes('apps') && (
          <div style={{ padding: '12px' }}>
            {renderFileTable(fileStore.apps, 'apps')}
          </div>
        )}
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
        <div
          onClick={() => togglePanel('uploads')}
          style={{
            padding: '12px',
            cursor: 'pointer',
            backgroundColor: '#f5f5f5',
            borderBottom: expandedPanels.includes('uploads') ? '1px solid #ddd' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>
              {expandedPanels.includes('uploads') ? '📂' : '📁'}
            </span>
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#1976d2',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '0.75rem',
              }}
            >
              {fileStore.files.length}
            </span>
          </span>
          <span
            style={{
              padding: '4px 12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          >
            /uploads
          </span>
        </div>
        {expandedPanels.includes('uploads') && (
          <div style={{ padding: '12px' }}>
            {renderFileTable(fileStore.files, 'uploads')}
            <FileUpload />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileList;
