// 🔑 API
const API_KEY = "3cd7c4eae7154ec58b9ef1cb617e3f70";

const BASE_URL = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=20&addRecipeInformation=true&addRecipeNutrition=true`;

// 📦 Data
let meals = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// 🔄 Fetch API
async function fetchMeals() {
    const menu = document.getElementById("menu");
    menu.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(BASE_URL);
        const data = await res.json();
        meals = data.results;

        renderMeals(meals);
    } catch (error) {
        menu.innerHTML = "<p>Error loading data</p>";
    }
}

// 🔥 Get Calories
function getCalories(meal) {
    if (meal.nutrition && meal.nutrition.nutrients) {
        const item = meal.nutrition.nutrients.find(function (n) {
            return n.name === "Calories";
        });

        if (item && item.amount) {
            return item.amount;
        }
    }
    return "N/A";
}

// 🧠 Render Meals
function renderMeals(data) {
    const menu = document.getElementById("menu");

    menu.innerHTML = data.map(function (meal) {
        const calories = getCalories(meal);

        let favText;
        if (favorites.includes(meal.id)) {
            favText = "Remove ❤️";
        } else {
            favText = "Add ❤️";
        }

        return `
        <div class="card">
            <img src="${meal.image}" />
            <h3>${meal.title}</h3>
            <p>🔥 ${calories} kcal</p>
            <p>⭐ ${meal.aggregateLikes}</p>
            <button onclick="toggleFavorite(${meal.id})">
                ${favText}
            </button>
        </div>
        `;
    }).join("");
}

// ❤️ Favorites
function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(function (f) {
            return f !== id;
        });
    } else {
        favorites.push(id);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    applyAllFilters();
}

// 🔍 Search
function searchMeals(data, searchText) {
    return data.filter(function (meal) {
        return meal.title.toLowerCase().includes(searchText.toLowerCase());
    });
}

// 🥦 Veg Filter
function filterMeals(data, vegOnly) {
    if (vegOnly) {
        return data.filter(function (meal) {
            return meal.vegetarian === true;
        });
    } else {
        return data;
    }
}

// 🔢 Calorie Range Filter
function filterByCalorieRange(data, range) {

    if (range === "all") {
        return data;
    }

    return data.filter(function (meal) {
        const cal = getCalories(meal);

        if (cal === "N/A") {
            return false;
        }

        if (range === "1000+") {
            if (cal >= 1000) {
                return true;
            } else {
                return false;
            }
        }

        const parts = range.split("-");
        const min = parseInt(parts[0]);
        const max = parseInt(parts[1]);

        if (cal >= min && cal <= max) {
            return true;
        } else {
            return false;
        }
    });
}

// ⬆️ Sorting Function
function sortMeals(data, sortBy, order) {

    // 🔹 Default (no sorting)
    if (sortBy === "default") {
        return data;
    }

    // 🔹 Name Sorting
    if (sortBy === "name") {
        return data.slice().sort(function (a, b) {
            if (order === "asc") {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });
    }

    // 🔹 Popularity Sorting
    if (sortBy === "likes") {
        return data.slice().sort(function (a, b) {
            if (order === "asc") {
                return a.aggregateLikes - b.aggregateLikes;
            } else {
                return b.aggregateLikes - a.aggregateLikes;
            }
        });
    }

    // 🔹 Calories Sorting
    if (sortBy === "calories") {
        return data.slice().sort(function (a, b) {

            let valA = getCalories(a);
            let valB = getCalories(b);

            if (valA === "N/A") {
                valA = 0;
            }

            if (valB === "N/A") {
                valB = 0;
            }

            if (order === "asc") {
                return valA - valB;
            } else {
                return valB - valA;
            }
        });
    }

    return data;
}

// 🔄 Apply All Filters
function applyAllFilters() {
    const searchText = document.getElementById("search").value;
    const vegOnly = document.getElementById("vegOnly").checked;
    const sortBy = document.getElementById("sort").value;
    const order = document.getElementById("order").value;
    const calorieRange = document.getElementById("calorieRange").value;

    let result = meals;

    result = searchMeals(result, searchText);
    result = filterMeals(result, vegOnly);
    result = filterByCalorieRange(result, calorieRange);
    result = sortMeals(result, sortBy, order);

    renderMeals(result);
}

// 🎯 Event Listeners
document.getElementById("search").addEventListener("input", applyAllFilters);
document.getElementById("vegOnly").addEventListener("change", applyAllFilters);
document.getElementById("sort").addEventListener("change", applyAllFilters);
document.getElementById("order").addEventListener("change", applyAllFilters);
document.getElementById("calorieRange").addEventListener("change", applyAllFilters);

// 🌙 Dark Mode
document.getElementById("darkModeToggle").addEventListener("click", function () {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark"));
});

// Load Theme
if (localStorage.getItem("theme") === "true") {
    document.body.classList.add("dark");
}

// 🚀 Start App
fetchMeals();