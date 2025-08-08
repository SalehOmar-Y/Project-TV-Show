const state = {
  shows: [],
  episodes: [],
  searchTerm: "",
  selectedEpisodeId: "",
  selectedShowId: null,
};
const episodeCache = {};

// Fetch all episodes for the show with ID
function fetchEpisodes(showId) {
  if (episodeCache[showId]) {
    return Promise.resolve(episodeCache[showId]); // return cached
  }
  return fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => response.json())
    .then((data) => {
      episodeCache[showId] = data; // ✅ store in cache
      return data;
    });
}

// we need to fetch shows using url
function fetchShows() {
  return fetch("https://api.tvmaze.com/shows").then(function (data) {
    return data.json();
  });
}

// Create a single episode card element from an episode object
function createEpisodeCard(episode) {
  const episodeCard = document.createElement("div"); // create a new container for the episode
  episodeCard.className = "episode-card"; // add a class for styling
  episodeCard.id = `episode-${episode.id}`; // set an ID for easy reference

  // Format the episode title as "S01E03"
  const episodeTitle = `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;

  // build the HTML structure for the episode card
  episodeCard.innerHTML = `
      <img src="${episode.image?.medium || ""}" alt="${episode.name}" />
      <h2>${episodeTitle} - ${episode.name}</h2>
      <p>${episode.summary?.replace(/<[^>]*>/g, "")}</p>
      <a href="${episode.url}" target="_blank">View on TVMaze</a>
    `;

  return episodeCard; // return the full DOM  element
}

function createShowCard(show) {
  const showCard = document.createElement("div"); // create a new container for the show
  showCard.className = "show-card"; // add a class for styling
  showCard.id = `show-${show.id}`; // set an ID for easy reference

  // Format the show title
  const showTitle = `${String(show.name)}`;

  // build the HTML structure for the show card
  showCard.innerHTML = `
      <h2>${showTitle}</h2>
      <img src="${show.image?.medium || ""}" alt="${show.name}" />
      <p>${show.summary?.replace(/<[^>]*>/g, "")}</p>
      <a href="${show.url}" target="_blank">View on TVMaze</a>
    `;

  return showCard; // return the full DOM  element
}

// render the full page based on the current state
function render() {
  const rootElem = document.getElementById("root"); // get the root element where we will render everything
  rootElem.textContent = ""; // Clear the page

  if (state.shows.length === 0) {
    // if there are no episodes, show a loading message
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "loading-message"; // add a class for styling
    loadingMessage.textContent = "Loading shows, please wait..."; // set the loading message
    rootElem.appendChild(loadingMessage); // add the loading message to the root element
    return; // stop rendering further
  }

  // Only show shows if no show is selected
  if (state.selectedShowId === null) {
    const showsContainer = document.createElement("div"); // create a new container for the shows
    showsContainer.className = "shows-container"; // add a class for styling
    const filteredShows = state.shows.filter((show) => {
      const titleMatches = show.name
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase());
      const summaryMatches = show.summary
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase());
      return titleMatches || summaryMatches;
    });
    // Update filtered-info message
    const filteredMessage = document.getElementById("filtered-info");
    filteredMessage.textContent = `Displaying ${filteredShows.length}/${state.shows.length}`;
    const filteredShowCards = filteredShows.map(createShowCard);
    showsContainer.append(...filteredShowCards);
    rootElem.appendChild(showsContainer);
  }

  // Only show episodes if a show is selected
  if (state.selectedShowId !== null) {
    const container = document.createElement("div"); // create a new container for the episodes
    container.className = "episodes-container"; // add a class for styling

    // filtering the episodes
    const filteredEpisodes = state.episodes.filter(function (episode) {
      if (state.selectedEpisodeId) {
        // Return true only if episode.id matches the selected ID
        return episode.id === Number(state.selectedEpisodeId);
      }
      // Otherwise, filter by search term as before
      const titleMatches = episode.name
        .toLowerCase() // match the search term in the title
        .includes(state.searchTerm.toLowerCase());
      const summaryMatches = episode.summary
        .toLowerCase() // match the summary too
        .includes(state.searchTerm.toLowerCase());
      return titleMatches || summaryMatches; // keep episodes that match either the title or summary
    });

    // update the filtered-info tag by showing how many episodes matched
    const filteredMessage = document.getElementById("filtered-info");
    filteredMessage.textContent = `Displaying ${filteredEpisodes.length}/${state.episodes.length}`;

    // create a card for each episode that matched the search term
    const allEpisodeCards = filteredEpisodes.map(createEpisodeCard);
    container.append(...allEpisodeCards); // add all episode cards to the container
    rootElem.appendChild(container); // add the container to the root element
  }
  // create a footer with a link to TVMaze
  const footer = document.createElement("footer");
  footer.innerHTML = `Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>`;
  rootElem.appendChild(footer); // add the footer to thh bottom
}

// we need to get the search filed from the DOM
const input = document.getElementById("q");
// we need to listen to the event when user type
input.addEventListener("keyup", function () {
  // update the searchTerm
  state.searchTerm = input.value;
  render();
});
// Create a dropdown selector for shows
function showsDropDownSelector() {
  const showSelection = document.getElementById("show-selection");
  // Clear old options
  showSelection.innerHTML = "";
  // Default option: "All Shows"
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "All Shows";
  showSelection.append(defaultOption);

  // Order the shows alphabetically
  const alphabeticallyOrderedShows = [...state.shows].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  // Add one option per show
  alphabeticallyOrderedShows.sort().forEach((show) => {
    const newOption = document.createElement("option");
    newOption.value = show.id;
    newOption.textContent = show.name;
    showSelection.append(newOption);
  });

  // Handle show selection
  showSelection.addEventListener("change", function (event) {
    const showId = event.target.value;
    if (!showId) {
      state.selectedShowId = null;
      state.episodes = [];
      state.selectedEpisodeId = "";
      state.searchTerm = "";
      input.value = "";

      //  Clear episode dropdown
      const episodeSelection = document.getElementById("episode-selection");
      episodeSelection.innerHTML = "";
      const defaultEpisodeOption = document.createElement("option");
      defaultEpisodeOption.value = "";
      defaultEpisodeOption.textContent = "Select Episode";
      episodeSelection.append(defaultEpisodeOption);
      render();
      return;
    }

    if (showId) {
      const rootElem = document.getElementById("root"); // get the root element
      rootElem.textContent = "Loading episodes, please wait..."; // show loading message while the data is fetching
      fetchEpisodes(showId)
        .then((episodes) => {
          state.episodes = episodes;
          state.selectedShowId = showId;
          state.selectedEpisodeId = "";
          state.searchTerm = ""; // Cleat the search filed
          render();
          episodesDropDownSelector();
        })
        .catch((error) => {
          console.error("Sorry, there was a problem loading episodes.", error);
          rootElem.textContent = "Sorry, failed to load episodes.";
        });
    }
  });
}
// Create a dropdown selector for episodes
function episodesDropDownSelector() {
  const selectField = document.getElementById("episode-selection");
  // Clear previous options
  selectField.innerHTML = `<option value="all">All Episodes</option>`;

  // create options
  state.episodes.forEach((episode) => {
    const newOption = document.createElement("option");
    newOption.value = episode.id;
    newOption.textContent = `S${String(episode.season).padStart(
      2,
      "0"
    )}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;
    selectField.append(newOption); // add the option to the select field
  });
  // Scroll to episode when selected
  selectField.addEventListener("change", function (event) {
    const selectedId = event.target.value; // get the selected episode ID
    state.selectedEpisodeId = selectedId === "all" ? "" : selectedId;
    render();
  });
}

// initialize the app when the page loads
function setup() {
  const rootElem = document.getElementById("root"); // get the root element
  rootElem.textContent = "Loading shows, please wait..."; // show loading message while the data is fetching
  fetchShows()
    .then(function (shows) {
      state.shows = shows;
      render(); // render the shows only
      showsDropDownSelector();
    })
    .catch((error) => {
      console.error("Error fetching shows:", error);
      rootElem.textContent =
        "Sorry, there was a problem loading the shows. Please try again later.";
    });
}
// run the setup function when the page loads
window.onload = setup;
