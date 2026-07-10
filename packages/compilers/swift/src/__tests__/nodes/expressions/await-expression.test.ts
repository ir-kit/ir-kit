import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('await expression', () => {
  it('inside an async function', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'run',
        [],
        undefined,
        [
          swift.factory.createVariableDeclaration('let', [
            {
              name: 'value',
              value: swift.factory.createAwaitExpression(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier('load'),
                  [],
                ),
              ),
            },
          ]),
        ],
        undefined,
        undefined,
        { async: true },
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'await-expression.swift');
  });
});
