import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('maps', () => {
  it('empty map', async () => {
    const mapType = go.factory.createMapType(
      go.factory.createIdentifier('string'),
      go.factory.createIdentifier('int'),
    );
    const lit = go.factory.createCompositeLiteral([], mapType);

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [go.factory.createVariableDeclaration('x', undefined, lit)],
          go.NodeFlags.Var,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('x')],
          ),
        ),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'empty-map.go');
  });

  it('map literal with basic types', async () => {
    const mapType = go.factory.createMapType(
      go.factory.createIdentifier('string'),
      go.factory.createIdentifier('int'),
    );
    const lit = go.factory.createCompositeLiteral(
      [
        go.factory.createKeyValueExpression(
          go.factory.createLiteral('route'),
          go.factory.createLiteral(66),
        ),
        go.factory.createKeyValueExpression(
          go.factory.createLiteral('root'),
          go.factory.createLiteral(0),
        ),
      ],
      mapType,
    );

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [go.factory.createVariableDeclaration('x', undefined, lit)],
          go.NodeFlags.Var,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('x')],
          ),
        ),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'basic-map.go');
  });

  it('map with struct value and keyed elements', async () => {
    const personType = go.factory.createStructType([
      { names: ['Name'], type: go.factory.createIdentifier('string') },
      { names: ['Age'], type: go.factory.createIdentifier('int') },
    ]);
    const mapType = go.factory.createMapType(go.factory.createIdentifier('string'), personType);
    const alice = go.factory.createCompositeLiteral([
      go.factory.createKeyValueExpression(
        go.factory.createIdentifier('Name'),
        go.factory.createLiteral('Alice'),
      ),
      go.factory.createKeyValueExpression(
        go.factory.createIdentifier('Age'),
        go.factory.createLiteral(30),
      ),
    ]);
    const bob = go.factory.createCompositeLiteral([
      go.factory.createKeyValueExpression(
        go.factory.createIdentifier('Name'),
        go.factory.createLiteral('Bob'),
      ),
      go.factory.createKeyValueExpression(
        go.factory.createIdentifier('Age'),
        go.factory.createLiteral(25),
      ),
    ]);

    const lit = go.factory.createCompositeLiteral(
      [
        go.factory.createKeyValueExpression(go.factory.createLiteral('alice'), alice),
        go.factory.createKeyValueExpression(go.factory.createLiteral('bob'), bob),
      ],
      mapType,
    );

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [go.factory.createVariableDeclaration('x', undefined, lit)],
          go.NodeFlags.Var,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('x')],
          ),
        ),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'struct-value-map.go');
  });
});
