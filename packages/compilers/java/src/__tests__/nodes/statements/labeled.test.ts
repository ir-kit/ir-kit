import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('labeled statements', () => {
  it('label block with labeled break/continue', async () => {
    const loop = java.factory.createForStatement(
      undefined,
      java.factory.createLiteral(true),
      undefined,
      [
        java.factory.createContinueStatement(undefined, undefined, 'outer'),
        java.factory.createBreakStatement(undefined, undefined, 'outer'),
      ],
    );

    const labeled = java.factory.createLabeledStatement('outer', loop);
    const file = java.factory.createSourceFile(undefined, [labeled]);
    await assertPrintedMatchesSnapshot(file, 'labeled.java');
  });
});
