import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('lambda', () => {
  it('single untyped parameter, expression body', async () => {
    const lam = java.factory.createLambdaExpression(
      [{ name: 'x' }],
      java.factory.createBinaryExpression(
        java.factory.createIdentifier('x'),
        '+',
        java.factory.createLiteral(1),
      ),
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration(
        'f',
        java.factory.createIdentifier('Function<Integer, Integer>'),
        lam,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'lambda-expr.java');
  });

  it('typed parameters, block body', async () => {
    const lam = java.factory.createLambdaExpression(
      [
        { name: 'a', type: java.factory.createIdentifier('int') },
        { name: 'b', type: java.factory.createIdentifier('int') },
      ],
      [
        java.factory.createReturnStatement(
          java.factory.createBinaryExpression(
            java.factory.createIdentifier('a'),
            '+',
            java.factory.createIdentifier('b'),
          ),
        ),
      ],
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration(
        'g',
        java.factory.createIdentifier('BiFunction<Integer, Integer, Integer>'),
        lam,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'lambda-block.java');
  });
});
