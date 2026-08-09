import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('import declaration', () => {
  it('module', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createImportDeclaration('Foundation'),
    ]);
    await assertPrintedMatchesSnapshot(file, 'module.swift');
  });

  it('with import kind', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createImportDeclaration('Foundation.Data', 'struct'),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-import-kind.swift');
  });
});
