import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('switch', () => {
  it('cases and default', async () => {
    const sw = java.factory.createSwitchStatement(java.factory.createIdentifier('x'), [
      java.factory.createSwitchCase(
        [java.factory.createLiteral(1), java.factory.createLiteral(2)],
        [
          java.factory.createExpressionStatement(
            java.factory.createCallExpression(
              java.factory.createMemberExpression(
                java.factory.createIdentifier('System'),
                java.factory.createIdentifier('out'),
              ),
              [java.factory.createLiteral('one or two')],
            ),
          ),
          java.factory.createBreakStatement(),
        ],
      ),
      java.factory.createSwitchCase(undefined, [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createMemberExpression(
              java.factory.createIdentifier('System'),
              java.factory.createIdentifier('out'),
            ),
            [java.factory.createLiteral('default')],
          ),
        ),
        java.factory.createBreakStatement(),
      ]),
    ]);
    const file = java.factory.createSourceFile(undefined, [sw]);
    await assertPrintedMatchesSnapshot(file, 'switch.java');
  });
});
