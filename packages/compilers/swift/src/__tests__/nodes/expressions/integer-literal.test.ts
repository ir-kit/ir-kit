import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('integer literal expression', () => {
  it('bound to a constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { name: 'example', value: swift.factory.createIntegerLiteral('42') },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'integer-literal.swift');
  });
});
