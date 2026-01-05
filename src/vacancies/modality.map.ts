export function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export const MODALITY_MAP: Record<string, string> = {
  remoto: 'REMOTE',
  remote: 'REMOTE',

  hibrido: 'HYBRID',
  hibrida: 'HYBRID',
  hybrid: 'HYBRID',

  presencial: 'ON_SITE',
  onsite: 'ON_SITE',
  'on-site': 'ON_SITE',
};
