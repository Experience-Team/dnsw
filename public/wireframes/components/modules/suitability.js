// "Who is this for", bound to `product.suitability` (contract §13). A
// shared cross-type summary — deliberately overlaps with several
// type-specific extension-block fields (§6), see extension.js and the
// contract's own overlap note in §13.

const WEATHER_LABELS = {
  indoor: 'Indoor',
  outdoor_weather_dependent: 'Outdoor, weather dependent',
  all_weather: 'All weather',
};

function fieldHtml(label, value) {
  return `<div class="detail-block-field"><p class="detail-block-label">${label}</p><p class="detail-block-value">${value}</p></div>`;
}

export function mount(container, product) {
  const s = product.suitability;
  if (!s) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const fields = [
    (s.suitable_for ?? []).length > 0 ? fieldHtml('Suitable for', s.suitable_for.join(', ')) : '',
    s.age_guidance ? fieldHtml('Age guidance', s.age_guidance) : '',
    (s.dietary_options ?? []).length > 0 ? fieldHtml('Dietary options', s.dietary_options.join(', ')) : '',
    (s.languages_offered ?? []).length > 0 ? fieldHtml('Languages offered', s.languages_offered.join(', ')) : '',
    s.fitness_level ? fieldHtml('Fitness level', s.fitness_level.charAt(0).toUpperCase() + s.fitness_level.slice(1)) : '',
    s.pet_policy ? fieldHtml('Pet policy', s.pet_policy) : '',
    s.group_size ? fieldHtml('Group size', `${s.group_size.min}–${s.group_size.max}`) : '',
    s.weather_dependency ? fieldHtml('Weather', WEATHER_LABELS[s.weather_dependency] ?? s.weather_dependency) : '',
  ].join('');

  if (fields.trim() === '') {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.className = 'suitability-module detail-block';
  container.innerHTML = `
    <p class="section-title">Suitability</p>
    <div class="detail-block-grid">${fields}</div>
  `;
}
