import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('try expression', () => {
  it('inside a throwing function', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'run',
        [],
        undefined,
        [
          swift.factory.createVariableDeclaration('let', [
            {
              name: 'value',
              value: swift.factory.createTryExpression(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier('parse'),
                  [],
                ),
                'try',
              ),
            },
          ]),
        ],
        undefined,
        undefined,
        { throws: true },
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'try-expression.swift');
  });
});
