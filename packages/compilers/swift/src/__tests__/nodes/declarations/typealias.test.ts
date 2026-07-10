import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('typealias declaration', () => {
  it('simple', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createTypeAliasDeclaration(
        'Name',
        swift.factory.createIdentifierType('String'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.swift');
  });

  it('generic', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createTypeAliasDeclaration(
        'Alias',
        swift.factory.createIdentifierType('T'),
        undefined,
        [{ name: 'T' }],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'generic.swift');
  });
});
