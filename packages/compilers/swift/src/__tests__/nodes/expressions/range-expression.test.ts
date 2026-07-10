import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('range expression', () => {
  it('half-open range', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'r',
          value: swift.factory.createRangeExpression(
            '..<',
            swift.factory.createIntegerLiteral('0'),
            swift.factory.createIntegerLiteral('10'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'half-open-range.swift');
  });

  it('closed range', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'r',
          value: swift.factory.createRangeExpression(
            '...',
            swift.factory.createIntegerLiteral('1'),
            swift.factory.createIntegerLiteral('5'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'closed-range.swift');
  });
});
