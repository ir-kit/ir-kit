import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('interpolated string literal', () => {
  it('text and interpolation segments', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { name: 'name', value: swift.factory.createStringLiteral('World') },
      ]),
      swift.factory.createVariableDeclaration('let', [
        {
          name: 's',
          value: swift.factory.createInterpolatedStringLiteral([
            { text: 'Hello ' },
            { expression: swift.factory.createIdentifier('name') },
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'text-and-interpolation.swift');
  });
});
