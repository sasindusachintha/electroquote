// src/utils/id.ts
// Pure JS UUID v4 generator with zero native crypto dependencies.
// Works seamlessly across React Native (Hermes / JSC), Web, iOS, and Android.

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
