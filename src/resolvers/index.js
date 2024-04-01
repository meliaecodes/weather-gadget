import Resolver from '@forge/resolver';
import { fetch } from '@forge/api'


const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log('getText called')
  console.log(req);
  return 'Hello, world!';
});

resolver.define('getLocationCoordinates', async (req) => {
  console.log('location payload')
  console.log(req.payload);
  if(req.payload.location != null){
    
    const url = "https://api.openweathermap.org/geo/1.0/direct?q=" + req.payload.location.city + "," + req.payload.location.country + "&limit=5&appid=" + process.env.OPENWEATHER_KEY;
    const response = await fetch(url)
    if(!response.ok) {
      const errmsg = `Error from Open Weather Map Geolocation API: ${response.status} ${await response.text()}`;
      console.error(errmsg)
      throw new Error(errmsg)
    }
    const locations = await response.json()

    console.log('location json')
    console.log(locations[0]);
    console.log(locations);
    console.log('location response')
    console.log(response);

    return locations[0];
  } else {
    return null;
  }
});

resolver.define('getFiveDayForecast', async (req) => {
  console.log("FiveDayForecast")
  console.log(req.payload.forecast);

if(req.payload.forecast != null){
  const tz = req.payload.forecast.city.timezone;

  // determine the first second (adjusted locally) for each of the 5 days
  // and create the 5 day forcast array
  let firstDate = new Date((req.payload.forecast.list[0].dt)*1000);
  let startFirstDate = new Date()
  startFirstDate.setUTCFullYear(firstDate.getUTCFullYear());
  startFirstDate.setUTCMonth(firstDate.getUTCMonth());
  startFirstDate.setUTCDate(firstDate.getUTCDate());
  startFirstDate.setUTCHours(0);
  startFirstDate.setUTCMinutes(0);
  startFirstDate.setUTCSeconds(0);
  startFirstDate.setUTCMilliseconds(0);

  const localStart = ((startFirstDate.valueOf()/1000) - tz);
  let localStartDate = new Date(localStart*1000);
  const dailyHighLow = [];
  const day = 60 * 60 * 24;
  for (let i = 0; i < 6; i++) {
    dailyHighLow[i] = {
      minTemp: null,
      maxTemp: null,
      totalRain: 0, 
      humidity: {sum: 0, count: 0},
      icon: '01',
      description: 'clear sky'
    }
  }
  // for each list item
// work out which local day it applies to
// check if new low temp
// check if new high temp
  console.log("DailyHighLow Array Initialised")
  console.log(dailyHighLow);

  req.payload.forecast.list.forEach((data) => {
    const ds = data.dt - localStart;
    
    let n = Math.floor(ds/day);

    // the array will start at -1 for UTC- timezones so we need to adjust
    if(tz < 0) { 
      n++;
    }
    
    console.log("n = " + n)
    console.log("ds = " + ds)
    

    if (n < 6) {

      if(dailyHighLow[n].minTemp == null) {
        dailyHighLow[n].minTemp = data.main.temp;
      } else {
        if (dailyHighLow[n].minTemp > data.main.temp) {
          dailyHighLow[n].minTemp = data.main.temp;
        }
      }
      if(dailyHighLow[n].maxTemp == null) {
        dailyHighLow[n].maxTemp = data.main.temp;
      } else {
        if (dailyHighLow[n].maxTemp < data.main.temp) {
          dailyHighLow[n].maxTemp = data.main.temp;
        }
      }
      
      // storing the total rain. 
      if(data.rain){
        dailyHighLow[n].totalRain = dailyHighLow[n].totalRain + data.rain['3h']
      }

      // storing values to calculate the humidity average
      dailyHighLow[n].humidity.sum = data.main.humidity + dailyHighLow[n].humidity.sum;
      dailyHighLow[n].humidity.count++;

      // determining if the weather conditions are 'worse' based on their icon number. 
      // more information about weather icons at https://openweathermap.org/weather-conditions
      if(dailyHighLow[n].icon < (data.weather[0].icon.substr(0,2)))
      {
        console.log(dailyHighLow[n].icon + " < " + data.weather[0].icon.substr(0,2));
        dailyHighLow[n].icon = data.weather[0].icon.substr(0,2);
        dailyHighLow[n].description = data.weather[0].description;
      }
    }

  });

  console.log(dailyHighLow);
  // just return the data for the days after today
  return dailyHighLow.slice(1);
}
return null;
});

resolver.define('getForecast', async (req) => {
  if(req.payload.coords != null){

    const lon = req.payload.coords.lon;
    const lat = req.payload.coords.lat;
    const url = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + process.env.OPENWEATHER_KEY;
    const response = await fetch(url)
    if(!response.ok) {
      const errmsg = `Error from Open Weather Map Weather API: ${response.status} ${await response.text()}`;
      console.error(errmsg)
      throw new Error(errmsg)
    }
  
    const weather = await response.json()
  
    console.log('getForecast response')
    console.log(response);
    console.log('getForcast json')
    console.log(weather);
  
    return weather;
    }
    else 
    {
      return null;
    }
})

resolver.define('getWeather', async (req) => {

  if(req.payload.coords != null){

  const lon = req.payload.coords.lon;
  const lat = req.payload.coords.lat;
  const url = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + process.env.OPENWEATHER_KEY;
  const response = await fetch(url)
  if(!response.ok) {
    const errmsg = `Error from Open Weather Map Weather API: ${response.status} ${await response.text()}`;
    console.error(errmsg)
    throw new Error(errmsg)
  }

  const weather = await response.json()

  console.log('getweather response')
  console.log(response);
  console.log('getweather json')
  console.log(weather);

  return weather;
  }
  else 
  {
    return null;
  }

})

export const handler = resolver.getDefinitions();
