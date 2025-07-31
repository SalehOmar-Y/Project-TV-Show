//You can edit ALL of the code here
const state = {
  episodes: [],
};

function createEpisodeCard(episode) {
  const card = document.createElement("div");
  card.className = "episode-card";

    const code = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;

    card.innerHTML = `
      <img src="${episode.image?.medium || ''}" alt="${episode.name}" />
      <h2>${code} - ${episode.name}</h2>
      <p>${episode.summary?.replace(/<[^>]*>/g, '')}</p>
      <a href="${episode.url}" target="_blank">View on TVMaze</a>
    `;

    return card;
  }

function render() {
  const rootElem = document.getElementById("root");
  rootElem.textContent = ""; // Clear the page

  const container = document.createElement("div");
  container.className = "episodes-container";

  const cards = state.episodes.map(createEpisodeCard);
  container.append(...cards);
  rootElem.appendChild(container);

  const footer = document.createElement("footer");
  footer.innerHTML = `Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>`;
  rootElem.appendChild(footer);
}

function setup() {
  state.episodes = getAllEpisodes();
  render();;
} 

window.onload = setup;
