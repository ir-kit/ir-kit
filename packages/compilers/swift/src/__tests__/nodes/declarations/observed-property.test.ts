import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('observed property', () => {
  it('with didSet observer in class', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration('Model', [
        swift.factory.createVariableDeclaration('var', [
          {
            accessorBlock: swift.factory.createAccessorBlock([
              { accessorSpecifier: 'didSet', body: [] },
            ]),
            initializer: swift.factory.createIntegerLiteral('0'),
            pattern: 'x',
            typeAnnotation: swift.factory.createIdentifierType('Int'),
          },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-didset-observer-in-class.swift');
  });
});
