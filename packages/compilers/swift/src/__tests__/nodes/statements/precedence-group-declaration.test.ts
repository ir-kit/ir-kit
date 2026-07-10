import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('precedence group declaration', () => {
  it('with associativity and relations', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createPrecedenceGroupDeclaration(
        'MyPrecedence',
        'left',
        ['AdditionPrecedence'],
        ['MultiplicationPrecedence'],
        false,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-associativity-and-relations.swift');
  });
});
