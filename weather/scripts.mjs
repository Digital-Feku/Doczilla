import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/+esm';
Chart.register(...registerables);

async function getCoordinates(city) {
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    )
    try {
            const data = await response.json()
            return {
                name: data.results[0].name,
                latitude: data.results[0].latitude,
                longitude: data.results[0].longitude
            }
        } catch (error) {
            console.log('Ошибка', error)
        }
}

async function getWeather(city) {
    const coordinates = await getCoordinates(city);
    const latitude = coordinates.latitude
    const longitude = coordinates.longitude
 
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FMoscow`
    )
  
    if (response) {
        try {
            const data = await response.json()
            const weather = data.hourly.weathercode.slice(0, 24)
            const time = data.hourly.time.slice(0, 24).map(t => t.split("T")[1].slice(0, 5))
            const temperature = data.hourly.temperature_2m.slice(0, 24);
            return {weather, time, temperature}
        } catch (error) {
            console.log('Ошибка', error)
        }
    } else {
        console.log('Не удалось получить данные о погоде')
        return null
    }
}
const city = document.getElementById('weather')
const getCityButton = document.getElementById('button')
const main = document.getElementById('main')
const cityName = document.getElementById('city-name')
const cityTemperature = document.getElementById('city-temperature')
let graph = null

function weatherVisualisation() {
    const cityValue = city.value
    const now = new Date()
    const hour = now.getHours()
    if (!cityValue) {
        alert ('Введите корректный город')
        return
    }
        getCoordinates(cityValue).then(name => {
                cityName.textContent = name.name
        })
        getWeather(cityValue).then((coordinates) => {
            if (coordinates) {
                main.style.display = 'flex'
                cityTemperature.textContent = `${coordinates.temperature[hour]}°`

                const temp = coordinates.temperature
                const time = coordinates.time

                const ctx = document.getElementById('graph').getContext('2d');
                    if (graph) {
                        graph.destroy(); 
                    }
                    graph = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: time ,
                            datasets: [{
                                label: 'Погода по часам',
                                data: temp,
                                backgroundColor: 'rgba(116, 248, 175, 0.2)',
                                borderColor: 'rgba(103, 255, 255, 1)',
                                borderWidth: 1
                            }]},
                        options: { }
                    })

            } else {
                alert ('Не удалось получить местоположение города')
            }
        }
    )
}

getCityButton.addEventListener('click', () => {

    weatherVisualisation()

})

function time() {
    const now = new Date()
    document.getElementById('time').textContent = now.toLocaleTimeString('ru-RU');
}
time();
setInterval(time, 1000);

