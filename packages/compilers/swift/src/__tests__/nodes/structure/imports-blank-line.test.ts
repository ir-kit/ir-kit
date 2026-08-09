import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('source file import separation', () => {
  it('blank line after imports', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createImportDeclaration('Foundation'),
      swift.factory.createStructDeclaration('User', [
        swift.factory.createVariableDeclaration('let', [
          { pattern: 'id', typeAnnotation: swift.factory.createIdentifierType('Int') },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'blank-line-after-imports.swift');
  });
});
