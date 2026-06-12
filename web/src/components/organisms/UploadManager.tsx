"use client";

import React, { useCallback, memo } from 'react';
import { message, Row, Col } from 'antd';
import { useUploaderStore } from '@store';
import { useUploader } from '@hooks';
import { Dropzone, UploadList } from '@molecules';
import { MAX_FILES, MAX_FILE_SIZE } from '@utils';

const UploadManager: React.FC = () => {
  const { files, addFiles, pauseUpload, resumeUpload, cancelUpload, removeFile } = useUploaderStore();
  useUploader();

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const validFiles: File[] = [];

    if (newFiles.length > MAX_FILES) {
      message.error({ content: `You can only select up to ${MAX_FILES} files at once.`, key: 'validation_msg' });
      return;
    }

    for (const file of newFiles) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        message.error({ content: `"${file.name}" is an invalid type. Only images and videos are allowed.`, key: 'validation_msg' });
        continue;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        message.error({ content: `"${file.name}" exceeds the 50MB size limit.`, key: 'validation_msg' });
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      addFiles(validFiles);
    }
  }, [addFiles]);

  return (
    <Row justify="center" className="my-8">
      <Col xs={24} md={20} lg={16} className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
        <Row>
          <Col span={24}>
            <Dropzone onFilesAdded={handleFilesAdded} />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <UploadList 
              files={files} 
              onPause={pauseUpload} 
              onResume={resumeUpload} 
              onCancel={cancelUpload} 
              onRemove={removeFile} 
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default memo(UploadManager);
