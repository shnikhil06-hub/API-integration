// API KEY
const API_KEY = "3cd7c4eae7154ec58b9ef1cb617e3f70";

const BASE_URL = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=1000&addRecipeInformation=true&addRecipeNutrition=true`;

// DATA
let meals = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// FETCH DATA
async function fetchMeals() {
  const menu = document.getElementById("menu");
  menu.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(BASE_URL);
    const data = await res.json();
    meals = data.results;

    applyAllFilters();
  } catch (error) {
    menu.innerHTML = "<p>Error loading data</p>";
    console.error(error);
  }
}

// GET CALORIES
function getCalories(meal) {
  const item = meal.nutrition?.nutrients?.find(n => n.name === "Calories");
  return item ? item.amount : 0;
}

// TOGGLE FAVORITE
function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  applyAllFilters();
}

// RENDER MEALS
function renderMeals(data) {
  const menu = document.getElementById("menu");

  if (data.length === 0) {
    menu.innerHTML = "<p>No results found 😢</p>";
    return;
  }

  menu.innerHTML = data.map(meal => `
    <div class="card">
      <div class="img-container">
        <img src="${meal.image}" alt="${meal.title}" />

        <!-- ❤️ Favorite Icon -->
        <div class="fav-icon" onclick="toggleFavorite(${meal.id})">
          ${favorites.includes(meal.id) ? "❤️" : "🤍"}
        </div>
      </div>

      <h3>${meal.title}</h3>
      <p>🔥 ${getCalories(meal)} kcal</p>
      <p>⭐ ${meal.aggregateLikes}</p>
    </div>
  `).join("");
}

// SEARCH
function searchMeals(data, text) {
  return data.filter(meal =>
    meal.title.toLowerCase().includes(text.toLowerCase())
  );
}

//VEG FILTER
function filterMeals(data, vegOnly) {
  return vegOnly ? data.filter(meal => meal.vegetarian) : data;
}

// CALORIE RANGE FILTER
function filterByCalories(data, range) {
  if (range === "all") return data;

  return data.filter(meal => {
    const cal = getCalories(meal);

    if (range === "1000+") return cal >= 1000;

    const [min, max] = range.split("-").map(Number);
    return cal >= min && cal <= max;
  });
}

//SORT
function sortMeals(data, sortBy, order) {
  if (sortBy === "default") return data;

  return data.slice().sort((a, b) => {
    let valA, valB;

    if (sortBy === "name") {
      return order === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    if (sortBy === "likes") {
      valA = a.aggregateLikes;
      valB = b.aggregateLikes;
    }

    if (sortBy === "calories") {
      valA = getCalories(a);
      valB = getCalories(b);
    }

    return order === "asc" ? valA - valB : valB - valA;
  });
}

// APPLY ALL FILTERS
function applyAllFilters() {
  const searchText = document.getElementById("search").value;
  const vegOnly = document.getElementById("vegOnly").checked;
  const sortBy = document.getElementById("sort").value;
  const order = document.getElementById("order").value;
  const calorieRange = document.getElementById("calorieRange").value;
  let result = meals;
  result = searchMeals(result, searchText);
  result = filterMeals(result, vegOnly);
  result = filterByCalories(result, calorieRange);
  result = sortMeals(result, sortBy, order);

  renderMeals(result);
}

// EVENT LISTENERS
document.getElementById("search").addEventListener("input", applyAllFilters);
document.getElementById("vegOnly").addEventListener("change", applyAllFilters);
document.getElementById("sort").addEventListener("change", applyAllFilters);
document.getElementById("order").addEventListener("change", applyAllFilters);
document.getElementById("calorieRange").addEventListener("change", applyAllFilters);

//  DARK MODE
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark"));
});

// Load saved theme
if (localStorage.getItem("theme") === "true") {
  document.body.classList.add("dark");
}
//START APP
fetchMeals();