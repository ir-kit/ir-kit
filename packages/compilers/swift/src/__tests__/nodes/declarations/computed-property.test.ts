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
                accessorSpecifier: 'get',
                body: [
                  swift.factory.createReturnStatement(swift.factory.createIntegerLiteral('0')),
                ],
              },
              { accessorSpecifier: 'set', body: [] },
            ]),
            pattern: 'x',
            typeAnnotation: swift.factory.createIdentifierType('Int'),
          },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-getter-and-setter-in-struct.swift');
  });
});
