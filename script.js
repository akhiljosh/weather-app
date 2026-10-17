const citySelect = document.querySelector("#city-select");
const statusText = document.querySelector("#status");
const result = document.querySelector("#weather-result");
const emoji = document.querySelector("#weather-emoji");
const condition = document.querySelector("#condition");
const cityName = document.querySelector("#city-name");
const temperature = document.querySelector("#temperature");
const fahrenheit = document.querySelector("#fahrenheit");
const cityTime = document.querySelector("#city-time");
const quote = document.querySelector("#weather-quote");

const quotes = {
  sunny: "“Keep your face toward the sunshine.”",
  cloudy: "“Even clouds make the sky interesting.”",
  rain: "“A little rain can help new things grow.”",
  storm: "“After the storm, the sky can clear.”",
  snow: "“Every snowflake brings a little wonder.”",
  fog: "“Take the day one gentle step at a time.”",
  default: "“Every kind of weather has its own magic.”"
};

function describeWeather(code, isDay) {
  if (code === 0) return { text: "Clear sky", emoji: isDay ? "☀️" : "🌙", quote: "sunny" };
  if ([1, 2].includes(code)) return { text: "Mostly clear", emoji: isDay ? "🌤️" : "☁️", quote: "sunny" };
  if (code === 3) return { text: "Overcast", emoji: "☁️", quote: "cloudy" };
  if ([45, 48].includes(code)) return { text: "Foggy", emoji: "🌫️", quote: "fog" };
  if ([51, 53, 55, 56, 57].includes(code)) return { text: "Drizzle", emoji: "🌦️", quote: "rain" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { text: "Rainy", emoji: "🌧️", quote: "rain" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: "Snowy", emoji: "❄️", quote: "snow" };
  if ([95, 96, 99].includes(code)) return { text: "Thunderstorm", emoji: "⛈️", quote: "storm" };
  return { text: "Mixed conditions", emoji: "🌈", quote: "default" };
}

function getSelectedCity() {
  const [lat, lon, city, country, timezone] = citySelect.value.split(",");
  return { lat, lon, city, country, timezone };
}

async function loadWeather() {
  const city = getSelectedCity();
  statusText.textContent = "Getting the weather…";
  result.hidden = true;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: city.lat,
    longitude: city.lon,
    current: "temperature_2m,weather_code,is_day",
    temperature_unit: "celsius",
    timezone: city.timezone
  });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("The weather service could not answer.");
    const data = await response.json();

    const current = data.current;
    const c = current.temperature_2m;
    const f = (c * 9 / 5) + 32;
    const weather = describeWeather(current.weather_code, current.is_day === 1);

    emoji.textContent = weather.emoji;
    condition.textContent = weather.text;
    cityName.textContent = `${city.city}, ${city.country}`;
    temperature.textContent = `${Math.round(c)}°C`;
    fahrenheit.textContent = `${Math.round(f)}°F`;
    quote.textContent = quotes[weather.quote] || quotes.default;

    // The API returns local time for the chosen city's time zone.
    const localDate = new Date(current.time);
    cityTime.textContent = new Intl.DateTimeFormat("en", {
      timeZone: city.timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(localDate);

    statusText.textContent = "";
    result.hidden = false;
  } catch (error) {
    statusText.textContent =
      "Sorry, the weather could not load. Check your internet connection and try again.";
    console.error(error);
  }
}

citySelect.addEventListener("change", loadWeather);
loadWeather();
