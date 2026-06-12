"use client";

import React from 'react';
import { Layout, Row, Col, Typography } from 'antd';
import { UploadManager } from '@/components';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <Content className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={16} xl={14} className="max-w-4xl w-full mx-auto">
          <Row justify="center" className="mb-12 text-center">
            <Col span={24}>
              <Title level={1} className="!text-4xl !font-extrabold !mb-4 dark:!text-white tracking-tight">
                Media File Upload System
              </Title>
              <Paragraph className="!text-lg !text-gray-600 dark:!text-gray-400">
                A cross-platform, robust media upload solution supporting chunked uploads and resumption.
              </Paragraph>
            </Col>
          </Row>
          
          <UploadManager />
        </Col>
      </Row>
    </Content>
  );
}
