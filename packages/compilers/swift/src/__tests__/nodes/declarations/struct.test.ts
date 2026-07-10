import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('struct declaration', () => {
  it('with stored properties', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration('User', [
        swift.factory.createVariableDeclaration('let', [
          { pattern: 'id', typeAnnotation: swift.factory.createIdentifierType('Int') },
        ]),
        swift.factory.createVariableDeclaration('let', [
          { pattern: 'name', typeAnnotation: swift.factory.createIdentifierType('String') },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-stored-properties.swift');
  });
});
