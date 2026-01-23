import React, { useState, useRef } from 'react';
import { useFileStore } from '@/stores/file';
import { getFileSizeInMb } from '@/services/adb-streamer/utils/file';
import { FILE_EXTENSIONS } from '@/services/adb-streamer/utils/constants';

const FileUpload: React.FC = () => {
  const fileStore = useFileStore();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedExtensions = FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',');

  const prepareFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onCancel = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onUpload = async () => {
    if (files.length > 0) {
      try {
        setIsUploading(true);
        const fileList = new DataTransfer();
        files.forEach((file) => fileList.items.add(file));
        await fileStore.upload(fileList.files);
        await fileStore.getUplaods();
        onCancel();
        setIsUploading(false);
      } catch (e) {
        setIsUploading(false);
      }
    }
  };

  const largeFiles = files.filter((file) => Number(getFileSizeInMb(file)) > 4096);

  return (
    <div style={{ paddingTop: '40px' }}>
      {files.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <hr style={{ margin: '12px 0' }} />
          <div style={{ marginTop: '12px', marginBottom: '12px' }}>
            <strong style={{ color: '#666' }}>APK files to upload:</strong>
          </div>
          {!isUploading && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Size</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{file.name}</td>
                      <td style={{ padding: '12px' }}>{`${getFileSizeInMb(file)} MB`}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => removeFile(i)}
                          style={{
                            padding: '6px',
                            border: 'none',
                            background: 'none',
                            color: 'red',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                          }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onCancel}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={onUpload}
                  disabled={largeFiles.length > 0}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: largeFiles.length > 0 ? '#ccc' : '#1976d2',
                    color: 'white',
                    cursor: largeFiles.length > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Upload
                </button>
              </div>
            </>
          )}
          {isUploading && (
            <div style={{ padding: '20px 0' }}>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#1976d2',
                    animation: 'progress 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      <form id="file-form">
        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
          <div
            style={{
              border: '2px dashed #ccc',
              borderRadius: '4px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              multiple
              accept={supportedExtensions}
              onChange={prepareFiles}
              style={{ display: 'none' }}
            />
            <div>Select your files</div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '8px' }}>
              Click to browse or drag and drop files here
            </div>
          </div>
        </label>
      </form>
      <style>
        {`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
        `}
      </style>
    </div>
  );
};

export default FileUpload;
