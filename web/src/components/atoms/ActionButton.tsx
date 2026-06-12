"use client";
import React, { memo } from 'react';
import { ActionButtonProps } from "@/types";
import { Button } from 'antd';


const ActionButton: React.FC<ActionButtonProps> = ({ icon, ...rest }) => {
  return (
    <Button
      type="text"
      icon={icon}
      {...rest}
    />
  );
};

export default memo(ActionButton);
