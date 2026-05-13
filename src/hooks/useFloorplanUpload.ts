'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { loadFloorplanFile } from '@/lib/floorplan-upload';
import { useProjectStore } from '@/store/project-store';

export function useFloorplanUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const uploadFloorplan = useProjectStore((state) => state.uploadFloorplan);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadError(undefined);
    setIsUploading(true);
    try {
      const floorplan = await loadFloorplanFile(file);
      uploadFloorplan(floorplan);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'No se pudo subir el plano.');
    } finally {
      setIsUploading(false);
    }
  }

  return { inputRef, uploadError, isUploading, handleUpload, openFilePicker: () => inputRef.current?.click() };
}
