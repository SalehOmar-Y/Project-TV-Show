const state = {
  episodes: [],
  searchTerm: "",
};

function createEpisodeCard(episode) {
  const episodeCard = document.createElement("div");
  episodeCard.className = "episode-card";
  episodeCard.id = `episode-${episode.id}`;

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
  const filteredEpisodes = state.episodes.filter(function (episode) {
    const titleMatches = episode.name
      .toLowerCase()
      .includes(state.searchTerm.toLowerCase());
    const summaryMatches = episode.summary
      .toLowerCase()
      .includes(state.searchTerm.toLowerCase());
    return titleMatches || summaryMatches;
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

function dropDownSelector() {
  const selectField = document.getElementById("episode-selection");
  // create options
  state.episodes.forEach((episode) => {
    const newOption = document.createElement("option");
    newOption.value = episode.id;
    newOption.textContent = `S${String(episode.season).padStart(
      2,
      "0"
    )}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;
    selectField.append(newOption);
  });

  // Scroll to episode when selected
  selectField.addEventListener("change", function (event) {
    const selectedId = event.target.value;
    if (!selectedId) return;
    const episodeElement = document.getElementById(`episode-${selectedId}`);
    if (episodeElement) {
      episodeElement.scrollIntoView({ behavior: "smooth" });
    }
  });
}
function setup() {
  state.episodes = getAllEpisodes();
  render();
  dropDownSelector();
}

window.onload = setup;
