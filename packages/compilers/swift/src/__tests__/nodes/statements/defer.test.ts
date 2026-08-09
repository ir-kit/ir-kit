import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('defer statement', () => {
  it('with a body inside a function', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration('run', [], undefined, [
        swift.factory.createDeferStatement([
          swift.factory.createExpressionStatement(
            swift.factory.createFunctionCallExpression(swift.factory.createIdentifier('print'), [
              { expression: swift.factory.createStringLiteral('done') },
            ]),
          ),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'defer.swift');
  });
});
