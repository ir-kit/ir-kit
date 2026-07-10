import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('try expression', () => {
  it('optional try', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createExpressionStatement(
        swift.factory.createTryExpression(
          swift.factory.createFunctionCallExpression(swift.factory.createIdentifier('parse'), []),
          '?',
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'optional-try.swift');
  });
});
