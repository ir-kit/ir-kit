import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('async let', () => {
  it('concurrent binding', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'fetch',
        [],
        swift.factory.createIdentifierType('Int'),
        [swift.factory.createReturnStatement(swift.factory.createIntegerLiteral('0'))],
      ),
      swift.factory.createFunctionDeclaration(
        'run',
        [],
        undefined,
        [
          swift.factory.createVariableDeclaration(
            'let',
            [
              {
                initializer: swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier('fetch'),
                  [],
                ),
                pattern: 'value',
              },
            ],
            undefined,
            ['async'],
          ),
          swift.factory.createExpressionStatement(
            swift.factory.createFunctionCallExpression(swift.factory.createIdentifier('print'), [
              {
                expression: swift.factory.createAwaitExpression(
                  swift.factory.createIdentifier('value'),
                ),
              },
            ]),
          ),
        ],
        undefined,
        undefined,
        { async: true },
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'concurrent-binding.swift');
  });
});
