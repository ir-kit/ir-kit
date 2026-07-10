import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('pattern-matching control flow', () => {
  it('for-case binding', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'run',
        [
          {
            firstName: 'items',
            type: swift.factory.createArrayType(swift.factory.createIdentifierType('Int')),
          },
        ],
        undefined,
        [
          swift.factory.createForInStatement(
            '_',
            swift.factory.createIdentifier('items'),
            [
              swift.factory.createExpressionStatement(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier('print'),
                  [{ expression: swift.factory.createIdentifier('value') }],
                ),
              ),
            ],
            swift.factory.createValueBindingPattern(
              'let',
              swift.factory.createIdentifierPattern('value'),
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'for-case-binding.swift');
  });

  it('if-case match', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'run',
        [{ firstName: 'result', type: swift.factory.createIdentifierType('Result') }],
        undefined,
        [
          swift.factory.createIfStatement(
            {
              pattern: swift.factory.createEnumCasePattern('success'),
              value: swift.factory.createIdentifier('result'),
            },
            [
              swift.factory.createExpressionStatement(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier('print'),
                  [{ expression: swift.factory.createStringLiteral('ok') }],
                ),
              ),
            ],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'if-case-match.swift');
  });
});
