import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('discard statement', () => {
  it('discarding the result of a call', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'compute',
        [],
        swift.factory.createIdentifierType('Int'),
        [swift.factory.createReturnStatement(swift.factory.createIntegerLiteral('1'))],
      ),
      swift.factory.createFunctionDeclaration('run', [], undefined, [
        swift.factory.createDiscardStatement(
          swift.factory.createFunctionCallExpression(swift.factory.createIdentifier('compute'), []),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'discard-statement.swift');
  });
});
