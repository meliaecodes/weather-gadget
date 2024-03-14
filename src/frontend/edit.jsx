import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Form, FormHeader, FormSection, FormFooter, Label, RequiredAsterisk, Textfield, Button, useForm } from '@forge/react';
import { requestJira, view } from '@forge/bridge';


const Edit = () => {
  const { handleSubmit, register } = useForm();
  const [context, setContext] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    console.log("Location changed")
    console.log(location)

    const setData = async () => {
      const bodyData = `{
        "city": "${location.city}",
        "country": "${location.country}",
        "isConfigured": "true",
        "refresh": "false"
      }`

      const response = await 
        requestJira(`/rest/api/3/dashboard/${context.extension.dashboard.id}/items/${context.extension.gadget.id}/properties/config`, {
          method: "PUT",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: bodyData
        }
        )
        console.log(`Response: ${response.status} ${response.statusText}`);
        console.log(await response.json());
        useEffect(() => {
          view.getContext().then(setContext);
        }, []);
    }    
    if(location !== null){
      console.log("location isn't null")
      setData();
    }
  }, [location]);

  useEffect(() => {
    console.log('Context changed')

    const fetchGadgetConfig = async () => {
      const response = await requestJira(`/rest/api/3/dashboard/${context.extension.dashboard.id}/items/${context.extension.gadget.id}/properties/config`)
      const gadgetconfig = await response.json();
      console.log(gadgetconfig);
    }

    if(context !== null) {
      fetchGadgetConfig();
      console.log(context);
    }

  }, [context]);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  const submit = (data) => {
    console.log(data);
    setLocation(data);
  };

  
  if(!context) {
    return (
    <>
      <Text> Loading ... </Text>
    </>
    )
  } 
  return (
    <>
    <Form onSubmit={handleSubmit(submit)}>
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

ForgeReconciler.render(
  <React.StrictMode>
    <Edit />
  </React.StrictMode>
);

