import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('dictionary type', () => {
  it('wraps key and value types in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'value',
          type: swift.factory.createDictionaryType(
            swift.factory.createIdentifierType('String'),
            swift.factory.createIdentifierType('Int'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'dictionary-type.swift');
  });
});
