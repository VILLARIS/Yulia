import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveStorageUploadUrl, storageApiBase } from '../src/storage.js';

const PROJECT_URL = 'https://project.supabase.co';
const EXPECTED_BASE = 'https://project.supabase.co/storage/v1';

test('storageApiBase añade /storage/v1 una sola vez', () => {
  assert.equal(storageApiBase(PROJECT_URL), EXPECTED_BASE);
  assert.equal(storageApiBase(`${PROJECT_URL}/`), EXPECTED_BASE);
  assert.equal(storageApiBase(`${PROJECT_URL}/storage/v1`), EXPECTED_BASE);
  assert.equal(storageApiBase(`${PROJECT_URL}/storage/v1/`), EXPECTED_BASE);
});

test('resuelve una URL relativa de subida contra /storage/v1', () => {
  const signed = '/object/upload/sign/course-covers/courses/curso/portada.png?token=firmado';

  assert.equal(
    resolveStorageUploadUrl(PROJECT_URL, signed),
    `${EXPECTED_BASE}/object/upload/sign/course-covers/courses/curso/portada.png?token=firmado`,
  );
});

test('resuelve una URL relativa sin barra inicial contra /storage/v1', () => {
  assert.equal(
    resolveStorageUploadUrl(PROJECT_URL, 'object/upload/sign/course-covers/portada.png?token=firmado'),
    `${EXPECTED_BASE}/object/upload/sign/course-covers/portada.png?token=firmado`,
  );
});

test('no duplica /storage/v1 si Supabase ya lo incluye en la URL relativa', () => {
  const signed = '/storage/v1/object/upload/sign/course-covers/portada.png?token=firmado';

  assert.equal(
    resolveStorageUploadUrl(PROJECT_URL, signed),
    `${EXPECTED_BASE}/object/upload/sign/course-covers/portada.png?token=firmado`,
  );
  assert.equal(
    resolveStorageUploadUrl(`${PROJECT_URL}/storage/v1`, signed),
    `${EXPECTED_BASE}/object/upload/sign/course-covers/portada.png?token=firmado`,
  );
});

test('conserva una URL absoluta válida y su token sin modificarlos', () => {
  const signed = 'https://project.supabase.co/storage/v1/object/upload/sign/course-covers/portada.png?token=firmado&x=1';

  assert.equal(resolveStorageUploadUrl(PROJECT_URL, signed), signed);
  assert.equal(resolveStorageUploadUrl(`${PROJECT_URL}/storage/v1`, signed), signed);
});

test('rechaza protocolos que no sean HTTP o HTTPS', () => {
  assert.throws(
    () => resolveStorageUploadUrl(PROJECT_URL, 'javascript:alert(1)'),
    /no válida/,
  );
});

test('las URLs públicas se construyen desde la base /storage/v1', () => {
  assert.equal(
    `${storageApiBase(PROJECT_URL)}/object/public/course-covers/courses/curso/portada.png`,
    'https://project.supabase.co/storage/v1/object/public/course-covers/courses/curso/portada.png',
  );
});
