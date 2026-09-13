import React from 'react';
import { WhatsAppFloatingButton } from '@/components/common/WhatsAppFloatingButton';

export interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = (props) => {
  return <WhatsAppFloatingButton {...props} />;
};
