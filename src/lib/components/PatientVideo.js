import React, {Component} from 'react';
import axios from 'axios';
import * as VideoExpress from '@vonage/video-express';
import Pusher from 'pusher-js';

var pusher = new Pusher ("6a72837bf4ad0a503cd0", {
  cluster: "us2",
  encrypted: true,
});

function textColorTheme(bgColor) {
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

export default class Telehealth extends Component {
  constructor() {
    super();

    this.state = {
      showVideo: true,
      showAudio: true,
      showScreen: false,
      layout: 'grid',
      checkedIn:false,
      preCheck: true,
      firstName:null,
      lastName:null,
      email:null,
      phone:null,
      callStarted:false,
      callEnded: false,
      providerRating:null,
      beamRating:null
    };
  }

  async componentDidMount () {

    let response = await axios({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/vonage_token/',
    });

    const room = new VideoExpress.Room({
      apiKey: response.data.apiKey,
      sessionId: response.data.session,
      token: response.data.token,
      roomContainer: 'roomContainer',
    });
    this.setState({roomData: response.data, room: room})
    // console.log('room data ', room)
    room.join();
    if(this.props.showAudio==false) {
      this.setState({showAudio: false})
      room.camera.disableAudio();
    }
    if(this.props.showVideo==false) {
      this.setState({showVideo: false})
      room.camera.disableVideo();
    }

    window.addEventListener('beforeunload', (event) => {
      event.preventDefault();
      event.returnValue = '';
      this.onUnload();
    });
  }

  toggleVideo = val => {
    if (val) {
      this.state.room.camera.enableVideo ();
      var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
      background.innerHTML = '';
    } else {
      this.state.room.camera.disableVideo ();
      var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
      var initials = document.createTextNode('X')
      background.appendChild(initials);
      // console.log('ele ', background)
    }
    this.setState ({showVideo: val});
  }

  toggleAudio = val => {
    if (val) {
      this.state.room.camera.enableAudio ();
    } else {
      this.state.room.camera.disableAudio ();
    }
    this.setState ({showAudio: val});
  };

  toggleScreen = val => {
    if (val) {
      this.state.room.startScreensharing ();
    } else {
      this.state.room.stopScreensharing ();
    }
    this.setState ({showScreen: val});
  };

  toggleLayout =() =>{
    if(this.state.layout==='grid'){
      this.state.room.setLayoutMode('active-speaker');
      this.setState({layout: 'active-speaker'})
    }
    else{
      this.state.room.setLayoutMode('grid');
      this.setState({layout: 'grid'})
    }
  }

  checkIn = async () => {
    let data = {
      'first_name': this.state.firstName,
      'last_name': this.state.lastName,
      'email': this.state.email,
      'phone': this.state.phone || null,
      'client_id': sessionStorage.getItem('beam-client')
    }
    let response = await axios({
      method: 'post', 
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      }, 
      url: 'https://beam-aditya.ngrok.io/v1/patient_checkin/',
      params:data
    });
    if(response.status=200) {
      // console.log('Check in response ', response.data)
      if(response.data.first_name != this.state.firstName || response.data.last_name != this.state.lastName || response.data.phone.slice(-10) != this.state.phone) {
        this.setState({preCheck:false, recordFirstName: response.data.first_name, recordLastName: response.data.last_name, recordPhone: response.data.phone})
      }
      else {
        this.reEnterRoom(response.data.id)
      }
    }
  }

  updatePatientData = async () => {
    let data = {
      'first_name': this.state.firstName,
      'last_name': this.state.lastName,
      'email': this.state.email,
      'phone': this.state.phone || null
    }
    let response = await axios({
      method: 'post', 
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      }, 
      url: 'https://beam-aditya.ngrok.io/v1/patient_update/', 
      params:data
    });
    if(response.status=200) {
      console.log("OK")
      this.reEnterRoom()
    }
  }

  reEnterRoom = async (patient_id) => {
    this.setState({checkedIn:true})
    this.state.room.leave();
    let token_response = await axios({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/vonage_token/',
    });

    const room = new VideoExpress.Room({
      apiKey: token_response.data.apiKey,
      sessionId: token_response.data.session,
      token: token_response.data.token,
      roomContainer: 'roomContainer',
    });
    this.setState({roomData: token_response.data, room: room, patient_id: patient_id})
    room.join();
    if(this.state.showAudio==false) {
      this.setState({showAudio: false})
      room.camera.disableAudio();
    }
    if(this.state.showVideo==false) {
      this.setState({showVideo: false})
      room.camera.disableVideo();
    }

    const pusher_channel = pusher.subscribe('wr-patients-staff-'+sessionStorage.getItem('beam-client'))
    pusher_channel.bind('telehealth-patient-added-'+patient_id, this.joinStaffsRoom)
  }

  joinStaffsRoom = async (data) => {
    // console.log("JOINED STAFF ROOM", data)
    this.state.room.leave();
    let container = document.getElementById('roomContainer')
    container.innerHTML = ""
    const room = new VideoExpress.Room({
      apiKey: data.apiKey,
      sessionId: data.session,
      token: data.token,
      roomContainer: 'roomContainer',
      participantName: this.state.firstName + ' ' + this.state.lastName
    });
    this.setState({roomData: data, room: room, callStarted:true, meetingCode: data.meeting_code})
    room.join();
    if(this.state.showAudio==false) {
      this.setState({showAudio: false})
      room.camera.disableAudio();
    }
    if(this.state.showVideo==false) {
      this.setState({showVideo: false})
      room.camera.disableVideo();
    }

    const pusher_channel = pusher.subscribe('wr-'+data.meeting_code)
    pusher_channel.bind('meeting-ended', this.onClickEndCall)
  }

  joinWithCode = async () => {
    let response = await axios({
      method: 'post', 
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      }, 
      url: 'https://beam-aditya.ngrok.io/v1/join-meeting-code/',
      params: {
        code: this.state.meetingCode,
        patient_id: this.state.patient_id
      }
    });
    // console.log('resp ', response.data)
    let data = {
      apiKey: this.state.room.apiKey,
      session: response.data.session,
      token: response.data.token,
      meeting_code: this.state.meetingCode
    }
    this.joinStaffsRoom(data)
  }
  
  onUnload = async () => {
    let response = await axios({
      method: 'post', 
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      }, 
      url: 'https://beam-aditya.ngrok.io/v1/patient_checkout/',
      params: {
        id: this.state.patient_id
      }
    });
  }

  onClickEndCall = async () => {
    this.state.room.leave();
    this.setState({callEnded:true})
  }

  rateProvider = async (rating) => {
    console.log('rat', rating)
    this.setState({providerRating:rating})
  }

  rateBeam = async (rating) => {
    this.setState({beamRating:rating})
  }

  render() {
    let themedElement = {backgroundColor: this.props.themeColor ? this.props.themeColor : '', color: this.props.themeColor ? textColorTheme(this.props.themeColor) : ''}
    // CHECKED IN CODE
    if(this.state.checkedIn) {
      return (
        <>
        {!this.state.callEnded &&
          <div className='provider-video-container'>
            <div id="roomContainer"></div>
            {!this.state.callEnded && (
              <div className="provider-video-controls" style={this.state.callStarted ? {left: 'calc(50vw - 200px'} : {}}>
              {this.state.showVideo && (
                <i className="fas fa-video" onClick={() => this.toggleVideo(false)}>
                  <span className="tooltiptext">Disable Video</span>
                </i>
              )}
              {!this.state.showVideo && (
                <i className="fas fa-video-slash" onClick={() => this.toggleVideo(true)}>
                  <span className="tooltiptext">Enable Video</span>
                </i>
              )}
              {this.state.showAudio && (
                <i className="fas fa-microphone" onClick={() => this.toggleAudio(false)}>
                  <span className="tooltiptext">Mute Audio</span>
                </i>
              )}
              {!this.state.showAudio && (
                <i className="fas fa-microphone-slash" onClick={() => this.toggleAudio(true)}>
                  <span className="tooltiptext">Enable Audio</span>
                </i>
              )}
              {this.state.showScreen && (
                <i className="fas fa-window-close" onClick={() => this.toggleScreen(false)}>
                  <span className="tooltiptext">Stop Screen Sharing</span>
                </i>
              )}
              {!this.state.showScreen && (
                <i className="fas fa-desktop" onClick={() => this.toggleScreen(true)}>
                  <span className="tooltiptext">Share Screen</span>
                </i>
              )}
              {this.state.layout=='grid' && (
                <i className="fas fa-th-large" onClick={() => this.toggleLayout()}>
                  <span className="tooltiptext">Switch to Speaker mode</span>
                </i>
              )}
              {this.state.layout=='active-speaker' && (
                <i className="fas fa-user" onClick={() => this.toggleLayout()}>
                  <span className="tooltiptext">Switch to Grid mode</span>
                </i>
              )}
              <i className="fas fa-phone-slash" onClick={this.onClickEndCall}>
                <span className="tooltiptext">End Call</span>
              </i>
            </div>
            )}
            {!this.state.callStarted &&
            <div className='telehealth-right-container'>
              <div className='telehealth-right-parent'>
                <div className='telehealth-right-patient'>
                  <div>You're all checked in, {this.state.firstName}! Your provider will start the call when they're ready.</div>
                  <div>If you have a meeting code, enter it below to join directly.</div>
                  <input type="text " placeholder='Meeting Code' onChange={(e) => this.setState({meetingCode: e.target.value})} />
                  <div className='primary-btn' onClick={() => this.joinWithCode()} style={themedElement} >Join</div>
                </div>
              </div>
            </div>
            }
          </div>
        }
        {this.state.callEnded &&
        <div className='rating-video-container'>
          <h2>You have exited your consult.</h2>
          <h4>You may close this window.</h4>
          <hr/>
          <h4>How was your experience with your provider?</h4>
          <div className='stars-container'>
            <i className={this.state.providerRating >=1 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateProvider(1)}></i>
            <i className={this.state.providerRating >=2 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateProvider(2)}></i>
            <i className={this.state.providerRating >=3 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateProvider(3)}></i>
            <i className={this.state.providerRating >=4 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateProvider(4)}></i>
            <i className={this.state.providerRating >=5 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateProvider(5)}></i>
          </div>
          <h4>How was your experience with Beam Health?</h4>
          <div className='stars-container'>
            <i className={this.state.beamRating >=1 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateBeam(1)}></i>
            <i className={this.state.beamRating >=2 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateBeam(2)}></i>
            <i className={this.state.beamRating >=3 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateBeam(3)}></i>
            <i className={this.state.beamRating >=4 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateBeam(4)}></i>
            <i className={this.state.beamRating >=5 ? 'fas fa-star' : 'far fa-star'} onClick={() => this.rateBeam(5)}></i>
          </div>
          <hr/>
          {(this.state.providerRating || this.state.beamRating) &&
          <h4>Thanks for rating!</h4>
          }
        </div>
        }
        </>
      );
    }
    // PRE CHECK IN CODE
    else {
      return(
        <div className='provider-pre-video-container'>
          <div className='provider-pre-video-preview'>
            <div id="roomContainer" style={{backgroundColor:this.props.themeColor ? this.props.themeColor : "#ffffff"}}></div>
            <div className="provider-video-controls">
              {this.state.showVideo && (
                <i className="fas fa-video" onClick={() => this.toggleVideo(false)}>
                  <span className="tooltiptext">Disable Video</span>
                </i>
              )}
              {!this.state.showVideo && (
                <i className="fas fa-video-slash" onClick={() => this.toggleVideo(true)}>
                  <span className="tooltiptext">Enable Video</span>
                </i>
              )}
              {this.state.showAudio && (
                <i className="fas fa-microphone" onClick={() => this.toggleAudio(false)}>
                  <span className="tooltiptext">Mute Audio</span>
                </i>
              )}
              {!this.state.showAudio && (
                <i className="fas fa-microphone-slash" onClick={() => this.toggleAudio(true)}>
                  <span className="tooltiptext">Enable Audio</span>
                </i>
              )}
            </div>
          </div>
          {this.state.preCheck &&
          <div className='patient-pre-video-options' style={{backgroundColor:this.props.themeColor ? this.props.themeColor : "#ffffff"}}>
            <div className='patient-intake-table'>
              <h2>Welcome to Beam Health's Waiting Room</h2>
              <div>
                <div>Email *</div>
                <input type="email" placeholder='Email' required={true} onChange={(e) => this.setState({email: e.target.value})} value={this.state.email} />
              </div>
              <div>
                <div>First Name *</div>
                <input type="text" placeholder='First Name' required={true} onChange={(e) => this.setState({firstName: e.target.value})} value={this.state.firstName} />
              </div>
              <div>
                <div>Last Name *</div>
                <input type="text" placeholder='Last Name' required={true} onChange={(e) => this.setState({lastName: e.target.value})} value={this.state.lastName} />
              </div>
              <div>
                <div>Phone</div>
                <input type="phone" placeholder='Phone' required={false} onChange={(e) => this.setState({phone: e.target.value})} value={this.state.phone} />
              </div>
              <div>
                <div className='primary-btn' style={themedElement} onClick={this.checkIn}>Check In</div>
              </div>
              <div>
                * Required fields
              </div>
            </div>
          </div>
          }
          {!this.state.preCheck &&
          <div className='patient-pre-video-options' style={{backgroundColor:this.props.themeColor ? this.props.themeColor : "#ffffff"}}>
            <div className='patient-data-check-container'>
              <span onClick={()=> this.setState({preCheck:true})}><i className='fas fa-arrow-left'></i>&nbsp;Back</span>
              <h4>We have different details for you in our records.</h4>
              <div>
                <div>
                  <h4>Existing Record:</h4>
                  <div>{this.state.recordFirstName + ' ' + this.state.recordLastName}</div>
                  <div>{this.state.recordPhone.slice(-10)}</div>
                  <div className='primary-btn' style={themedElement} onClick={()=> this.reEnterRoom()}>Keep Existing</div>
                </div>
                <div>
                  <h4>You entered:</h4>
                  <div>{this.state.firstName + ' ' + this.state.lastName}</div>
                  <div>{this.state.phone}</div>
                  <div className='primary-btn' style={themedElement} onClick={this.updatePatientData}>Update Details</div>
                </div>
              </div>
            </div>
          </div>
          }
        </div>
      )
    }
  }
}
