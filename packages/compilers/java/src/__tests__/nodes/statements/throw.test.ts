import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('throw statement', () => {
  it('print throw new', async () => {
    const error = java.factory.createNewExpression(
      java.factory.createIdentifier('RuntimeException'),
      [java.factory.createLiteral('boom')],
    );
    const thr = java.factory.createThrowStatement(error);

    const file = java.factory.createSourceFile(undefined, [thr]);
    await assertPrintedMatchesSnapshot(file, 'throw.java');
  });
});
