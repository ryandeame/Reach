import type { CreatePersonInput } from '@/types/reach';

type PersonSnapshotJson = {
  email?: unknown;
  fullName?: unknown;
  linkedIn?: unknown;
  linkedin?: unknown;
  location?: unknown;
  name?: unknown;
  phone?: unknown;
  title?: unknown;
};

function toText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function mapPersonJsonToForm(data: unknown): Partial<CreatePersonInput> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('The JSON file must contain one object.');
  }

  const snapshot = data as PersonSnapshotJson;
  const form = {
    fullName: toText(snapshot.fullName) || toText(snapshot.name),
    title: toText(snapshot.title),
    location: toText(snapshot.location),
    email: toText(snapshot.email),
    phone: toText(snapshot.phone),
    linkedin: toText(snapshot.linkedin) || toText(snapshot.linkedIn),
  };

  const populated = Object.fromEntries(
    Object.entries(form).filter(([, value]) => value.length > 0),
  ) as Partial<CreatePersonInput>;

  if (Object.keys(populated).length === 0) {
    throw new Error('The JSON file does not include person fields this form can use.');
  }

  return populated;
}
