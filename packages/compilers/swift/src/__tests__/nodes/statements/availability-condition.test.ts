import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('availability condition', () => {
  it('an if #available platform check', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration('run', [], undefined, [
        swift.factory.createIfStatement({ platforms: ['iOS 15', '*'] }, [
          swift.factory.createExpressionStatement(
            swift.factory.createFunctionCallExpression(swift.factory.createIdentifier('print'), [
              { expression: swift.factory.createStringLiteral('available') },
            ]),
          ),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'availability-condition.swift');
  });
});
