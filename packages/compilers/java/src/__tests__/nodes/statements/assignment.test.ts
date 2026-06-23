import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('assignment', () => {
  it('a = 2;', async () => {
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration(
        'a',
        java.factory.createIdentifier('int'),
        java.factory.createLiteral(1),
        ['public'],
      ),
      java.factory.createAssignment(
        java.factory.createIdentifier('a'),
        java.factory.createLiteral(2),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'assignment.java');
  });
});
