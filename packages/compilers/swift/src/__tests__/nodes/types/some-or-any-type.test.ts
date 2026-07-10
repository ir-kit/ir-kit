import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('some or any type', () => {
  it('wraps an existential any type in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'value',
          type: swift.factory.createSomeOrAnyType(
            'any',
            swift.factory.createIdentifierType('Codable'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'any-type.swift');
  });

  it('wraps an opaque some type in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'value',
          type: swift.factory.createSomeOrAnyType(
            'some',
            swift.factory.createIdentifierType('Equatable'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'some-type.swift');
  });
});
