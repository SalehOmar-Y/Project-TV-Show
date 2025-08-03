//You can edit ALL of the code here
const state = {
  episodes: [],
};

function createEpisodeCard(episode) {
  const episodeCard = document.createElement("div");
  episodeCard.className = "episode-card";

  const episodeTitle = `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;

  episodeCard.innerHTML = `
      <img src="${episode.image?.medium || ""}" alt="${episode.name}" />
      <h2>${episodeTitle} - ${episode.name}</h2>
      <p>${episode.summary?.replace(/<[^>]*>/g, "")}</p>
      <a href="${episode.url}" target="_blank">View on TVMaze</a>
    `;

  return episodeCard;
}

function render() {
  const rootElem = document.getElementById("root");
  rootElem.textContent = ""; // Clear the page

  const container = document.createElement("div");
  container.className = "episodes-container";

  const allEpisodeCards = state.episodes.map(createEpisodeCard);
  container.append(...allEpisodeCards);
  rootElem.appendChild(container);

  const footer = document.createElement("footer");
  footer.innerHTML = `Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>`;
  rootElem.appendChild(footer);
}

// we need to get the search filed from the DOM
const input = document.getElementById("q");
// we need to listen to the event when user type
input.addEventListener("keyup", function () {
  console.log("key pressed");
});

function setup() {
  state.episodes = getAllEpisodes();
  render();
}

window.onload = setup;
