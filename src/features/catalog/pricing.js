export const SIZE_GROUP = 'Ukuran';
export const TEMP_GROUP = 'Suhu';
export const ICE_GROUP = 'Es';
export const COLD_OPTION = 'Dingin';

function getGroup(groups, groupId) {
  return groups.find((group) => group.id === groupId);
}

function getSelectedOptions(group, selection) {
  const selectedIds = selection[group.id] ?? [];
  return group.options.filter((option) => selectedIds.includes(option.id));
}

export function getInitialSelection(groups) {
  return Object.fromEntries(
    groups
      .filter((group) => group.options.some((option) => option.isDefault))
      .map((group) => [
        group.id,
        group.options.filter((option) => option.isDefault).map((option) => option.id),
      ]),
  );
}

export function isGroupVisible(group, groups, selection) {
  if (group.name !== ICE_GROUP) return true;

  const temperatureGroup = groups.find((candidate) => candidate.name === TEMP_GROUP);
  return Boolean(
    temperatureGroup &&
    getSelectedOptions(temperatureGroup, selection).some((option) => option.name === COLD_OPTION),
  );
}

export function toggleOption(groups, selection, groupId, optionId) {
  const group = getGroup(groups, groupId);
  if (!group) return { ...selection };

  const nextSelection = { ...selection };
  const selectedIds = selection[groupId] ?? [];

  if (group.selectionType === 'single') {
    nextSelection[groupId] = [optionId];
  } else {
    nextSelection[groupId] = selectedIds.includes(optionId)
      ? selectedIds.filter((selectedId) => selectedId !== optionId)
      : [...selectedIds, optionId];
  }

  if (group.name === TEMP_GROUP) {
    const selectedOption = group.options.find((option) => option.id === optionId);
    const iceGroup = groups.find((candidate) => candidate.name === ICE_GROUP);

    if (selectedOption?.name === COLD_OPTION && iceGroup) {
      if (!(nextSelection[iceGroup.id] ?? []).length) {
        const defaultIce = iceGroup.options.find((option) => option.isDefault);
        if (defaultIce) nextSelection[iceGroup.id] = [defaultIce.id];
      }
    } else {
      if (iceGroup) nextSelection[iceGroup.id] = [];
    }
  }

  return nextSelection;
}

export function calcUnitPrice(basePrice, groups, selection) {
  return (
    basePrice +
    groups.reduce((total, group) => {
      if (!isGroupVisible(group, groups, selection)) return total;
      return (
        total +
        getSelectedOptions(group, selection).reduce((sum, option) => sum + option.priceDelta, 0)
      );
    }, 0)
  );
}

export function getMissingRequiredGroups(groups, selection) {
  return groups
    .filter(
      (group) =>
        group.isRequired &&
        isGroupVisible(group, groups, selection) &&
        getSelectedOptions(group, selection).length !== 1,
    )
    .map((group) => group.name);
}

export function buildCartItem(menu, groups, selection, quantity) {
  const selectedOptions = groups.flatMap((group) => {
    if (!isGroupVisible(group, groups, selection)) return [];
    return getSelectedOptions(group, selection).map((option) => ({
      groupId: group.id,
      groupName: group.name,
      optionId: option.id,
      optionName: option.name,
      priceDelta: option.priceDelta,
    }));
  });

  const optionKey = selectedOptions
    .map((option) => option.optionId)
    .sort((left, right) => String(left).localeCompare(String(right)))
    .join('-');

  return {
    key: `${menu.id}:${optionKey}`,
    menuId: menu.id,
    menuName: menu.name,
    basePrice: menu.basePrice,
    unitPrice: calcUnitPrice(menu.basePrice, groups, selection),
    quantity,
    note: '',
    selectedOptions,
  };
}
