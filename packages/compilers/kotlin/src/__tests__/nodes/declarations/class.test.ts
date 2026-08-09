import { assertPrintedMatchesSnapshot, f, file, t } from '../utils';

describe('class declaration', () => {
  it('data class', async () => {
    const node = f.createClassDeclaration(
      'User',
      f.createPrimaryConstructor([
        f.createParameter('id', t('String'), undefined, 'val'),
        f.createParameter('email', t('String'), undefined, 'val'),
      ]),
      undefined,
      ['data'],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'data-class.kt');
  });

  it('sealed class with data subclasses', async () => {
    const subclass = (name: string, prop: string) =>
      f.createClassDeclaration(
        name,
        f.createPrimaryConstructor([f.createParameter(prop, t('String'), undefined, 'val')]),
        undefined,
        ['data'],
        undefined,
        [{ arguments: [], type: t('Result') }],
      );
    const node = f.createClassDeclaration(
      'Result',
      undefined,
      [subclass('Success', 'data'), subclass('Failure', 'error')],
      ['sealed'],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'sealed-class.kt');
  });

  it('interface with abstract members', async () => {
    const node = f.createClassDeclaration(
      'Repository',
      undefined,
      [
        f.createFunctionDeclaration('findAll', [], f.createUserType('List', [t('User')])),
        f.createFunctionDeclaration(
          'findById',
          [f.createParameter('id', t('String'))],
          f.createNullableType(t('User')),
        ),
      ],
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );
    await assertPrintedMatchesSnapshot(file([node]), 'interface.kt');
  });
});
