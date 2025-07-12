async function getCoordinates(city) {
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    )
    try {
            const data = await response.json()
            return {
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
            const temp = data.hourly.weathercode.slice(0, 24)
            return temp
        } catch (error) {
            console.log('Ошибка', error)
        }
    } else {
        console.log('Не удалось получить данные о погоде')
        return null
    }
}

getWeather('Orel').then(temp => {
    console.log(temp)
})