export function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  };
}

export function mapMenu(row) {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: category?.name ?? null,
    name: row.name,
    description: row.description,
    basePrice: row.base_price,
    imageUrl: row.image_url,
  };
}

export function groupVariants(rows = []) {
  const groups = new Map();

  rows
    .filter((row) => row.is_active !== false)
    .forEach((row) => {
      const group = Array.isArray(row.variant_groups) ? row.variant_groups[0] : row.variant_groups;
      if (!group) return;

      if (!groups.has(group.id)) {
        groups.set(group.id, {
          id: group.id,
          name: group.name,
          selectionType: group.selection_type,
          isRequired: group.is_required,
          sortOrder: group.sort_order,
          options: [],
        });
      }

      groups.get(group.id).options.push({
        id: row.id,
        name: row.name,
        priceDelta: row.price_delta,
        isDefault: row.is_default,
      });
    });

  return [...groups.values()]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((group) => ({
      ...group,
      options: group.options.sort(
        (left, right) =>
          Number(right.isDefault) - Number(left.isDefault) || left.name.localeCompare(right.name),
      ),
    }));
}

export function mapMenuDetail(row) {
  return {
    ...mapMenu(row),
    variantGroups: groupVariants(row.menu_variants),
  };
}
