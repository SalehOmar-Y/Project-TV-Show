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
      episodeCache[showId] = data; // store in cache
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

// Create a single show card element
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
// === Step 1: Split render into renderShows and renderEpisodes ===

function renderShows(showsList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  showsList.forEach(show => {
    const card = document.createElement("div");
    card.className = "show-card";

    const title = document.createElement("h2");
    title.textContent = show.name;

    const img = document.createElement("img");
    img.src = show.image?.medium || "";
    img.alt = show.name;

    const summary = document.createElement("div");
    summary.innerHTML = show.summary || "";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);

    rootElem.appendChild(card);
  });
}

function renderEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach(episode => {
    const episodeContainer = document.createElement("div");
    episodeContainer.className = "episode-card";

    const title = document.createElement("h2");
    title.innerText = `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

    const img = document.createElement("img");
    img.src = episode.image?.medium || "";
    img.alt = episode.name;

    const summary = document.createElement("div");
    summary.innerHTML = episode.summary || "";

    episodeContainer.appendChild(title);
    episodeContainer.appendChild(img);
    episodeContainer.appendChild(summary);

    rootElem.appendChild(episodeContainer);
  });
}

// Updated main render function
function render(dataList) {
  if (!Array.isArray(dataList)) return;

  if (dataList.length && dataList[0].hasOwnProperty("genres")) {
    // It's a shows list
    renderShows(dataList);
  } else {
    // It's an episodes list
    renderEpisodes(dataList);
  }
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
