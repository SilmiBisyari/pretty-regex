import { red, blue, yellow, green, cyan, white } from 'ansi-colors';

export const chars = {
  backslash: '\\',
  backtick: '`',
  caret: '^',
  colon: ':',
  comma: ',',
  dollar: '$',
  dot: '.',
  double_quote: '"',
  equal: '=',
  left_angle: '<',
  left_brace: '{',
  left_bracket: '[',
  left_paren: '(',
  not: '!',
  pipe: '|',
  plus: '+',
  qmark: '?',
  right_angle: '>',
  right_brace: '}',
  right_bracket: ']',
  right_paren: ')',
  single_quote: "'",
  slash: '/',
  star: '*'
};

const charmap = new Map();

for (const key of Object.keys(chars)) {
  charmap.set(chars[key], key);
}

export class Node {
  constructor(node) {
    this.type = node.type;
    this.value = node.value || '';
  }

  append(value = '', output = '') {
    // eslint-disable-next-line
    this.parent && this.parent.append(value, output);
    this.value += value;
  }

  print(styles) {
    const { parent, type, prev } = this;
    const output = this.value;

    if (styles === false) {
      return output;
    }

    if (type === 'dot') {
      return blue(output);
    }

    if (type === 'flags') {
      return red(output);
    }

    if (type === 'left_angle' && parent.type === 'paren' && prev.type === 'qmark') {
      return red(output);
    }

    if (parent.type === 'paren') {
      if ((type === 'equal' || type === 'not') && prev.type === 'left_angle') {
        return red(output);
      }

      if (['equal', 'not', 'colon'].includes(type) && prev.type === 'qmark') {
        return red(output);
      }
    }

    if (type === 'qmark' && prev.type !== 'left_paren') {
      return red(output);
    }

    if (['qmark', 'paren'].includes(type)) {
      return red(output);
    }

    if (type === 'escaped') {
      return /^\\[0-9]/.test(output) ? red(output) : blue(output);
    }

    if (type.endsWith('bracket') || parent.type === 'bracket') {
      if (output[0] === '^') {
        return red(output[0]) + blue(output.slice(1));
      }

      return blue(output);
    }

    if (['caret', 'dollar', 'star', 'pipe', 'plus'].includes(type)) {
      return red(output);
    }

    if (parent.type === 'brace') {
      if (type === 'equal') {
        return cyan(output);
      }

      if (type === 'number') {
        return cyan(output);
      }

      if (prev?.type === 'left_brace') {
        return yellow.bold(output);
      }

      if (prev?.type === 'equal') {
        return yellow.bold(output);
      }

    }

    if (type.endsWith('brace') || (type === 'comma' && parent.type === 'brace')) {
      return red(output);
    }

    if (type.endsWith('paren')) {
      return yellow(output);
    }

    if (type.endsWith('angle')) {
      return white(output);
    }

    return yellow(output);
  }

  get siblings() {
    return this.parent && this.parent.nodes || [];
  }

  get index() {
    return this.siblings.indexOf(this);
  }

  get prev() {
    const prev = this.siblings[this.index - 1];
    if (!prev && this.parent) {
      return this.parent.prev;
    }
    return prev;
  }

  get next() {
    return this.siblings[this.index + 1];
  }
}

export class Block extends Node {
  constructor(node) {
    super(node);
    this.nodes = [];
  }
  push(node) {
    this.nodes.push(node);

    Reflect.defineProperty(node, 'parent', {
      enumerable: false,
      writable: true,
      value: this
    });
  }

  printNodes(nodes = [], styles = true) {
    return nodes.map(node => node.print(styles)).join('');
  }

  printInner(styles = true) {
    return this.printNodes(this.nodes.slice(1, -1), styles);
  }

  print(styles = true) {
    const { type, prev, parent } = this;

    if (styles && prev && prev.type === 'qmark' && type === 'angle') {
      if (parent.type === 'paren') {
        return `<${green(this.printInner(false))}>`;
      }
    }

    return this.printNodes(this.nodes, styles);
  }
}

export const parse = value => {
  const input = String(value);
  const tree = new Block({ type: 'root', nodes: [] });
  const stack = [tree];

  // eslint-disable-next-line prefer-const
  let slashes = 0;
  let block = tree;
  let prev;
  let i = 0;

  const push = node => {
    const types = ['text', 'escaped', 'flags'];

    if (types.includes(node.type) && prev?.type === node.type) {
      prev.append(node.value);
      return;
    }

    if (!(node instanceof Node)) {
      node = node.nodes ? new Block(node) : new Node(node);
    }

    block.push(node);

    if (node.nodes) {
      stack.push(node);
      block = node;
    } else {
      block.append(node.value);
    }

    prev = node;
  };

  const pop = () => {
    const parent = stack.pop();
    block = stack[stack.length - 1];
    return parent;
  };

  for (; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const value = input[i];
    const token = { type: 'unknown', value };

    /**
     * Flags
     */

    if (slashes === 2) {
      token.type = 'flags';

      if (prev?.type === 'flags') {
        prev.append(value);
        continue;
      }

      push(token);
      continue;
    }

    /**
     * Escaped characters
     */

    if (value === '\\') {
      token.type = block.type === 'bracket' ? 'text' : 'escaped';

      if (/^u[0-9]{4}/.test(input.slice(i + 1))) {
        token.value += input.slice(i + 1, i + 6);
        i += 5;
      } else {
        token.value += input[++i];
      }

      push(token);
      continue;
    }

    /**
     * Inside character class
     */

    if (block.type === 'bracket' && value !== ']') {
      token.type = 'text';
      push(token);
      continue;
    }

    /**
     * Numbers
     */

    if (code >= 48 && code <= 57) {
      token.type = 'number';
      push(token);
      continue;
    }

    /**
     * [`_a-z]
     */

    if (code >= 95 && code <= 122) {
      token.type = 'text';
      token.lower = true;
      push(token);
      continue;
    }

    /**
     * [`A-Z]
     */

    if (code >= 65 && code <= 90) {
      token.type = 'text';
      token.upper = true;
      push(token);
      continue;
    }

    /**
     * Braces
     */

    if (value === '{') {
      token.type = 'left_brace';
      push(new Block({ type: 'brace' }));
      push(token);
      continue;
    }

    if (value === '}') {
      token.type = 'right_brace';

      if (block.type === 'brace') {
        push(token);
        pop();
        continue;
      }

      push(token);
      continue;
    }

    /**
     * Character classes
     */

    if (value === '[') {
      token.type = 'left_bracket';
      push(new Block({ type: 'bracket' }));
      push(token);
      continue;
    }

    if (value === ']') {
      token.type = 'right_bracket';

      if (block.type === 'bracket') {
        push(token);
        pop();
        continue;
      }

      token.type = 'text';
      push(token);
      continue;
    }

    /**
     * Angle brackets
     */

    if (value === '<') {
      token.type = 'left_angle';

      if (block.type === 'paren' && prev.type === 'qmark') {
        const next = input[i + 1];

        if (next === '!' || next === '=') {
          push(token);
          continue;
        }
      }

      push(new Block({ type: 'angle' }));
      push(token);
      continue;
    }

    if (value === '>') {
      token.type = 'right_angle';

      if (block.type === 'angle') {
        push(token);
        pop();
        continue;
      }

      push(token);
      continue;
    }

    /**
     * Parentheses
     */

    if (value === '(') {
      token.type = 'left_paren';
      push(new Block({ type: 'paren' }));
      push(token);
      continue;
    }

    if (value === ')') {
      token.type = 'right_paren';

      if (block.type === 'paren') {
        push(token);
        pop();
        continue;
      }

      push(token);
      continue;
    }

    /**
     * Charmap
    */

    if (charmap.has(value)) {
      token.type = charmap.get(value);

      if (token.type === 'slash' && block.type === 'root') {
        slashes++;
      }

      push(token);
      continue;
    }

    /**
     * Everything else
     */

    token.type = 'text';
    push(token);
  }

  return tree;
};
