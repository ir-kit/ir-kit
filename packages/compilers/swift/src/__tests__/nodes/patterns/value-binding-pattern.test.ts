import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('value binding pattern', () => {
  it('in a switch case', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'handle',
        [{ firstName: '_', secondName: 'value', type: swift.factory.createIdentifierType('Int') }],
        undefined,
        [
          swift.factory.createSwitchStatement(swift.factory.createIdentifier('value'), [
            swift.factory.createSwitchCase(
              [swift.factory.createReturnStatement()],
              [
                swift.factory.createValueBindingPattern(
                  'let',
                  swift.factory.createIdentifierPattern('x'),
                ),
              ],
            ),
          ]),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'in-a-switch-case.swift');
  });
});
