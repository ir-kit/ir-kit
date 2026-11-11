import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('assert', () => {
  it('assert without message', async () => {
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createAssertStatement(
        java.factory.createBinaryExpression(
          java.factory.createIdentifier('x'),
          '!=',
          java.factory.createLiteral(null),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'assert-basic.java');
  });

  it('assert with message', async () => {
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createAssertStatement(
        java.factory.createBinaryExpression(
          java.factory.createIdentifier('count'),
          '>=',
          java.factory.createLiteral(1),
        ),
        java.factory.createLiteral('count must be >= 1'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'assert-message.java');
  });
});
