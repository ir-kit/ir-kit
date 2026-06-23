import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('switch expression', () => {
  it('arrow rules with expression and block bodies', async () => {
    const rules = [
      java.factory.createSwitchRule(
        [java.factory.createLiteral(1), java.factory.createLiteral(2)],
        java.factory.createLiteral('one-two'),
      ),
      java.factory.createSwitchRule(undefined, [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(java.factory.createIdentifier('log'), [
            java.factory.createLiteral('other'),
          ]),
        ),
        java.factory.createYieldStatement(java.factory.createLiteral('rest')),
      ]),
    ];
    const expr = java.factory.createSwitchExpression(java.factory.createIdentifier('x'), rules);
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration('s', java.factory.createIdentifier('String'), expr),
    ]);
    await assertPrintedMatchesSnapshot(file, 'switch-expression.java');
  });
});
