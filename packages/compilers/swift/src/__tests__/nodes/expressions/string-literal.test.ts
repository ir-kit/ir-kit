import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('string literal expression', () => {
  it('bound to a constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { name: 'example', value: swift.factory.createStringLiteral('hello') },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'string-literal.swift');
  });
});
