import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('deinitializer declaration', () => {
  it('inside class', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration('Resource', [
        swift.factory.createDeinitializerDeclaration([
          swift.factory.createExpressionStatement(
            swift.factory.createFunctionCallExpression(
              swift.factory.createIdentifier('cleanup'),
              [],
            ),
          ),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'inside-class.swift');
  });
});
