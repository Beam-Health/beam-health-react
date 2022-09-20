import React, {Component} from 'react';
import axios from 'axios';
import * as VideoExpress from '@vonage/video-express';
import ActivePatients from './ActivePatients';

export default class ProviderVideo extends Component {
  constructor() {
    super();

    this.state = {
      roomData:[],
      showVideo: true,
      showAudio: true,
      showScreen: false,
      layout: 'grid'
    };
  }

  componentDidMount = async (props) => {
    console.log('prov props ', props)

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
    console.log('room data ', response.data)
    room.join();
  }

  toggleVideo = val => {
    console.log('toggle to ', val)
    if (val) {
      this.state.room.camera.enableVideo ();
      var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
      background.innerHTML = '';
    } else {
      this.state.room.camera.disableVideo ();
      var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
      var initials = document.createTextNode("AR")
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
      url: 'https://beam-aditya.ngrok.io/v0/practices/54/staff/1/conversations/' + this.state.actives.conversation + '/encounters/' + this.state.actives.encounter.id + '/complete/',
      params: {
        disposition_code: "Successful",

      }
    });
    if(this.props.onEndCall) {
      this.props.onEndCall();
    }
    
  };

  updateActives = async (actives) => {
    console.log('act ', actives)
    this.setState({actives})
  }

  render() {
    return (
      <div className='provider-video-container'>
          <div id="roomContainer"></div>
          {!this.state.callEnded && (
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
        )}
        {!this.state.callEnded && (
        <div className='active-patients-container'>
          <ActivePatients roomData={this.state.roomData} actives={(actives) => this.updateActives(actives)} />
        </div>
        )}
      </div>
    );
  }
}