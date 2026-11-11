import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('generic where clause', () => {
  it('function with where clause', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'f',
        [{ firstName: 'x', type: swift.factory.createIdentifierType('T') }],
        swift.factory.createIdentifierType('T'),
        [swift.factory.createReturnStatement(swift.factory.createIdentifier('x'))],
        undefined,
        [{ name: 'T' }],
        undefined,
        undefined,
        [
          {
            left: swift.factory.createIdentifierType('T'),
            relation: 'conformance',
            right: swift.factory.createIdentifierType('Equatable'),
          },
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'function-with-where-clause.swift');
  });

  it('struct with where clause', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration(
        'Box',
        [
          swift.factory.createVariableDeclaration('let', [
            { pattern: 'value', typeAnnotation: swift.factory.createIdentifierType('T') },
          ]),
        ],
        undefined,
        undefined,
        [{ name: 'T' }],
        undefined,
        [
          {
            left: swift.factory.createIdentifierType('T'),
            relation: 'conformance',
            right: swift.factory.createIdentifierType('Codable'),
          },
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'struct-with-where-clause.swift');
  });
});
