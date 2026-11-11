import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('source file', () => {
  it('simple', async () => {
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createImportStatement('java.util.List'),
      java.factory.createEmptyStatement(),
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createMemberExpression(
            java.factory.createMemberExpression(
              java.factory.createIdentifier('System'),
              java.factory.createIdentifier('out'),
            ),
            java.factory.createIdentifier('println'),
          ),
          [java.factory.createLiteral(1)],
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.java');
  });
});
