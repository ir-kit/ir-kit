import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('enum case declaration', () => {
  it('with associated values', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createEnumDeclaration('Result', [
        swift.factory.createEnumCaseDeclaration([
          { associatedValues: [swift.factory.createIdentifierType('Int')], name: 'success' },
        ]),
        swift.factory.createEnumCaseDeclaration([
          { associatedValues: [swift.factory.createIdentifierType('Error')], name: 'failure' },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-associated-values.swift');
  });

  it('with raw value', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createEnumDeclaration(
        'Code',
        [
          swift.factory.createEnumCaseDeclaration([
            { name: 'ok', rawValue: swift.factory.createIntegerLiteral('200') },
          ]),
        ],
        undefined,
        [swift.factory.createIdentifierType('Int')],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-raw-value.swift');
  });
});
