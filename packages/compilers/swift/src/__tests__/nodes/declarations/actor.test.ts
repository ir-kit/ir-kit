import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('actor declaration', () => {
  it('with stored property', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createActorDeclaration('Counter', [
        swift.factory.createVariableDeclaration('var', [
          {
            name: 'value',
            type: swift.factory.createIdentifierType('Int'),
            value: swift.factory.createIntegerLiteral('0'),
          },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-stored-property.swift');
  });
});
