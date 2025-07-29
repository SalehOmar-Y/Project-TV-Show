//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";

  const container = document.createElement("div");
  container.className = "episodes-container";

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";

    const code = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;

    card.innerHTML = `
      <img src="${episode.image?.medium || ''}" alt="${episode.name}" />
      <h2>${code} - ${episode.name}</h2>
      <p>${episode.summary?.replace(/<[^>]*>/g, '')}</p>
      <a href="${episode.url}" target="_blank">View on TVMaze</a>
    `;

    container.appendChild(card);
  });

  rootElem.appendChild(container); 
}

window.onload = setup;
