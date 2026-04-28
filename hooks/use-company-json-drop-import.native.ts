import type { CreateCompanyInput } from '@/types/reach';

export function useCompanyJsonDropImport(
  _enabled: boolean,
  _onImport: (fields: Partial<CreateCompanyInput>) => void,
) {
  return false;
}
