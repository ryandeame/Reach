import type { CreateCompanyInput } from '@/types/reach';

type CompanySnapshotJson = {
  companyName?: unknown;
  name?: unknown;
  location?: unknown;
  locations?: unknown;
  phone?: unknown;
  website?: unknown;
};

function toText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function mapCompanyJsonToForm(data: unknown): Partial<CreateCompanyInput> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('The JSON file must contain one object.');
  }

  const snapshot = data as CompanySnapshotJson;
  const firstLocation = Array.isArray(snapshot.locations)
    ? snapshot.locations.map(toText).find(Boolean) ?? ''
    : '';

  const form = {
    name: toText(snapshot.companyName) || toText(snapshot.name),
    location: toText(snapshot.location) || firstLocation,
    phone: toText(snapshot.phone),
    website: toText(snapshot.website),
  };

  const populated = Object.fromEntries(
    Object.entries(form).filter(([, value]) => value.length > 0),
  ) as Partial<CreateCompanyInput>;

  if (Object.keys(populated).length === 0) {
    throw new Error('The JSON file does not include company fields this form can use.');
  }

  return populated;
}
