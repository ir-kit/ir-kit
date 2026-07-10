import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('float literal expression', () => {
  it('bound to a constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { initializer: swift.factory.createFloatLiteral('3.14'), pattern: 'example' },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'float-literal.swift');
  });
});
