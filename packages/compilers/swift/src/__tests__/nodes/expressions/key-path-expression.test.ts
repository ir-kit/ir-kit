import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('key path expression', () => {
  it('rooted key path', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration('Person', [
        swift.factory.createVariableDeclaration('let', [
          { name: 'name', type: swift.factory.createIdentifierType('String') },
        ]),
      ]),
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'kp',
          value: swift.factory.createKeyPathExpression(
            ['name'],
            swift.factory.createIdentifierType('Person'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'rooted-key-path.swift');
  });
});
