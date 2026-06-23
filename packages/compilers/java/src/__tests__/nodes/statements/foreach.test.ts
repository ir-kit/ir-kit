import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('enhanced for', () => {
  it('foreach String s : list', async () => {
    const body = [
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createMemberExpression(
            java.factory.createIdentifier('System'),
            java.factory.createIdentifier('out'),
          ),
          [java.factory.createIdentifier('s')],
        ),
      ),
    ];
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createEnhancedForStatement(
        's',
        java.factory.createIdentifier('list'),
        body,
        java.factory.createIdentifier('String'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'foreach.java');
  });
});
