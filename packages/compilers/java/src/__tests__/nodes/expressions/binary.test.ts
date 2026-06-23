import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('binary expression', () => {
  it('print arithmetic and comparison', async () => {
    const a = java.factory.createIdentifier('a');
    const b = java.factory.createIdentifier('b');
    const sum = java.factory.createBinaryExpression(a, '+', b);
    const cmp = java.factory.createBinaryExpression(sum, '>=', java.factory.createLiteral(10));

    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(cmp),
    ]);

    await assertPrintedMatchesSnapshot(file, 'binary.java');
  });
});
