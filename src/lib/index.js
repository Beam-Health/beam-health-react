import PatientVideo from "./components/PatientVideo";
import ProviderVideo from "./components/ProviderVideo";
import PatientTable from './components/PatientTable';
import Appointments from './components/Appointments'
import ConsultTable from './components/ConsultTable'

async function connectUser(client_id, client_secret){
    const axios = require('axios');
    const oauth = require('axios-oauth-client');
    const getClientCredentials = oauth.client(axios.create(), {
      url: 'https://beam-aditya.ngrok.io/o/token/',
      grant_type: 'client_credentials',
      client_id: client_id,
      client_secret: client_secret,
    });
    const auth = await getClientCredentials();
    sessionStorage.removeItem('beam-token')
    sessionStorage.removeItem('beam-client')
    sessionStorage.setItem('beam-token', auth.access_token)
    sessionStorage.setItem('beam-client', client_id)
}

export { PatientVideo, ProviderVideo, PatientTable, ConsultTable, Appointments, connectUser };