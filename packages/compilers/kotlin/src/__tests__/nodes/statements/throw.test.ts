import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

const call = (name: string, args: Parameters<typeof f.createCallExpression>[1] = []) =>
  f.createCallExpression(id(name), args);
const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);
const str = (text: string) => f.createStringLiteral([{ text }]);

describe('throw statement', () => {
  it('throw an exception', async () => {
    const node = f.createFunctionDeclaration('fail', [], undefined, [
      stmt(call('log', [{ expression: str('failing') }])),
      f.createThrowStatement(call('IllegalStateException', [{ expression: str('unsupported') }])),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), 'throw.kt');
  });

  it('guarded throw', async () => {
    const node = f.createFunctionDeclaration(
      'validate',
      [f.createParameter('value', f.createUserType('Int'))],
      undefined,
      [
        f.createIfStatement(
          f.createBinaryExpression(id('value'), '<', f.createLiteral('0', 'int')),
          f.createThrowStatement(
            call('IllegalArgumentException', [{ expression: str('negative') }]),
          ),
        ),
        stmt(call('store', [{ expression: id('value') }])),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'guarded.kt');
  });
});
