import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('implicitly unwrapped optional type', () => {
  it('wraps a type in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('var', [
        {
          pattern: 'value',
          typeAnnotation: swift.factory.createImplicitlyUnwrappedOptionalType(
            swift.factory.createIdentifierType('String'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'implicitly-unwrapped-optional-type.swift');
  });
});
