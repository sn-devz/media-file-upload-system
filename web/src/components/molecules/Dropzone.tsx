"use client";
import React, { memo } from 'react';
import { DropzoneProps } from "@/types";
import { UploadCloud } from 'lucide-react';
import { Typography, Upload, Row, Col } from 'antd';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;
const { Dragger } = Upload;


const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded }) => {
  const props: UploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*,video/*',
    showUploadList: false,
    beforeUpload: (file, fileList) => {
      if (fileList.indexOf(file) === 0) {
        onFilesAdded(fileList as unknown as File[]);
      }
      return false;
    },
  };

  return (
    <Dragger {...props} className="bg-transparent dark:bg-gray-800/50 hover:border-blue-500 rounded-2xl p-8">
      <Row justify="center" className="ant-upload-drag-icon mb-4">
        <Col>
          <UploadCloud className="w-16 h-16 mx-auto text-blue-500" />
        </Col>
      </Row>
      <Row justify="center">
        <Col>
          <Title level={4} className="!mb-2 dark:!text-white text-center">Drag & Drop Media Files</Title>
        </Col>
      </Row>
      <Row justify="center">
        <Col>
          <Text className="!text-gray-500 dark:!text-gray-400 text-center">or click to select files (Max 10 files, Images & Videos only)</Text>
        </Col>
      </Row>
    </Dragger>
  );
};

export default memo(Dropzone);
