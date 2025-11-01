const API_URL = "https://68f3513ffd14a9fcc4286bf9.mockapi.io";
const collectionName = "movies";

let movieCatalog = [];
const tableBody = document.querySelector("#movieTable tbody");

async function fetchMovies() {
  try {
    const response = await fetch(`${API_URL}/${collectionName}`);
    const data = await response.json();

    movieCatalog = data.map((m) => ({
      title: m.title,
      director: m.director,
      year: Number(m.year),
      genres: m.genres || [],
      rating: Number(m.rating),
      isAvailableOnStreaming: m.isAvailableOnStreaming || false,
      isFavourite: m.isFavourite || false,
      id: m.id,
    }));

    showCatalog();
  } catch (error) {
    console.error("Помилка при отриманні даних:", error);
  }
}

function showCatalog() {
  let html = "";

  movieCatalog.forEach((movie, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${movie.title}</td>
        <td>${movie.director}</td>
        <td>${movie.year}</td>
        <td>${movie.genres.join(", ")}</td>
        <td>${movie.rating.toFixed(1)}</td>
        <td>${movie.isAvailableOnStreaming ? "Так" : "Ні"}</td>
        <td class="${movie.isFavourite ? "favourite" : ""}">
          ${movie.isFavourite ? "❤" : "–"}
        </td>
        <td>
          <button class="js-edit" data-index="${index}">🖋️</button>
          <button class="js-delete" data-index="${index}">🗑</button>
        </td>
      </tr>`;
  });

  tableBody.innerHTML = html;
}

async function saveMovie(event) {
  event.preventDefault();

  const form = event.target;
  const title = form["title"].value;
  const director = form["director"].value;
  const year = parseInt(form["year"].value, 10);
  const genres = form["genres"].value
    .split(",")
    .map((g) => g.trim())
    .filter((g) => g);
  const rating = parseFloat(form["rating"].value);
  const isAvailableOnStreaming = form["availableOnline"].checked;
  const isFavourite = form["favourite"].checked;

  const newMovie = {
    title,
    director,
    year,
    genres,
    rating,
    isAvailableOnStreaming,
    isFavourite,
  };

  try {
    const response = await fetch(`${API_URL}/${collectionName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMovie),
    });

    const addedMovie = await response.json();
    movieCatalog.push(addedMovie);
    showCatalog();
    form.reset();
  } catch (error) {
    console.error("Помилка при додаванні фільму:", error);
  }
}

function editMovie(index) {
  const row = tableBody.rows[index];
  const movie = movieCatalog[index];

  row.innerHTML = `
    <td>${index + 1}</td>
    <td><input type="text" value="${movie.title}" /></td>
    <td><input type="text" value="${movie.director}" /></td>
    <td><input type="number" value="${movie.year}" /></td>
    <td><input type="text" value="${movie.genres.join(", ")}" /></td>
    <td><input type="number" min="0" max="10" step="0.5" value="${
      movie.rating
    }" /></td>
    <td><input type="checkbox" ${
      movie.isAvailableOnStreaming ? "checked" : ""
    }></td>
    <td><input type="checkbox" ${movie.isFavourite ? "checked" : ""}></td>
    <td>
      <button class="js-save-edit" data-index="${index}">💾</button>
      <button class="js-cancel-edit" data-index="${index}">❌</button>
    </td>
  `;
}

async function saveEdit(index) {
  const row = tableBody.rows[index];
  const inputs = row.querySelectorAll("input");
  const id = movieCatalog[index].id;

  const updatedMovie = {
    title: inputs[0].value,
    director: inputs[1].value,
    year: parseInt(inputs[2].value, 10),
    genres: inputs[3].value.split(",").map((g) => g.trim()),
    rating: parseFloat(inputs[4].value),
    isAvailableOnStreaming: inputs[5].checked,
    isFavourite: inputs[6].checked,
  };

  try {
    await fetch(`${API_URL}/${collectionName}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMovie),
    });

    movieCatalog[index] = { ...updatedMovie, id };
    showCatalog();
  } catch (error) {
    console.error("Помилка при оновленні:", error);
  }
}

async function deleteMovie(index) {
  const id = movieCatalog[index].id;

  try {
    await fetch(`${API_URL}/${collectionName}/${id}`, { method: "DELETE" });
    movieCatalog.splice(index, 1);
    showCatalog();
  } catch (error) {
    console.error("Помилка при видаленні:", error);
  }
}

tableBody.addEventListener("click", (event) => {
  const index = event.target.dataset.index;

  if (event.target.classList.contains("js-edit")) editMovie(index);
  if (event.target.classList.contains("js-save-edit")) saveEdit(index);
  if (event.target.classList.contains("js-cancel-edit")) showCatalog();
  if (event.target.classList.contains("js-delete")) deleteMovie(index);
});

document.querySelector(".js-movie-form").addEventListener("submit", saveMovie);

fetchMovies();
