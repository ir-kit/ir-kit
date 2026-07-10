import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('regex literal', () => {
  it('regex literal binding', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        { name: 're', value: swift.factory.createRegexLiteral('[a-z]+') },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'regex-literal-binding.swift');
  });
});
