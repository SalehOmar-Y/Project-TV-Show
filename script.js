//You can edit ALL of the code here
const state = {
  episodes: [],
  searchTerm: "",
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

  // filtering the episodes
  const filteredEpisodes = state.episodes.filter(function(episode) {
    return episode.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ;
  });

  // update the filtered-info tag by showing how many episodes matched
  const filteredMessage = document.getElementById("filtered-info");
  filteredMessage.textContent = `Displaying ${filteredEpisodes.length}/${state.episodes.length}`;

  const allEpisodeCards = filteredEpisodes.map(createEpisodeCard);
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
  // update the searchTerm
  state.searchTerm = input.value;
  render();
});

function setup() {
  state.episodes = getAllEpisodes();
  render();
}

window.onload = setup;
