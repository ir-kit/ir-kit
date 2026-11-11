import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('expression statement', () => {
  it('simple call', async () => {
    const call = go.factory.createCallExpression(
      go.factory.createMemberExpression(
        go.factory.createIdentifier('fmt'),
        go.factory.createIdentifier('Println'),
      ),
      [go.factory.createLiteral('hello')],
    );

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createExpressionStatement(call),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'simple.go');
  });
});
