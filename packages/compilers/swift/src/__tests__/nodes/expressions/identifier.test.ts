import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('identifier expression', () => {
  it('bound to a constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { initializer: swift.factory.createIdentifier('foo'), pattern: 'example' },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'identifier.swift');
  });
});
