export function stripUUID(value: string | null | undefined): string {
  if (value) {
    return value.replace(/_?\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/, '');
  }

  return '';
}
