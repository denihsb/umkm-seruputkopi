export function formatOptionsSummary(selectedOptions) {
  return selectedOptions
    .map(({ groupName, optionName }) =>
      groupName === 'Ukuran' || groupName === 'Suhu' ? optionName : `${groupName}: ${optionName}`,
    )
    .join(' · ');
}
