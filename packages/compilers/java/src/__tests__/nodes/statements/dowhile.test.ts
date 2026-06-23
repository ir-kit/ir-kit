import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('do-while', () => {
  it('simple do-while with break', async () => {
    const body = [
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createMemberExpression(
            java.factory.createIdentifier('System'),
            java.factory.createIdentifier('out'),
          ),
          [java.factory.createLiteral('tick')],
        ),
      ),
      java.factory.createBreakStatement(),
    ];
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createDoWhileStatement(body, java.factory.createLiteral(true)),
    ]);
    await assertPrintedMatchesSnapshot(file, 'dowhile.java');
  });
});
