import React, {Component} from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

var pusher = new Pusher ("6a72837bf4ad0a503cd0", {
  cluster: "us2",
  encrypted: true,
});

export default class ActivePatients extends Component {
  constructor() {
    super();

    this.state = {
      activeData:[],
      joinedCall:false,
      expandNav: true
    };
  }

  async componentDidMount () {
    let response = await axios({
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/provider_telehealth/',
      params: {
        staff_id: 1,
        practice_id: 54
      },
    });
    console.log('data ', response.data)

    this.setState({activeData: response.data,})
    const roomChannel = pusher.subscribe('active-patients-staff-1');
    roomChannel.bind('active-updated', this.updateActives)
    console.log('roomchannel ', roomChannel)
  }

  updateActives = async () => {
    let response = await axios({
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/provider_telehealth/',
      params: {
        staff_id: 1,
        practice_id: 54
      },
    });
    console.log('data ', response.data)
    this.setState({activeData: response.data})
  }

  addPatient = async (patient_id, index) => {
    console.log('adding', this.props.roomData)
    let response = await axios({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/telehealth_add_patient/',
      params: {
        data: this.props.roomData,
        patient_id: patient_id
      },
    });
    this.props.actives(this.state.activeData[index]);
    console.log('data ', this.state.activeData[index])
  }

  render() {
    let active_encounters = this.state.activeData.map((encounter, index) => {
      return(
        <div className='encounter-item'>
          <div>{encounter.patient.first_name} {encounter.patient.last_name}</div>
          <div onClick={() => this.addPatient(encounter.patient.short_id, index)}>Add to Call</div>
        </div>
      )
    })
    if(this.state.expandNav) {
      return (
        <div className='active-patient-parent'>
          <div className='active-patient-title' >
            Waiting Room
            <span onClick={() => this.setState({expandNav:false})}><img src="https://icons.veryicon.com/png/o/miscellaneous/unicons/compress-alt.png" /></span>
          </div>
          {active_encounters}
        </div>
      );
    }
    else {
      return (
        <div className={active_encounters.length == 0 ? 'active-parent-collapsed' : 'active-parent-collapsed new-patients'} onClick={() => this.setState({expandNav:true})}>{active_encounters.length}</div>
      )
    }
  }
}