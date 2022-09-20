import React, {Component} from 'react';
import axios from 'axios';

export default class Telehealth extends Component {
  constructor() {
    super();

    this.state = {
    };
  }

  async componentDidMount () {

    let response = await axios({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/patient_telehealth/',
      params: {
        staff_id: 1,
        practice_id: 54
      },
    });
    console.log('data ', response.data)
    this.setState({wr_url: response.data})
  }

  render() {
    return (
      <div>
        {this.state.wr_url &&
        <iframe 
          src={this.state.wr_url}
          name="patient_wr" 
          scrolling="no" 
          frameBorder="1" 
          marginHeight="0px" 
          marginWidth="0px" 
          height="800px" 
          width="100%" 
          allow="camera;microphone" 
          allowFullScreen
        ></iframe>
        }
      </div>
    );
  }
}
