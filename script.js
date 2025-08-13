const state = {
  shows: [],
  episodes: [],
  searchTerm: "",
  selectedEpisodeId: "",
  selectedShowId: null,
};

const episodeCache = {};


function setLoadingMessage(container, message) {
  container.innerHTML = `<div class="loading">${message}</div>`;
}

function setErrorMessage(container, message) {
  container.innerHTML = `<div class="error">${message}</div>`;
}

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


function renderShowsListing() {
  const root = document.getElementById("root");
  root.innerHTML = "";

  // Search input
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search shows by name, genre, or summary...";
  root.appendChild(searchInput);

  // Shows container
  const showsContainer = document.createElement("div");
  showsContainer.className = "shows-container";
  root.appendChild(showsContainer);

  function displayShows(shows) {
    showsContainer.innerHTML = "";
    if (shows.length === 0) {
      showsContainer.innerHTML = `<p class="no-results">No shows found.</p>`;
      return;
    }

    shows.forEach(show => {
      const card = document.createElement("div");
      card.className = "show-card";

      const title = document.createElement("h2");
      title.textContent = show.name;

      const img = document.createElement("img");
      img.src = show.image?.medium || "";
      img.alt = show.name;

      const summary = document.createElement("p");
      summary.innerHTML = show.summary || "";

      const details = document.createElement("p");
      details.innerHTML = `
        <strong>Genres:</strong> ${show.genres.join(", ")}<br>
        <strong>Status:</strong> ${show.status}<br>
        <strong>Rating:</strong> ${show.rating?.average || "N/A"}<br>
        <strong>Runtime:</strong> ${show.runtime || "N/A"} min
      `;

      // Click to load episodes
      card.addEventListener("click", () => {
        state.selectedShowId = show.id;
        setLoadingMessage(root, "Loading episodes...");
        fetchEpisodes(show.id).then(episodes => {
          state.episodes = episodes;
          renderEpisodesWithSearch(root, episodes);
        }).catch(() => {
          setErrorMessage(root, "Failed to load episodes.");
        });
      });

      card.appendChild(title);
      card.appendChild(img);
      card.appendChild(summary);
      card.appendChild(details);
      showsContainer.appendChild(card);
    });
  }


 displayShows(state.shows);

  // Filter search
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    const filtered = state.shows.filter(show =>
      show.name.toLowerCase().includes(q) ||
      show.genres.join(" ").toLowerCase().includes(q) ||
      (show.summary && show.summary.toLowerCase().includes(q))
    );
    displayShows(filtered);
  });
}
// Render episodes with search box inside given container
function renderEpisodesWithSearch(container, episodesList) {
  container.innerHTML = "";

  const backButton = document.createElement("button");
  backButton.textContent = "← Back to Shows";
  backButton.className = "back-button";
  backButton.addEventListener("click", () => renderShowsListing());
  container.appendChild(backButton);
  
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search episodes...";
  searchInput.className = "search-input";
  container.appendChild(searchInput);

  const list = document.createElement("div");
  list.className = "episodes-list";
  container.appendChild(list);


  function display(episodes) {
    if (episodes.length === 0) {
      list.innerHTML = `<p class="no-results">No episodes found.</p>`;
      return;
    }

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
  setLoadingMessage(root, "Loading shows...");

  fetchShows()
    .then(shows => {
      state.shows = shows;
      renderShowsListing();
    })
    .catch(() => {
      setErrorMessage(root, "Failed to load shows.");
    });
}


// run the setup function when the page loads
window.onload = setup;
