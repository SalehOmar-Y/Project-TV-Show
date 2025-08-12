const state = {
  shows: [],
  episodes: [],
  searchTerm: "",
  selectedEpisodeId: "",
  selectedShowId: null,
};

const episodeCache = {};


// we need to fetch shows using url
function fetchShows() {
  return fetch("https://api.tvmaze.com/shows").then(response =>
    response.json()
  );
}


// Fetch episodes for a show, with caching
function fetchEpisodes(showId) {
  if (episodeCache[showId]) {
    return Promise.resolve(episodeCache[showId]);
  }
  return fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then(res => res.json())
    .then(episodes => {
      episodeCache[showId] = episodes;
      return episodes;
    });
}

// Updated main render function
function renderShowsDropdown() {
  const root = document.getElementById("root");
  root.innerHTML = "";

  const select = document.createElement("select");
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a show...";
  select.appendChild(defaultOption);

  state.shows.forEach(show => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    select.appendChild(option);
  });

  if (state.selectedShowId) select.value = state.selectedShowId;

  root.appendChild(select);

  // Container for episodes and search input
  const episodesContainer = document.createElement("div");
  episodesContainer.id = "episodes-container";
  root.appendChild(episodesContainer);

  select.addEventListener("change", e => {
    const showId = e.target.value;
    if (!showId) {
      state.selectedShowId = null;
      state.episodes = [];
      episodesContainer.innerHTML = "";
      return;
    }
    state.selectedShowId = showId;
    episodesContainer.textContent = "Loading episodes...";
    fetchEpisodes(showId).then(episodes => {
      state.episodes = episodes;
      renderEpisodesWithSearch(episodesContainer, episodes);
    });
  });
}


// Render episodes with search box inside given container
function renderEpisodesWithSearch(container, episodesList) {
  container.innerHTML = "";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search episodes...";
  container.appendChild(searchInput);

  const list = document.createElement("div");
  list.className = "episodes-list";
  container.appendChild(list);

  function display(episodes) {
    list.innerHTML = "";
    episodes.forEach(ep => {
      const card = document.createElement("div");
      card.className = "episode-card";

      const title = document.createElement("h3");
      title.textContent = `${ep.name} (S${String(ep.season).padStart(2,"0")}E${String(ep.number).padStart(2,"0")})`;

      const img = document.createElement("img");
      img.src = ep.image?.medium || "";
      img.alt = ep.name;

      const summary = document.createElement("div");
      summary.innerHTML = ep.summary || "";

      card.appendChild(title);
      card.appendChild(img);
      card.appendChild(summary);
      list.appendChild(card);
    });
  }

  display(episodesList);

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const filtered = episodesList.filter(
      ep => ep.name.toLowerCase().includes(q) || (ep.summary && ep.summary.toLowerCase().includes(q))
    );
    display(filtered);
  });
}

// initialize the app when the page loads
function setup() {
  const root = document.getElementById("root");
  root.textContent = "Loading shows...";
  fetchShows()
    .then(shows => {
      state.shows = shows;
      renderShowsDropdown();
    })
    .catch(() => {
      root.textContent = "Failed to load shows.";
    });
}


// run the setup function when the page loads
window.onload = setup;
