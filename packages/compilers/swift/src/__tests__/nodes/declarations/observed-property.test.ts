import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('observed property', () => {
  it('with didSet observer in class', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration('Model', [
        swift.factory.createVariableDeclaration('var', [
          {
            accessorBlock: swift.factory.createAccessorBlock([{ body: [], kind: 'didSet' }]),
            name: 'x',
            type: swift.factory.createIdentifierType('Int'),
            value: swift.factory.createIntegerLiteral('0'),
          },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-didset-observer-in-class.swift');
  });
});
