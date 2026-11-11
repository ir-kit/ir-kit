import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('composition type', () => {
  it('wraps a protocol composition in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          pattern: 'value',
          typeAnnotation: swift.factory.createSomeOrAnyType(
            'any',
            swift.factory.createCompositionType([
              swift.factory.createIdentifierType('Codable'),
              swift.factory.createIdentifierType('Equatable'),
            ]),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'composition-type.swift');
  });
});
