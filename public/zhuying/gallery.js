const gallery = document.querySelector('#work-grid');
const total = document.querySelector('#work-total');
const filterButtons = document.querySelectorAll('.filters button');
const dialog = document.querySelector('#project-dialog');
const projectLink = document.querySelector('#project-link');
const motionToggle = document.querySelector('.motion-toggle');
const motionArt = [...document.querySelectorAll('.motion-art')];
const artSources = motionArt.map(image => image.getAttribute('src'));

motionToggle.hidden = false;
motionToggle.addEventListener('click', () => {
  const paused = document.documentElement.classList.toggle('motion-paused');
  motionArt.forEach((image, index) => {
    image.src = paused ? `${artSources[index]}#still` : artSources[index];
  });
  motionToggle.textContent = paused ? '播放动效' : '暂停动效';
});

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function makeLink(project) {
  const link = makeElement('a', '', `${project.action || '打开作品'} ↗`);
  link.href = project.href;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', `${project.action || '打开作品'}：${project.title}（新标签页）`);
  return link;
}

function showProject(project) {
  document.querySelector('#project-category').textContent = project.label;
  document.querySelector('#project-title').textContent = project.title;
  document.querySelector('#project-description').textContent = project.detail;
  document.querySelector('#project-points').replaceChildren(...project.points.map(point => makeElement('li', '', point)));
  const note = document.querySelector('#project-note');
  note.textContent = project.note || '';
  note.hidden = !project.note;
  projectLink.hidden = !project.href;
  if (project.href) {
    projectLink.href = project.href;
    projectLink.firstChild.textContent = `${project.action || '打开作品'} `;
    projectLink.setAttribute('aria-label', `${project.action || '打开作品'}：${project.title}（新标签页）`);
  } else {
    projectLink.removeAttribute('href');
  }
  dialog.showModal();
}

function makeProject(project) {
  const card = makeElement('article', 'project');
  card.dataset.category = project.category;
  const cover = makeElement('button', 'cover');
  cover.type = 'button';
  cover.dataset.tone = project.tone;
  cover.setAttribute('aria-label', `查看${project.title}的介绍`);
  cover.addEventListener('click', () => showProject(project));
  const graphic = makeElement('span', 'cover-graphic');
  graphic.setAttribute('aria-hidden', 'true');
  graphic.append(makeElement('span', '', project.mark), makeElement('small', '', project.coverLabel));
  if (project.image) {
    const image = makeElement('img', 'cover-image');
    image.alt = '';
    image.loading = 'lazy';
    image.src = project.image;
    if (project.imagePosition) image.style.setProperty('--position', project.imagePosition);
    image.addEventListener('error', () => cover.replaceChildren(graphic), { once: true });
    cover.append(image);
  } else {
    cover.append(graphic);
  }

  const body = makeElement('div', 'project-body');
  const actions = makeElement('div', 'project-actions');
  const details = makeElement('button', '', '项目介绍');
  details.type = 'button';
  details.setAttribute('aria-label', `项目介绍：${project.title}`);
  details.addEventListener('click', () => showProject(project));
  actions.append(details);
  if (project.href) actions.append(makeLink(project));
  body.append(
    makeElement('p', 'project-type', project.label),
    makeElement('h3', '', project.title),
    makeElement('p', 'project-desc', project.summary),
    actions,
  );
  card.append(cover, body);
  return card;
}

const cards = projects.map(makeProject);
gallery.append(...cards);

if ('IntersectionObserver' in window) {
  const revealCovers = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealing');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.2 });
  for (const cover of gallery.querySelectorAll('.cover')) revealCovers.observe(cover);
}

function filterProjects(category) {
  gallery.dataset.filter = category;
  let shown = 0;
  for (const card of cards) {
    card.hidden = category !== 'all' && card.dataset.category !== category;
    if (!card.hidden) shown++;
  }
  total.textContent = `${shown} 件作品`;
  for (const button of filterButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  }
}

for (const button of filterButtons) {
  button.addEventListener('click', () => filterProjects(button.dataset.filter));
}
filterProjects('all');
