import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('accessor block', () => {
  it('with getter and setter in subscript', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration('Store', [
        swift.factory.createSubscriptDeclaration(
          [{ firstName: 'key', type: swift.factory.createIdentifierType('String') }],
          swift.factory.createIdentifierType('Int'),
          swift.factory.createAccessorBlock([
            {
              accessorSpecifier: 'get',
              body: [swift.factory.createReturnStatement(swift.factory.createIntegerLiteral('0'))],
            },
            {
              accessorSpecifier: 'set',
              body: [
                swift.factory.createExpressionStatement(
                  swift.factory.createFunctionCallExpression(
                    swift.factory.createIdentifier('store'),
                    [],
                  ),
                ),
              ],
            },
          ]),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-getter-and-setter-in-subscript.swift');
  });
});
