import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('guard statement', () => {
  it('with an else branch that returns', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'run',
        [{ firstName: 'flag', type: swift.factory.createIdentifierType('Bool') }],
        undefined,
        [
          swift.factory.createGuardStatement(
            [swift.factory.createIdentifier('flag')],
            [swift.factory.createReturnStatement()],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'guard.swift');
  });
});
