import React, {Component} from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

var pusher = new Pusher ("6a72837bf4ad0a503cd0", {
  cluster: "us2",
  encrypted: true,
});

function pickTextColorBasedOnBgColorAdvanced(bgColor) {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return (L > 0.179) ? '#000000' : '#ffffff';
}

export default class ActivePatients extends Component {
  constructor() {
    super();

    this.state = {
      activeData:[],
      joinedCall:false,
      expandNav: true,
      textColor: '#ffffff'
    };
  }

  async componentDidMount () {
    if(this.props.themeColor) {
      this.setState({textColor: pickTextColorBasedOnBgColorAdvanced(this.props.themeColor)})
    }
    let response = await axios({
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/provider_telehealth/',
      params: {
        client_id: sessionStorage.getItem('beam-client')
      },
    });
    // console.log('data ', response.data)

    this.setState({activeData: response.data,})
    const roomChannel = pusher.subscribe('wr-patients-staff-'+sessionStorage.getItem('beam-client'));
    roomChannel.bind('patient-checkin', this.updateActives)
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
        client_id: sessionStorage.getItem('beam-client')
      },
    });
    // console.log('data ', response.data)
    this.setState({activeData: response.data})
  }

  addPatient = async (patient_id, index) => {
    // console.log('adding', this.props.roomData)
    let response = await axios({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/telehealth_add_patient/',
      params: {
        data: this.props.roomData,
        session: this.props.roomData.session,
        patient_id: patient_id
      },
    });
    this.updateActives()

  }

  render() {
    let active_encounters = this.state.activeData.map((encounter, index) => {
      return(
        <div className='encounter-item' style={this.props.themeColor ? {borderColor: this.props.themeColor} : {}}>
          <div>{encounter.patient_name}</div>
          <div onClick={() => this.addPatient(encounter.patient_id, index)} style={this.props.themeColor ? {backgroundColor: this.props.themeColor, color: this.state.textColor} : {}}>Add to Call</div>
        </div>
      )
    })
    if(this.state.expandNav) {
      return (
        <div className='telehealth-right-parent'>
          <div className='active-patient-title' style={this.props.themeColor ? {backgroundColor: this.props.themeColor, color: this.state.textColor} : {}}>
            Waiting Room
            <span onClick={() => this.setState({expandNav:false})}><img src="https://icons.veryicon.com/png/o/miscellaneous/unicons/compress-alt.png" /></span>
          </div>
          {active_encounters}
        </div>
      );
    }
    else {
      return (
        <div className={active_encounters.length == 0 ? 'telehealth-right-collapsed' : 'telehealth-right-collapsed new-patients'} onClick={() => this.setState({expandNav:true})}>{active_encounters.length}</div>
      )
    }
  }
}
