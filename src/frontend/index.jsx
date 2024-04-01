import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Box, Heading, Inline, Image, Strong, Text, Form, FormHeader, FormSection, FormFooter, Label, xcss, RequiredAsterisk, Textfield, Button, useForm, useProductContext } from '@forge/react';
import { invoke, requestJira, view } from '@forge/bridge';

const containerStyles = xcss({
  padding: 'space.200'
});

export const Edit = () => {
  // this screen will show when the gadget is in edit mode. 
  const { handleSubmit, register, getFieldId } = useForm();

  const configureGadget = (data) => {
    view.submit(data);
  };

  return (
    <>
    <Form onSubmit={handleSubmit(configureGadget)}>
      <FormHeader title="Login">
        Required fields are marked with an asterisk <RequiredAsterisk />
      </FormHeader>
      <FormSection>
      <Label labelFor="city">Your City<RequiredAsterisk /></Label>
      <Textfield {...register("city")} name="city" placeholder="Sydney"/>
      <Label labelFor="country">Your Country<RequiredAsterisk /></Label>
      <Textfield {...register("country")} name="country" placeholder="Australia"/>
      </FormSection>
      <FormFooter>
        <Button appearance="primary" type="submit">
          Submit
        </Button>
      </FormFooter>
    </Form>
    </>
  );
};

const View = () => {
  // this will display when the gadget is in view mode. 
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState(null);
  const [fiveDayForecast, setFiveDayForecast] = useState(null);
  
  const context = useProductContext();

  useEffect(() => {
    console.log("view: context change detected");
    console.log(context);
    if(context){
      setLocation(context.extension.gadgetConfiguration);
    }
  }, [context]);

  useEffect(() => {
    console.log("view: location change detected")
    console.log(location);
    if(location!==null){
      invoke('getLocationCoordinates', {location: location}).then(setCoords);
    }
  }, [location]);

  useEffect(() => {
    console.log("view: coordinate change detected")
    console.log(coords);
    invoke('getWeather', {coords: coords}).then(setWeather);
    invoke('getForecast', {coords: coords}).then(setForecast);
  }, [coords]);

  useEffect(() => {
    console.log("view: forecast change detected")
    console.log(forecast);
    invoke('getFiveDayForecast', {forecast: forecast}).then(setFiveDayForecast);
  }, [forecast]);

  useEffect(() => {
    console.log("view: weather change detected")
    console.log(weather);
  }, [weather]);

  useEffect(() => {
    console.log("view: 5 day forecast change detected")
    console.log(fiveDayForecast);
  }, [fiveDayForecast]);

  return (
    <Box xcss={containerStyles}>
      <Heading as="h2">The Weather</Heading>
      <Text><Strong>Location:</Strong> {location ? (`${location.city}, ${location.country}`) : `Please edit the macro to enter your location`}</Text>
      <Inline>
        <Box xcss={containerStyles}>
          <Image src={weather ? (`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`) : "https://openweathermap.org/img/wn/01d@2x.png"} alt={weather ? weather.weather[0].description : "Loading"} />
        </Box>
        <Box xcss={containerStyles}>
          <Text><Strong>Current Temperature</Strong> {weather ? weather.main.temp : '[ ]'} °C</Text>
          <Text><Strong>Feels like:</Strong> {weather ? weather.main.feels_like : '[ ]'} °C</Text>
          <Text><Strong>Humidity:</Strong> {weather ? weather.main.humidity : '[ ]'}%</Text>
        </Box >
      </Inline>
      <Text>Forecast</Text>
      <Inline>
      {fiveDayForecast ? fiveDayForecast.map(dailyForecast => (
      <Box xcss={containerStyles}>
        <Image src={dailyForecast ? (`https://openweathermap.org/img/wn/${dailyForecast.icon}d@2x.png`) : "https://openweathermap.org/img/wn/01d@2x.png"} alt={dailyForecast ? dailyForecast.description : "Loading"} />
        <Text><Strong>High:</Strong> {dailyForecast ? dailyForecast.maxTemp : '[ ]'} °C</Text>
        <Text><Strong>Low:</Strong> {dailyForecast ? dailyForecast.minTemp : '[ ]'} °C</Text>
        <Text><Strong>Humidity:</Strong> {dailyForecast ? Math.round(dailyForecast.humidity.sum/dailyForecast.humidity.count) : '[ ]'}%</Text>
        <Text><Strong>Rain:</Strong> {dailyForecast ? Math.round(dailyForecast.totalRain) : '[ ]'}mm</Text>
      </Box>
      )) : <Text>Loading...</Text>}
      </Inline>
    </Box>
  )
};

const App = () => {
  // this determines whether the app is in view mode or edit mode

  const context = useProductContext();
  console.log("App: context")
  console.log(context);


  if (!context) {
    console.log('App: no context')
    return (
      <>
        <Text>This never actually appears</Text>
        <Text>Because Jira displays a default screen</Text>
      </>
    );
  }

  return context.extension.entryPoint === "edit" ? <Edit /> : <View />;

};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
