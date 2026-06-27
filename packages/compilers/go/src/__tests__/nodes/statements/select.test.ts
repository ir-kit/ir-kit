import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('select statement', () => {
  it('receive, send, and default cases', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        undefined,
        'worker',
        undefined,
        [
          go.factory.createFunctionParameter(
            ['ch'],
            go.factory.createChannelType(go.factory.createIdentifier('int')),
          ),
          go.factory.createFunctionParameter(
            ['done'],
            go.factory.createChannelType(go.factory.createIdentifier('bool')),
          ),
        ],
        undefined,
        [
          go.factory.createSelectStatement([
            go.factory.createSelectCase(
              [
                go.factory.createExpressionStatement(
                  go.factory.createCallExpression(
                    go.factory.createMemberExpression(
                      go.factory.createIdentifier('fmt'),
                      go.factory.createIdentifier('Println'),
                    ),
                    [go.factory.createIdentifier('v')],
                  ),
                ),
              ],
              go.factory.createShortVarDeclaration(
                'v',
                go.factory.createUnaryExpression('<-', go.factory.createIdentifier('ch')),
              ),
            ),
            go.factory.createSelectCase(
              [
                go.factory.createExpressionStatement(
                  go.factory.createCallExpression(
                    go.factory.createMemberExpression(
                      go.factory.createIdentifier('fmt'),
                      go.factory.createIdentifier('Println'),
                    ),
                    [go.factory.createLiteral('done')],
                  ),
                ),
              ],
              go.factory.createSendStatement(
                go.factory.createIdentifier('done'),
                go.factory.createLiteral(true),
              ),
            ),
            go.factory.createSelectCase([
              go.factory.createExpressionStatement(
                go.factory.createCallExpression(
                  go.factory.createMemberExpression(
                    go.factory.createIdentifier('fmt'),
                    go.factory.createIdentifier('Println'),
                  ),
                  [go.factory.createLiteral('waiting')],
                ),
              ),
            ]),
          ]),
        ],
      ),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, []),
    ]);
    await assertPrintedMatchesSnapshot(file, 'select.go');
  });
});
