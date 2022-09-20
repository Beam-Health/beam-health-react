import React, {Component} from 'react';
import axios from 'axios';


export default class Appointments extends Component {
  constructor() {
    super();

    this.state = {
      appointment_data:[]
    };
  }

  async componentDidMount () {
    let response = await axios({
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/appointments/',
      params: {
        staff_id: 1,
        practice_id: 54,
      },
    });
    console.log('data ', response.data)
    this.setState({appointment_data:response.data})
  }



  render() {
    let appointments = []
    if(this.state.appointment_data.length > 0) {
      appointments = this.state.appointment_data.map((appointment, index) => {
        return(
          <div className='upcoming-schedule-item' key={index}>
            <div>
              <i className='fas fa-user'></i>
              <span style={{fontWeight:600}}>{appointment.patient_name}</span>
            </div>
            <div>
              <i className='fas fa-calendar'></i>
              <span>{new Date(appointment.start_time*1000).toLocaleString()}</span>
            </div>
            <div>
              <i className='fas fa-align-left'></i>
              <span><strong>Reason: </strong>{appointment.notes ? appointment.notes : '-'}</span>
            </div>
        </div>
        )
      })
    }
    return (
      <div className='dashboard-schedule-container'>
        <div>Upcoming Schedule</div>
        <div>
          <div className='upcoming-schedule-container'>
              {this.state.appointment_data.length > 0 ? appointments : <h4>You have no upcoming appointments.</h4>}
          </div>
        </div>
      </div>
    );
  }
}
