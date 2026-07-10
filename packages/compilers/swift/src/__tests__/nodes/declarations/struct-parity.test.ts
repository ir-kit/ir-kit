import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('struct modifiers and inheritance', () => {
  it('public struct conforming to protocol', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration(
        'Point',
        [
          swift.factory.createVariableDeclaration('let', [
            { name: 'x', type: swift.factory.createIdentifierType('Int') },
          ]),
          swift.factory.createVariableDeclaration('let', [
            { name: 'y', type: swift.factory.createIdentifierType('Int') },
          ]),
        ],
        ['public'],
        [swift.factory.createIdentifierType('Codable')],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'public-struct-conforming-to-protocol.swift');
  });
});
