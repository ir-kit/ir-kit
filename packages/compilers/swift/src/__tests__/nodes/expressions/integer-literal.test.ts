import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('integer literal expression', () => {
  it('bound to a constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { initializer: swift.factory.createIntegerLiteral('42'), pattern: 'example' },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'integer-literal.swift');
  });
});
