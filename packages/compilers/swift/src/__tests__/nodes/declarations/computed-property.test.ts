import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('computed property', () => {
  it('with getter and setter in struct', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration('Counter', [
        swift.factory.createVariableDeclaration('var', [
          {
            accessorBlock: swift.factory.createAccessorBlock([
              {
                body: [
                  swift.factory.createReturnStatement(swift.factory.createIntegerLiteral('0')),
                ],
                kind: 'get',
              },
              { body: [], kind: 'set' },
            ]),
            name: 'x',
            type: swift.factory.createIdentifierType('Int'),
          },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-getter-and-setter-in-struct.swift');
  });
});
