export function certificateSnapshot<T extends { id: string; verificationTokenHash: string; verificationTokenCiphertext: string; createdById: string }>(record: T) {
  const snapshot = { ...record };
  Reflect.deleteProperty(snapshot, "id");
  Reflect.deleteProperty(snapshot, "verificationTokenHash");
  Reflect.deleteProperty(snapshot, "verificationTokenCiphertext");
  Reflect.deleteProperty(snapshot, "createdById");
  return snapshot;
}
