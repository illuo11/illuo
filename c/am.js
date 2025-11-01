const movieCatalog = [
  {
    title: "Тіні забутих предків",
    director: "Сергій Параджанов",
    year: 1965,
    genres: ["Драма", "Історичний"],
    rating: 8.4,
    isAvailableOnStreaming: true,
  },
  {
    title: "Матриця",
    director: "Вачовскі",
    year: 1999,
    genres: ["Наукова фантастика", "Бойовик"],
    rating: 8.7,
    isAvailableOnStreaming: false,
  },
  {
    title: "Інтерстеллар",
    director: "Крістофер Нолан",
    year: 2014,
    genres: ["Наукова фантастика", "Пригоди"],
    rating: 8.6,
    isAvailableOnStreaming: true,
  },
  {
    title: "Дюна",
    director: "Дені Вільньов",
    year: 2021,
    genres: ["Наукова фантастика", "Екшн"],
    rating: 8.0,
    isAvailableOnStreaming: true,
  },
  {
    title: "Пірати Карибського моря: Прокляття Чорної перлини",
    director: "Гор Вербінські",
    year: 2003,
    genres: ["Фентезі", "Пригоди", "Бойовик"],
    rating: 8.1,
    isAvailableOnStreaming: false,
  },
  {
    title: "Леон",
    director: "Люк Бессон",
    year: 1994,
    genres: ["Трилер", "Драма"],
    rating: 8.5,
    isAvailableOnStreaming: true,
  },
  {
    title: "Той, що біжить по лезу",
    director: "Рідлі Скотт",
    year: 1982,
    genres: ["Наукова фантастика", "Нео-нуар"],
    rating: 8.2,
    isAvailableOnStreaming: true,
  },
  {
    title: "Кримінальне чтиво",
    director: "Квентін Тарантіно",
    year: 1994,
    genres: ["Кримінал", "Драма"],
    rating: 8.9,
    isAvailableOnStreaming: false,
  },
];

movieCatalog.pop();
movieCatalog.push({
  title: "Темний лицар",
  director: "Крістофер Нолан",
  year: 2008,
  genres: ["Бойовик", "Трилер"],
  rating: 9.0,
  isAvailableOnStreaming: true,
});

const tableBody = document.querySelector("#movieTable tbody");

// Виводимо таблицю
function renderTable() {
  tableBody.innerHTML = "";
  movieCatalog.forEach((movie, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${movie.title}</td>
      <td>${movie.director}</td>
      <td>${movie.year}</td>
      <td>${movie.genres.join(", ")}</td>
      <td>${movie.rating}</td>
      <td>${movie.isAvailableOnStreaming ? "Так" : "Ні"}</td>
      <td><button class="edit-btn" data-index="${index}">Редагувати</button></td>
    `;
    tableBody.appendChild(row);
  });
}

// Додаємо новий фільм
function showFormInfo(event) {
  event.preventDefault();
  const form = event.target;

  const newMovie = {
    title: form["title"].value.trim(),
    director: form["director"].value.trim(),
    year: parseInt(form["year"].value, 10),
    genres: form["genres"].value.split(",").map((g) => g.trim()),
    rating: parseFloat(form["rating"].value),
    isAvailableOnStreaming: form["availableOnline"].checked,
  };

  movieCatalog.push(newMovie);
  renderTable();
  form.reset();
}

document
  .querySelector(".js-movie-form")
  .addEventListener("submit", showFormInfo);

tableBody.addEventListener("click", (e) => {
  if (!e.target.classList.contains("edit-btn")) return;

  const index = e.target.dataset.index;
  const movie = movieCatalog[index];
  const row = e.target.closest("tr");

  row.innerHTML = `
    <td><input value="${movie.title}" id="edit-title" /></td>
    <td><input value="${movie.director}" id="edit-director" /></td>
    <td><input type="number" value="${movie.year}" id="edit-year" /></td>
    <td><input value="${movie.genres.join(", ")}" id="edit-genres" /></td>
    <td><input type="number" value="${
      movie.rating
    }" step="0.1" id="edit-rating" /></td>
    <td>
      <input type="checkbox" id="edit-online" ${
        movie.isAvailableOnStreaming ? "checked" : ""
      } />
      Так
    </td>
    <td>
      <button class="save-btn">Зберегти</button>
    </td>
  `;

  row.querySelector(".save-btn").addEventListener("click", () => {
    movie.title = row.querySelector("#edit-title").value;
    movie.director = row.querySelector("#edit-director").value;
    movie.year = parseInt(row.querySelector("#edit-year").value);
    movie.genres = row
      .querySelector("#edit-genres")
      .value.split(",")
      .map((g) => g.trim());
    movie.rating = parseFloat(row.querySelector("#edit-rating").value);
    movie.isAvailableOnStreaming = row.querySelector("#edit-online").checked;
    renderTable();
  });
});

renderTable();
