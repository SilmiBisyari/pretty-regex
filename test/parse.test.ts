import assert from 'node:assert/strict';
import { parse } from '~/parse';

describe('parse function', () => {
  it('should parse a simple text string', () => {
    const tree = parse('foo');

    assert.equal(tree.type, 'root', 'root type should be "root"');
    assert.equal(tree.nodes.length, 1, 'should have 1 node for "foo"');
    assert.equal(tree.nodes[0].type, 'text', 'node should be of type "text"');
    assert.equal(tree.print(false), 'foo', 'printed tree should match input');
  });

  it('should parse regular expression with character classes', () => {
    const tree = parse('[a-z]');

    assert.equal(tree.type, 'root', 'tree type should be "root"');
    assert.equal(tree.nodes.length, 1, 'should have one block node');
    assert.equal(tree.nodes[0].type, 'bracket', 'node should be of type "bracket"');
    assert.equal(tree.nodes[0].nodes.length, 3, 'bracket should contain 3 nodes');
    assert.equal(tree.nodes[0].nodes[0].type, 'left_bracket', 'first node should be left_bracket');
    assert.equal(tree.nodes[0].nodes[1].type, 'text', 'middle node should be text');
    assert.equal(tree.nodes[0].nodes[2].type, 'right_bracket', 'last node should be right_bracket');
    assert.equal(tree.print(false), '[a-z]', 'printed tree should match input');
  });

  it('should parse regex with quantifiers', () => {
    const tree = parse('a+b*c?');

    assert.equal(tree.nodes.length, 6, 'should have 6 nodes');
    assert.equal(tree.nodes[0].type, 'text', 'first node should be text');
    assert.equal(tree.nodes[1].type, 'plus', 'second node should be plus');
    assert.equal(tree.nodes[2].type, 'text', 'third node should be text');
    assert.equal(tree.nodes[3].type, 'star', 'fourth node should be star');
    assert.equal(tree.nodes[4].type, 'text', 'fifth node should be text');
    assert.equal(tree.nodes[5].type, 'qmark', 'sixth node should be qmark');
    assert.equal(tree.print(false), 'a+b*c?', 'printed tree should match input');
  });

  it('should parse parenthesized groups', () => {
    const tree = parse('(abc)');

    assert.equal(tree.nodes.length, 1, 'should have one block node');
    assert.equal(tree.nodes[0].type, 'paren', 'node should be of type "paren"');
    assert.equal(tree.nodes[0].nodes.length, 3, 'paren should contain 3 nodes');
    assert.equal(tree.nodes[0].nodes[0].type, 'left_paren', 'first node should be left_paren');
    assert.equal(tree.nodes[0].nodes[1].type, 'text', 'middle node should be text');
    assert.equal(tree.nodes[0].nodes[2].type, 'right_paren', 'last node should be right_paren');
    assert.equal(tree.print(false), '(abc)', 'printed tree should match input');
  });

  it('should parse braces for repetition', () => {
    const tree = parse('a{2,5}');

    assert.equal(tree.nodes.length, 2, 'should have 2 nodes');
    assert.equal(tree.nodes[0].type, 'text', 'first node should be text');
    assert.equal(tree.nodes[1].type, 'brace', 'second node should be brace');
    assert.equal(tree.nodes[1].nodes.length, 5, 'brace should contain 5 nodes');
    assert.equal(tree.nodes[1].nodes[0].type, 'left_brace', 'first node in brace should be left_brace');
    assert.equal(tree.nodes[1].nodes[1].type, 'number', 'second node in brace should be number');
    assert.equal(tree.nodes[1].nodes[2].type, 'comma', 'third node in brace should be comma');
    assert.equal(tree.print(false), 'a{2,5}', 'printed tree should match input');
  });

  it('should parse escaped characters', () => {
    const tree = parse('\\d\\w\\s');

    assert.equal(tree.nodes.length, 1, 'should have 1 node');
    assert.equal(tree.nodes[0].type, 'escaped', 'node should be of type "escaped"');
    assert.equal(tree.print(false), '\\d\\w\\s', 'printed tree should match input');
  });

  it('should parse alternation with pipe', () => {
    const tree = parse('a|b|c');

    assert.equal(tree.nodes.length, 5, 'should have 5 nodes');
    assert.equal(tree.nodes[0].type, 'text', 'first node should be text');
    assert.equal(tree.nodes[1].type, 'pipe', 'second node should be pipe');
    assert.equal(tree.nodes[2].type, 'text', 'third node should be text');
    assert.equal(tree.nodes[3].type, 'pipe', 'fourth node should be pipe');
    assert.equal(tree.nodes[4].type, 'text', 'fifth node should be text');
    assert.equal(tree.print(false), 'a|b|c', 'printed tree should match input');
  });

  it('should parse anchors', () => {
    const tree = parse('^abc$');

    assert.equal(tree.nodes.length, 3, 'should have 3 nodes');
    assert.equal(tree.nodes[0].type, 'caret', 'first node should be caret');
    assert.equal(tree.nodes[1].type, 'text', 'second node should be text');
    assert.equal(tree.nodes[2].type, 'dollar', 'last node should be dollar');
    assert.equal(tree.print(false), '^abc$', 'printed tree should match input');
  });

  it('should parse nested groups', () => {
    const tree = parse('(a(b)c)');

    assert.equal(tree.nodes.length, 1, 'should have one block node');
    assert.equal(tree.nodes[0].type, 'paren', 'node should be of type "paren"');

    // Check the structure of inner nodes
    const innerNodes = tree.nodes[0].nodes;
    assert.equal(innerNodes.length, 5, 'outer paren should contain 5 nodes');
    assert.equal(innerNodes[0].type, 'left_paren', 'first node should be left_paren');
    assert.equal(innerNodes[1].type, 'text', 'second node should be text');
    assert.equal(innerNodes[2].type, 'paren', 'third node should be paren');
    assert.equal(innerNodes[3].type, 'text', 'fourth node should be text');
    assert.equal(innerNodes[4].type, 'right_paren', 'last node should be right_paren');
    assert.equal(tree.print(false), '(a(b)c)', 'printed tree should match input');
  });

  it('should parse complex patterns with multiple features', () => {
    const tree = parse('(a|b)+[0-9]{1,3}\\w*');

    assert.equal(tree.nodes.length, 6, 'should have 6 root nodes');
    assert.equal(tree.print(false), '(a|b)+[0-9]{1,3}\\w*', 'printed tree should match input');
  });

  it('should handle empty input', () => {
    const tree = parse('');

    assert.equal(tree.type, 'root', 'tree type should be "root"');
    assert.equal(tree.nodes.length, 0, 'should have no nodes');
    assert.equal(tree.print(false), '', 'printed tree should be empty');
  });

  it('should parse regex flags', () => {
    const tree = parse('/abc/gi');

    assert.equal(tree.nodes.length, 4, 'should have 4 nodes');
    assert.equal(tree.nodes[0].type, 'slash', 'first node should be slash');
    assert.equal(tree.nodes[3].type, 'flags', 'last node should be flags');
    assert.equal(tree.print(false), '/abc/gi', 'printed tree should match input');
  });

  it('should handle escaped brackets inside character class', () => {
    const tree = parse('[\\[\\]]');

    assert.equal(tree.nodes.length, 1, 'should have one block node');
    assert.equal(tree.nodes[0].type, 'bracket', 'node should be of type "bracket"');

    // Inside brackets, escapes are treated as text
    const innerNodes = tree.nodes[0].nodes;
    assert.equal(innerNodes.length, 3, 'bracket should contain 3 nodes');
    assert.equal(innerNodes[0].type, 'left_bracket', 'first node should be left_bracket');
    assert.equal(innerNodes[1].type, 'text', 'middle node should be text');
    assert.equal(innerNodes[2].type, 'right_bracket', 'last node should be right_bracket');

    assert.equal(tree.print(false), '[\\[\\]]', 'printed tree should match input');
  });

  it('should parse unicode escapes', () => {
    const tree = parse('\\u0061\\u0062\\u0063');

    assert.equal(tree.nodes.length, 1, 'should have 1 node');
    assert.equal(tree.nodes[0].type, 'escaped', 'node should be of type "escaped"');
    assert.equal(tree.print(false), '\\u0061\\u0062\\u0063', 'printed tree should match input');
  });

  it('should handle unclosed groups properly', () => {
    const tree = parse('(abc');

    assert.equal(tree.nodes.length, 1, 'should have one block node');
    assert.equal(tree.nodes[0].type, 'paren', 'node should be of type "paren"');
    assert.equal(tree.nodes[0].nodes.length, 2, 'paren should contain 2 nodes');
    assert.equal(tree.nodes[0].nodes[0].type, 'left_paren', 'first node should be left_paren');
    assert.equal(tree.nodes[0].nodes[1].type, 'text', 'second node should be text');
    assert.equal(tree.print(false), '(abc', 'printed tree should match input');
  });

  it('should handle unclosed character classes', () => {
    const tree = parse('[abc');

    assert.equal(tree.nodes.length, 1, 'should have one block node');
    assert.equal(tree.nodes[0].type, 'bracket', 'node should be of type "bracket"');
    assert.equal(tree.nodes[0].nodes.length, 2, 'bracket should contain 2 nodes');
    assert.equal(tree.nodes[0].nodes[0].type, 'left_bracket', 'first node should be left_bracket');
    assert.equal(tree.nodes[0].nodes[1].type, 'text', 'second node should be text');
    assert.equal(tree.print(false), '[abc', 'printed tree should match input');
  });

  it('should handle special characters in character classes', () => {
    const tree = parse('[+*?.^$()]');

    assert.equal(tree.nodes.length, 1, 'should have one block node');
    assert.equal(tree.nodes[0].type, 'bracket', 'node should be of type "bracket"');

    // Inside brackets, special chars are treated as text
    const innerNodes = tree.nodes[0].nodes;
    assert.equal(innerNodes.length, 3, 'bracket should contain 3 nodes');
    assert.equal(innerNodes[0].type, 'left_bracket', 'first node should be left_bracket');
    assert.equal(innerNodes[1].type, 'text', 'middle node should be text');
    assert.equal(innerNodes[2].type, 'right_bracket', 'last node should be right_bracket');

    assert.equal(tree.print(false), '[+*?.^$()]', 'printed tree should match input');
  });

  it('should parse lookahead assertions', () => {
    const tree = parse('a(?=b)');

    assert.equal(tree.nodes.length, 2, 'should have 2 nodes');
    assert.equal(tree.nodes[0].type, 'text', 'first node should be text');
    assert.equal(tree.nodes[1].type, 'paren', 'second node should be paren');
    assert.equal(tree.print(false), 'a(?=b)', 'printed tree should match input');
  });

  it('should parse negative lookahead assertions', () => {
    const tree = parse('a(?!b)');

    assert.equal(tree.nodes.length, 2, 'should have 2 nodes');
    assert.equal(tree.nodes[0].type, 'text', 'first node should be text');
    assert.equal(tree.nodes[1].type, 'paren', 'second node should be paren');
    assert.equal(tree.print(false), 'a(?!b)', 'printed tree should match input');
  });

  it('should handle numbers correctly', () => {
    const tree = parse('123');

    assert.equal(tree.nodes.length, 3, 'should have 3 nodes');
    assert.equal(tree.nodes[0].type, 'number', 'first node should be of type "number"');
    assert.equal(tree.nodes[1].type, 'number', 'second node should be of type "number"');
    assert.equal(tree.nodes[2].type, 'number', 'third node should be of type "number"');
    assert.equal(tree.print(false), '123', 'printed tree should match input');
  });

  it('should handle a mix of upper and lowercase letters', () => {
    const tree = parse('AbCdEf');

    assert.equal(tree.nodes.length, 1, 'should have 1 node');
    assert.equal(tree.nodes[0].type, 'text', 'should be text node');
    assert.equal(tree.print(false), 'AbCdEf', 'printed tree should match input');
  });

  it('should handle nested blocks with multiple levels', () => {
    const tree = parse('(a[b(c{2})]d)');

    assert.equal(tree.nodes.length, 1, 'should have one block node');
    assert.equal(tree.nodes[0].type, 'paren', 'node should be of type "paren"');
    assert.equal(tree.nodes[0].nodes.length, 5, 'should have 5 nodes in outer paren');
    assert.equal(tree.print(false), '(a[b(c{2})]d)', 'printed tree should match input');
  });

  it('should handle undefined input by converting to string', () => {
    const tree = parse(undefined);

    assert.equal(tree.type, 'root', 'tree type should be "root"');
    assert.equal(tree.print(false), 'undefined', 'printed tree should be "undefined"');
  });

  it('should handle null input by converting to string', () => {
    const tree = parse(null);

    assert.equal(tree.type, 'root', 'tree type should be "root"');
    assert.equal(tree.print(false), 'null', 'printed tree should be "null"');
  });

  it('should handle number input by converting to string', () => {
    const tree = parse(42);

    assert.equal(tree.type, 'root', 'tree type should be "root"');
    assert.equal(tree.print(false), '42', 'printed tree should be "42"');
  });

  it('should handle continuous special characters', () => {
    const tree = parse('a+b+c+');

    assert.equal(tree.nodes.length, 6, 'should have 6 nodes');
    assert.equal(tree.nodes[0].type, 'text', 'first node should be text');
    assert.equal(tree.nodes[1].type, 'plus', 'second node should be plus');
    assert.equal(tree.nodes[2].type, 'text', 'third node should be text');
    assert.equal(tree.nodes[3].type, 'plus', 'fourth node should be plus');
    assert.equal(tree.nodes[4].type, 'text', 'fifth node should be text');
    assert.equal(tree.nodes[5].type, 'plus', 'sixth node should be plus');
    assert.equal(tree.print(false), 'a+b+c+', 'printed tree should match input');
  });

  it('should handle nested brackets correctly', () => {
    const tree = parse('[[a-z][0-9]]');

    assert.equal(tree.nodes.length, 3, 'should have 3 nodes');
    assert.equal(tree.nodes[0].type, 'bracket', 'first node should be of type "bracket"');
    assert.equal(tree.nodes[1].type, 'bracket', 'second node should be of type "bracket"');
    assert.equal(tree.nodes[2].type, 'text', 'third node should be of type "text"');
    assert.equal(tree.print(false), '[[a-z][0-9]]', 'printed tree should match input');
  });

  it('should handle character class with negation', () => {
    const tree = parse('[^abc]');

    assert.equal(tree.nodes.length, 1, 'should have one root node');
    assert.equal(tree.nodes[0].type, 'bracket', 'node should be of type "bracket"');
    assert.equal(tree.nodes[0].nodes.length, 3, 'bracket should contain 3 nodes');
    assert.equal(tree.nodes[0].nodes[1].value.includes('^'), true, 'negation should be in text node');
    assert.equal(tree.print(false), '[^abc]', 'printed tree should match input');
  });

  it('should handle regex with backslash followed by number', () => {
    const tree = parse('\\1\\2\\3');

    assert.equal(tree.nodes.length, 1, 'should have 1 node');
    assert.equal(tree.nodes[0].type, 'escaped', 'node should be of type "escaped"');
    assert.equal(tree.print(false), '\\1\\2\\3', 'printed tree should match input');
  });

  it('should handle regex with dot', () => {
    const tree = parse('a.b');

    assert.equal(tree.nodes.length, 3, 'should have 3 nodes');
    assert.equal(tree.nodes[0].type, 'text', 'first node should be text');
    assert.equal(tree.nodes[1].type, 'dot', 'second node should be dot');
    assert.equal(tree.nodes[2].type, 'text', 'third node should be text');
    assert.equal(tree.print(false), 'a.b', 'printed tree should match input');
  });
});
