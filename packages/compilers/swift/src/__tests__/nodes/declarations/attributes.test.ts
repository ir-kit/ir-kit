import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('declaration attributes', () => {
  it('class with available attribute', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration(
        'Widget',
        [
          swift.factory.createVariableDeclaration('let', [
            { pattern: 'name', typeAnnotation: swift.factory.createIdentifierType('String') },
          ]),
        ],
        undefined,
        undefined,
        undefined,
        [{ arguments: 'macOS 13, *', attributeName: 'available' }],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'class-with-available-attribute.swift');
  });

  it('function with objc attribute', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'refresh',
        [],
        undefined,
        [
          swift.factory.createExpressionStatement(
            swift.factory.createFunctionCallExpression(swift.factory.createIdentifier('print'), [
              { expression: swift.factory.createStringLiteral('refresh') },
            ]),
          ),
        ],
        undefined,
        undefined,
        undefined,
        [{ attributeName: 'objc' }],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'function-with-objc-attribute.swift');
  });
});
