import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('identifier expression', () => {
  it('bound to a constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { name: 'example', value: swift.factory.createIdentifier('foo') },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'identifier.swift');
  });
});
