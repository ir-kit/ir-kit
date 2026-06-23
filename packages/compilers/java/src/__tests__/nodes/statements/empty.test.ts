import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('empty statement', () => {
  it('prints blank line', async () => {
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createMemberExpression(
            java.factory.createIdentifier('System'),
            java.factory.createIdentifier('out'),
          ),
          [java.factory.createLiteral('a')],
        ),
      ),
      java.factory.createEmptyStatement(),
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createMemberExpression(
            java.factory.createIdentifier('System'),
            java.factory.createIdentifier('out'),
          ),
          [java.factory.createLiteral('b')],
        ),
      ),
    ]);

    await assertPrintedMatchesSnapshot(file, 'empty.java');
  });
});
