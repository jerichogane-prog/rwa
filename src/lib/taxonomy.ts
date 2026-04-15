import type { TaxonomyNode } from '@/lib/wp';
import type { SelectOption } from '@/components/search/SearchForm';

export function flattenTaxonomy(
  nodes: TaxonomyNode[],
  depth = 0,
  acc: SelectOption[] = [],
): SelectOption[] {
  for (const node of nodes) {
    acc.push({ value: node.slug, label: node.name, depth });
    if (node.children?.length) {
      flattenTaxonomy(node.children, depth + 1, acc);
    }
  }
  return acc;
}
