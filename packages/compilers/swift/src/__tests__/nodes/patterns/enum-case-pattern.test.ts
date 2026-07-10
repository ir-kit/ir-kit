import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('enum case pattern', () => {
  it('in a switch case', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createEnumDeclaration('Status', [
        swift.factory.createEnumCaseDeclaration([{ name: 'success' }]),
        swift.factory.createEnumCaseDeclaration([{ name: 'failure' }]),
      ]),
      swift.factory.createFunctionDeclaration(
        'handle',
        [
          {
            firstName: '_',
            secondName: 'value',
            type: swift.factory.createIdentifierType('Status'),
          },
        ],
        undefined,
        [
          swift.factory.createSwitchStatement(swift.factory.createIdentifier('value'), [
            swift.factory.createSwitchCase(
              [swift.factory.createReturnStatement()],
              [swift.factory.createEnumCasePattern('success')],
            ),
            swift.factory.createSwitchCase([swift.factory.createReturnStatement()]),
          ]),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'in-a-switch-case.swift');
  });

  it('with associated values', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createEnumDeclaration('Status', [
        swift.factory.createEnumCaseDeclaration([{ name: 'success' }]),
        swift.factory.createEnumCaseDeclaration([
          { associatedValues: [swift.factory.createIdentifierType('Int')], name: 'failure' },
        ]),
      ]),
      swift.factory.createFunctionDeclaration(
        'handle',
        [
          {
            firstName: '_',
            secondName: 'value',
            type: swift.factory.createIdentifierType('Status'),
          },
        ],
        undefined,
        [
          swift.factory.createSwitchStatement(swift.factory.createIdentifier('value'), [
            swift.factory.createSwitchCase(
              [swift.factory.createReturnStatement()],
              [
                swift.factory.createEnumCasePattern('failure', [
                  swift.factory.createValueBindingPattern(
                    'let',
                    swift.factory.createIdentifierPattern('code'),
                  ),
                ]),
              ],
            ),
            swift.factory.createSwitchCase([swift.factory.createReturnStatement()]),
          ]),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-associated-values.swift');
  });
});
