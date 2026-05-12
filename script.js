// Weather App Configuration
// Get a free API key from: https://openweathermap.org/api
const API_KEY = '9bf8320c32061485d1d27eaeb97dc504'; // Replace with your OpenWeather API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const indianStates = document.getElementById('indianStates');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners
searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeather();
    }
});

// Handle Indian states dropdown selection
indianStates.addEventListener('change', (e) => {
    if (e.target.value) {
        cityInput.value = e.target.value;
        fetchWeather();
        indianStates.value = ''; // Reset dropdown
    }
});

/**
 * Fetch weather data from OpenWeather API
 */
async function fetchWeather() {
    const city = cityInput.value.trim();

    // Validation
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('⚠️ Please add your OpenWeather API key in script.js (line 6)');
        return;
    }

    // Show loading spinner
    showLoading(true);
    hideError();

    try {
        // Fetch weather data
        const weatherResponse = await fetch(
            `${API_BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!weatherResponse.ok) {
            if (weatherResponse.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (weatherResponse.status === 401) {
                throw new Error('Invalid API key. Please update it in script.js');
            } else {
                throw new Error('Failed to fetch weather data. Please try again.');
            }
        }

        const weatherData = await weatherResponse.json();
        displayWeather(weatherData);
        cityInput.value = '';

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
        hideWeatherInfo();
    } finally {
        showLoading(false);
    }
}

/**
 * Display weather information on the page
 */
function displayWeather(data) {
    // Extract data
    const cityName = `${data.name}, ${data.sys.country}`;
    const temperature = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const humidity = data.main.humidity;
    const windSpeed = (data.wind.speed * 3.6).toFixed(1); // Convert m/s to km/h
    const pressure = data.main.pressure;
    const visibility = (data.visibility / 1000).toFixed(1);
    const sunrise = formatTime(data.sys.sunrise);
    const sunset = formatTime(data.sys.sunset);

    // Update DOM
    document.getElementById('cityName').textContent = cityName;
    document.getElementById('currentDate').textContent = getCurrentDate();
    document.getElementById('temperature').textContent = `${temperature}°C`;
    document.getElementById('description').textContent = description;
    document.getElementById('weatherIcon').src = weatherIcon;
    document.getElementById('weatherIcon').alt = description;
    document.getElementById('feelsLike').textContent = `${feelsLike}°C`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('windSpeed').textContent = `${windSpeed} km/h`;
    document.getElementById('pressure').textContent = `${pressure} mb`;
    document.getElementById('visibility').textContent = `${visibility} km`;
    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;

    // Fetch and display UV index if available
    fetchUVIndex(data.coord.lat, data.coord.lon);

    // Show weather info
    showWeatherInfo();
}

/**
 * Fetch UV Index from OpenWeather API
 */
async function fetchUVIndex(lat, lon) {
    try {
        const uvResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        if (uvResponse.ok) {
            const uvData = await uvResponse.json();
            const uvIndex = Math.round(uvData.value * 10) / 10;
            const uvLevel = getUVLevel(uvData.value);
            document.getElementById('uvIndex').textContent = `${uvIndex} (${uvLevel})`;
        }
    } catch (error) {
        console.error('Error fetching UV index:', error);
        document.getElementById('uvIndex').textContent = 'N/A';
    }
}

/**
 * Get UV Index level description
 */
function getUVLevel(uvIndex) {
    if (uvIndex < 3) return 'Low';
    if (uvIndex < 6) return 'Moderate';
    if (uvIndex < 8) return 'High';
    if (uvIndex < 11) return 'Very High';
    return 'Extreme';
}

/**
 * Format timestamp to HH:MM
 */
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

/**
 * Get current date in readable format
 */
function getCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}

/**
 * Show weather information section
 */
function showWeatherInfo() {
    weatherInfo.classList.remove('hidden');
}

/**
 * Hide weather information section
 */
function hideWeatherInfo() {
    weatherInfo.classList.add('hidden');
}

/**
 * Show loading spinner
 */
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set focus to input
    cityInput.focus();

    // Show setup message if API key is not configured
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('⚙️ Setup: Get a free API key from https://openweathermap.org/api and add it to script.js');
    }
});
