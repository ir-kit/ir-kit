import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('nil literal expression', () => {
  it('bound to an optional constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          type: swift.factory.createOptionalType(swift.factory.createIdentifierType('Int')),
          value: swift.factory.createNilLiteral(),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'nil-literal.swift');
  });
});
