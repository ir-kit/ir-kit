import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('associatedtype declaration', () => {
  it('inside protocol', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createProtocolDeclaration('Container', [
        swift.factory.createAssociatedTypeDeclaration('Item'),
        swift.factory.createAssociatedTypeDeclaration('Element', [
          swift.factory.createIdentifierType('Equatable'),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'inside-protocol.swift');
  });
});
