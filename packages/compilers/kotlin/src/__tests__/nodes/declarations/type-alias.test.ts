import { assertPrintedMatchesSnapshot, f, file, t } from '../utils';

describe('type alias', () => {
  it('function type alias', async () => {
    const node = f.createTypeAlias(
      'Handler',
      f.createFunctionType([{ type: t('String') }], t('Unit')),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'function-type.kt');
  });

  it('generic function type alias', async () => {
    const node = f.createTypeAlias(
      'Predicate',
      f.createFunctionType([{ type: t('T') }], t('Boolean')),
      undefined,
      undefined,
      [f.createTypeParameter('T')],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'generic.kt');
  });

  it('alias to a parameterized type', async () => {
    const node = f.createTypeAlias(
      'StringMap',
      f.createUserType('Map', [t('String'), t('String')]),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'parameterized.kt');
  });
});
