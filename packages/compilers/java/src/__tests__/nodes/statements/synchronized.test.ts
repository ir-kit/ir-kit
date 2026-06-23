import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('synchronized', () => {
  it('simple synchronized block', async () => {
    const body = [
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createMemberExpression(
            java.factory.createIdentifier('System'),
            java.factory.createIdentifier('out'),
          ),
          [java.factory.createLiteral('locked')],
        ),
      ),
    ];
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createSynchronizedStatement(java.factory.createIdentifier('this'), body),
    ]);
    await assertPrintedMatchesSnapshot(file, 'synchronized.java');
  });
});
