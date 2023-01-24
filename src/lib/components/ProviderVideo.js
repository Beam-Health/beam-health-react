import React, {Component} from 'react';
import axios from 'axios';
import * as VideoExpress from '@vonage/video-express';
import ActivePatients from './ActivePatients';

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}


export default class ProviderVideo extends Component {
  constructor() {
    super();

    this.state = {
      roomData:[],
      showVideo: true,
      showAudio: true,
      showScreen: false,
      layout: 'grid',
      callStarted:false,
      callEnded: false,
      meeting_code:''
    };
  }

  componentDidMount = async (props) => {
    
    let response = await axios({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://providers.beam.health/v1/vonage_token/',
    });

    const room = new VideoExpress.Room({
      apiKey: response.data.apiKey,
      sessionId: response.data.session,
      token: response.data.token,
      roomContainer: 'roomContainer',
    });
    this.setState({roomData: response.data, room: room})
    room.join();
    if(this.props.showAudio==false) {
      this.setState({showAudio: false})
      room.camera.disableAudio();
    }
    if(this.props.showVideo==false) {
      this.setState({showVideo: false})
      room.camera.disableVideo();
    }
  }

  toggleVideo = val => {
    if (val) {
      this.state.room.camera.enableVideo ();
      var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
      background.innerHTML = '';
    } else {
      this.state.room.camera.disableVideo ();
      var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
      var initials = document.createTextNode("X")
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

  onClickEndCall = async () => {
    this.state.room.leave ();
    this.setState ({
      callEnded: true,
    });
    let response = await axios({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://providers.beam.health/v1/provider_end_call/',
      params: {
        meeting_code: this.state.meeting_code
      }
    });
    if(this.props.onEndCall) {
      this.props.onEndCall();
    }
    
  };

  updateActives = async (actives) => {
    // console.log('act ', actives)
    this.setState({actives})
  }

  startCall = async () => {
    this.state.room.leave();
    this.setState({callStarted:true})
    let response = await axios({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://providers.beam.health/v1/vonage_token/',
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
    if(this.state.showAudio==false) {
      this.setState({showAudio: false})
      room.camera.disableAudio();
    }
    if(this.state.showVideo==false) {
      this.setState({showVideo: false})
      room.camera.disableVideo();
    }
    // MEETING CODE

    let meeting_code = generateString(5)
    this.setState({meeting_code:meeting_code})
    let encounter_response = await axios({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://providers.beam.health/v1/create_meeting_with_code/',
      params: {
        meeting_code: meeting_code,
        client_id: sessionStorage.getItem('beam-client'),
        session: room.roomId,
        token: room.token
      }
    });
  }

  render() {
    if(this.state.callStarted) {
      return (
        <>
          {!this.state.callEnded &&
          <div className='provider-video-container'>
            <div className='meeting-code'>MEETING CODE: {this.state.meeting_code}</div>
            <div id="roomContainer"></div>
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
            <div className='telehealth-right-container'>
              <ActivePatients roomData={this.state.roomData} actives={(actives) => this.updateActives(actives)} {...this.props} />
            </div>
          </div>
          }
          {this.state.callEnded &&
          <div className='rating-video-container'>
            <h2>You have completed your consult.</h2>
            <h4>You may close this window.</h4>
          </div>
          }
        </>
      );
    }
    else {
      return(
        <div className='provider-pre-video-container'>
          <div className='provider-pre-video-preview'>
            <div id="roomContainer"></div>
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
          <div className='provider-pre-video-options'>
            <div className='primary-btn' onClick={() => this.startCall()}>Start a Call</div>
          </div>
        </div>
      )
    }
  }
}