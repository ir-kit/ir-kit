import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('subscript declaration', () => {
  it('inside struct with getter', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration('Grid', [
        swift.factory.createSubscriptDeclaration(
          [{ firstName: 'index', type: swift.factory.createIdentifierType('Int') }],
          swift.factory.createIdentifierType('Int'),
          swift.factory.createAccessorBlock([
            {
              accessorSpecifier: 'get',
              body: [swift.factory.createReturnStatement(swift.factory.createIdentifier('index'))],
            },
          ]),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'inside-struct-with-getter.swift');
  });
});
