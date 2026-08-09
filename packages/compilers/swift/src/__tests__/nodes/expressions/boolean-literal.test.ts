import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('boolean literal expression', () => {
  it('bound to a constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { initializer: swift.factory.createBooleanLiteral(true), pattern: 'example' },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'boolean-literal.swift');
  });
});
