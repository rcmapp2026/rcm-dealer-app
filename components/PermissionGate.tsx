import React, { useEffect } from 'react';
import { requestFeaturePermission, FeaturePermission } from '../services/nativePermissionService';

interface PermissionGateProps {
  onComplete: () => void;
}

// Permissions to request in order
const PERMISSIONS_TO_REQUEST: FeaturePermission[] = ['camera', 'storage'];

const requestAllPermissions = async (onComplete: () => void) => {
  const promises = PERMISSIONS_TO_REQUEST.map(perm => requestFeaturePermission(perm));
  await Promise.all(promises);
  onComplete();
};

export const PermissionGate: React.FC<PermissionGateProps> = ({ onComplete }) => {
  useEffect(() => {
    // Start the permission request process as soon as the component mounts.
    requestAllPermissions(onComplete);
    
    // Fallback: Complete after 10 seconds even if permissions fail
    const timeout = setTimeout(() => {
      console.log('Permission gate timeout - completing anyway');
      onComplete();
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [onComplete]);

  // This component renders nothing, so the user sees no UI for it.
  return null;
};