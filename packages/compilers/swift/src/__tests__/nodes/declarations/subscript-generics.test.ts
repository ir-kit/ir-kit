import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('subscript declaration', () => {
  it('generic subscript with where clause', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration('Box', [
        swift.factory.createSubscriptDeclaration(
          [{ firstName: 'index', type: swift.factory.createIdentifierType('Int') }],
          swift.factory.createIdentifierType('Element'),
          swift.factory.createAccessorBlock([
            {
              accessorSpecifier: 'get',
              body: [
                swift.factory.createReturnStatement(swift.factory.createIdentifier('storage')),
              ],
            },
          ]),
          undefined,
          undefined,
          [{ name: 'Element' }],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'generic-subscript.swift');
  });
});
