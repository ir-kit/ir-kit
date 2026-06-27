import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('channel type', () => {
  it('bidirectional', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVariableStatement(
          undefined,
          go.factory.createVariableDeclarationList(
            [
              go.factory.createVariableDeclaration(
                'ch',
                go.factory.createChannelType(go.factory.createIdentifier('int')),
              ),
            ],
            go.NodeFlags.Var,
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('ch')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'bidirectional.go');
  });

  it('directional parameters', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createFunctionDeclaration(
        'worker',
        [
          go.factory.createFunctionParameter(
            ['jobs'],
            go.factory.createChannelType(go.factory.createIdentifier('int'), 'receive'),
          ),
          go.factory.createFunctionParameter(
            ['results'],
            go.factory.createChannelType(go.factory.createIdentifier('int'), 'send'),
          ),
        ],
        undefined,
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'directional-parameters.go');
  });
});
