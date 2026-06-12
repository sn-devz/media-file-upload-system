"use client";
import React, { memo } from 'react';
import { UploadListProps } from "@/types";
import { List, Typography, Row, Col } from 'antd';
import { FileListItem } from '@molecules';

const { Title } = Typography;

const UploadList: React.FC<UploadListProps> = ({ files, onPause, onResume, onCancel, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <Row className="mt-8">
      <Col span={24}>
        <Row>
          <Col span={24}>
            <Title level={4} className="!mb-4 dark:!text-white">Upload Queue</Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <List
              itemLayout="horizontal"
              dataSource={files}
              renderItem={file => (
                <FileListItem
                  file={file}
                  onPause={onPause}
                  onResume={onResume}
                  onCancel={onCancel}
                  onRemove={onRemove}
                />
              )}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default memo(UploadList);
