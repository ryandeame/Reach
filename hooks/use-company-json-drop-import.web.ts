import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { mapCompanyJsonToForm } from '@/components/company-json-import';
import type { CreateCompanyInput } from '@/types/reach';

function hasFile(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read the JSON file.'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsText(file);
  });
}

export function useCompanyJsonDropImport(
  enabled: boolean,
  onImport: (fields: Partial<CreateCompanyInput>) => void,
) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const isDraggingFileRef = useRef(false);
  const onImportRef = useRef(onImport);

  useEffect(() => {
    onImportRef.current = onImport;
  }, [onImport]);

  useEffect(() => {
    if (!enabled) {
      setIsDraggingFile(false);
      isDraggingFileRef.current = false;
      return;
    }

    const setDraggingFile = (value: boolean) => {
      if (isDraggingFileRef.current === value) {
        return;
      }

      isDraggingFileRef.current = value;
      setIsDraggingFile(value);
    };

    const isOutsideFrame = (event: DragEvent) =>
      event.clientX <= 0 ||
      event.clientY <= 0 ||
      event.clientX >= window.innerWidth ||
      event.clientY >= window.innerHeight;

    const importFile = async (file: File | undefined) => {
      if (!file) {
        return;
      }

      if (!file.name.toLowerCase().endsWith('.json')) {
        Alert.alert('Use a JSON file', 'Drop a file ending in .json.');
        return;
      }

      try {
        const text = await readFile(file);
        const parsed = JSON.parse(text);
        onImportRef.current(mapCompanyJsonToForm(parsed));
      } catch (error) {
        Alert.alert(
          'Unable to import company',
          error instanceof Error ? error.message : 'The file does not contain valid JSON.',
        );
      }
    };

    const handleDragOver = (event: DragEvent) => {
      if (!hasFile(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
      setDraggingFile(true);
    };

    const handleDragEnter = (event: DragEvent) => {
      if (!hasFile(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setDraggingFile(true);
    };

    const handleDragLeave = (event: DragEvent) => {
      if (!isDraggingFileRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (isOutsideFrame(event)) {
        setDraggingFile(false);
      }
    };

    const handleDrop = (event: DragEvent) => {
      if (!hasFile(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setDraggingFile(false);
      void importFile(event.dataTransfer?.files?.[0]);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDraggingFile(false);
      }
    };

    document.addEventListener('dragenter', handleDragEnter, true);
    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('drop', handleDrop, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter, true);
      document.removeEventListener('dragleave', handleDragLeave, true);
      document.removeEventListener('dragover', handleDragOver, true);
      document.removeEventListener('drop', handleDrop, true);
      window.removeEventListener('keydown', handleKeyDown);
      isDraggingFileRef.current = false;
      setIsDraggingFile(false);
    };
  }, [enabled]);

  return isDraggingFile;
}
