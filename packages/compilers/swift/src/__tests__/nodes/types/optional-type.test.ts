import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('optional type', () => {
  it('wraps a type in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'value',
          type: swift.factory.createOptionalType(swift.factory.createIdentifierType('Int')),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'optional-type.swift');
  });
});
