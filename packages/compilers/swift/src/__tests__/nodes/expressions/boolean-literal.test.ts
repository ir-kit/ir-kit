import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('boolean literal expression', () => {
  it('bound to a constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { name: 'example', value: swift.factory.createBooleanLiteral(true) },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'boolean-literal.swift');
  });
});
