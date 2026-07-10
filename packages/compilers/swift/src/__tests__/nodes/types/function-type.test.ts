import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('function type', () => {
  it('wraps a plain function type in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'value',
          type: swift.factory.createFunctionType(
            [swift.factory.createIdentifierType('Int')],
            swift.factory.createIdentifierType('String'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'function-type.swift');
  });

  it('wraps an async throws function type in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'value',
          type: swift.factory.createFunctionType(
            [swift.factory.createIdentifierType('Int')],
            swift.factory.createIdentifierType('String'),
            true,
            true,
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'function-type-async-throws.swift');
  });
});
