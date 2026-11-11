import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('macro declaration', () => {
  it('external macro with return type', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createMacroDeclaration(
        'stringify',
        [{ firstName: '_', secondName: 'value', type: swift.factory.createIdentifierType('Int') }],
        swift.factory.createIdentifierType('String'),
        '#externalMacro(module: "MyMacros", type: "StringifyMacro")',
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'external-macro.swift');
  });
});
