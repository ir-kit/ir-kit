import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('implicitly unwrapped optional type', () => {
  it('wraps a type in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('var', [
        {
          name: 'value',
          type: swift.factory.createImplicitlyUnwrappedOptionalType(
            swift.factory.createIdentifierType('String'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'implicitly-unwrapped-optional-type.swift');
  });
});
