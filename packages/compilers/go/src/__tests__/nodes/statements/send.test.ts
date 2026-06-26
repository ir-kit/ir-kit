import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('send statement', () => {
  it('send and receive', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createFunctionDeclaration(
        'relay',
        [
          go.factory.createFunctionParameter(
            ['in'],
            go.factory.createChannelType(go.factory.createIdentifier('int')),
          ),
          go.factory.createFunctionParameter(
            ['out'],
            go.factory.createChannelType(go.factory.createIdentifier('int')),
          ),
        ],
        undefined,
        [
          go.factory.createShortVarDeclaration(
            'v',
            go.factory.createUnaryExpression('<-', go.factory.createIdentifier('in')),
          ),
          go.factory.createSendStatement(
            go.factory.createIdentifier('out'),
            go.factory.createIdentifier('v'),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'send-and-receive.go');
  });
});
