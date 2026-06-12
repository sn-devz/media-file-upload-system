"use client";
import React, { memo } from 'react';
import { FileListItemProps } from "@/types";
import { List, Progress, Typography, Row, Col } from 'antd';
import { UploadCloud, Pause, Play, X, AlertCircle } from 'lucide-react';
import ActionButton from '../atoms/ActionButton';

const { Text } = Typography;


const FileListItem: React.FC<FileListItemProps> = ({ file, onPause, onResume, onCancel, onRemove }) => {
  return (
    <List.Item
      className="bg-gray-50 dark:bg-gray-800 rounded-xl px-5 py-4 mb-3 border border-gray-100 dark:border-gray-700"
      actions={[
        file.status === 'uploading' && (
          <ActionButton key="pause" aria-label="Pause" icon={<Pause size={18} />} onClick={() => onPause(file.id)} />
        ),
        ['paused', 'error'].includes(file.status) && (
          <ActionButton key="resume" aria-label="Resume" icon={<Play size={18} />} onClick={() => onResume(file.id)} />
        ),
        ['pending', 'uploading', 'paused'].includes(file.status) && (
          <ActionButton key="cancel" aria-label="Cancel" danger icon={<X size={18} />} onClick={() => onCancel(file.id)} />
        ),
        ['completed', 'error'].includes(file.status) && (
          <ActionButton key="remove" aria-label="Remove" danger icon={<X size={18} />} onClick={() => onRemove(file.id)} />
        )
      ].filter(Boolean) as React.ReactNode[]}
    >
      <List.Item.Meta
        avatar={
          file.previewUrl ? (
            <img src={file.previewUrl} alt="preview" className="w-12 h-12 object-cover rounded-lg shadow-sm ml-1" />
          ) : (
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center ml-1">
              <UploadCloud size={24} className="text-gray-400" />
            </div>
          )
        }
        title={<Text ellipsis className="max-w-[100px] sm:max-w-[150px] md:max-w-[200px] block font-medium !text-gray-900 dark:!text-gray-200">{file.file ? file.file.name : file.name}</Text>}
        description={
          <Row align="middle" gutter={8} className="mt-1">
            <Col>
              <Text className="text-xs !text-gray-500 dark:!text-gray-400">
                {((file.file ? file.file.size : file.size) / 1024 / 1024).toFixed(2)} MB
              </Text>
            </Col>
            <Col>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 capitalize">
                {file.status}
              </span>
            </Col>
          </Row>
        }
      />
      <div className="flex-1 min-w-[80px] max-w-[250px] ml-auto">
        <Progress
          percent={file.progress}
          status={file.status === 'error' ? 'exception' : file.status === 'completed' ? 'success' : 'active'}
          size="small"
        />
        {file.status === 'error' && (
          <Row align="middle" gutter={4} className="mt-1">
            <Col><AlertCircle size={12} className="text-red-500" /></Col>
            <Col><Text type="danger" className="text-xs">{file.errorMessage}</Text></Col>
          </Row>
        )}
      </div>
    </List.Item>
  );
};

export default memo(FileListItem);
