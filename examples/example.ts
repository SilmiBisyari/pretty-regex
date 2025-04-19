import { parse } from '../src/index';

const tree = parse(/^a(?<foo>z)[a-b]$/);

console.log(tree);
console.log(tree.print());
