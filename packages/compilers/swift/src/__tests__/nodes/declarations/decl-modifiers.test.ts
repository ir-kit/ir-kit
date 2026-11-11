import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('modifiers on declarations', () => {
  it('public enum and protocol', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createEnumDeclaration('Direction', [], ['public']),
      swift.factory.createProtocolDeclaration('Greeter', [], ['public']),
    ]);
    await assertPrintedMatchesSnapshot(file, 'public-enum-and-protocol.swift');
  });
});
