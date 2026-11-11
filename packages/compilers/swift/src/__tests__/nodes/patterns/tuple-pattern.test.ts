import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('tuple pattern', () => {
  it('in a switch case', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'handle',
        [
          {
            firstName: '_',
            secondName: 'value',
            type: swift.factory.createTupleType([
              { type: swift.factory.createIdentifierType('Int') },
              { type: swift.factory.createIdentifierType('Int') },
            ]),
          },
        ],
        undefined,
        [
          swift.factory.createSwitchStatement(swift.factory.createIdentifier('value'), [
            swift.factory.createSwitchCase(
              [swift.factory.createReturnStatement()],
              [
                swift.factory.createTuplePattern([
                  swift.factory.createIdentifierPattern('a'),
                  swift.factory.createIdentifierPattern('b'),
                ]),
              ],
            ),
            swift.factory.createSwitchCase([swift.factory.createReturnStatement()]),
          ]),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'in-a-switch-case.swift');
  });
});
