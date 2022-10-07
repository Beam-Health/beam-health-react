"use strict";

require("core-js/modules/es.object.assign.js");

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

var _react = _interopRequireWildcard(require("react"));

var _axios = _interopRequireDefault(require("axios"));

var VideoExpress = _interopRequireWildcard(require("@vonage/video-express"));

var _ActivePatients = _interopRequireDefault(require("./ActivePatients"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

class ProviderVideo extends _react.Component {
  constructor() {
    super();

    _defineProperty(this, "componentDidMount", async props => {
      let response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://beam-aditya.ngrok.io/v1/vonage_token/'
      });
      const room = new VideoExpress.Room({
        apiKey: response.data.apiKey,
        sessionId: response.data.session,
        token: response.data.token,
        roomContainer: 'roomContainer'
      });
      this.setState({
        roomData: response.data,
        room: room
      });
      room.join();

      if (this.props.showAudio == false) {
        this.setState({
          showAudio: false
        });
        room.camera.disableAudio();
      }

      if (this.props.showVideo == false) {
        this.setState({
          showVideo: false
        });
        room.camera.disableVideo();
      }
    });

    _defineProperty(this, "toggleVideo", val => {
      if (val) {
        this.state.room.camera.enableVideo();
        var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
        background.innerHTML = '';
      } else {
        this.state.room.camera.disableVideo();
        var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
        var initials = document.createTextNode("X");
        background.appendChild(initials); // console.log('ele ', background)
      }

      this.setState({
        showVideo: val
      });
    });

    _defineProperty(this, "toggleAudio", val => {
      if (val) {
        this.state.room.camera.enableAudio();
      } else {
        this.state.room.camera.disableAudio();
      }

      this.setState({
        showAudio: val
      });
    });

    _defineProperty(this, "toggleScreen", val => {
      if (val) {
        this.state.room.startScreensharing();
      } else {
        this.state.room.stopScreensharing();
      }

      this.setState({
        showScreen: val
      });
    });

    _defineProperty(this, "toggleLayout", () => {
      if (this.state.layout === 'grid') {
        this.state.room.setLayoutMode('active-speaker');
        this.setState({
          layout: 'active-speaker'
        });
      } else {
        this.state.room.setLayoutMode('grid');
        this.setState({
          layout: 'grid'
        });
      }
    });

    _defineProperty(this, "onClickEndCall", async () => {
      this.state.room.leave();
      this.setState({
        callEnded: true
      });
      let response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://beam-aditya.ngrok.io/v1/provider_end_call/',
        params: {
          meeting_code: this.state.meeting_code
        }
      });

      if (this.props.onEndCall) {
        this.props.onEndCall();
      }
    });

    _defineProperty(this, "updateActives", async actives => {
      // console.log('act ', actives)
      this.setState({
        actives
      });
    });

    _defineProperty(this, "startCall", async () => {
      this.state.room.leave();
      this.setState({
        callStarted: true
      });
      let response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://beam-aditya.ngrok.io/v1/vonage_token/'
      });
      const room = new VideoExpress.Room({
        apiKey: response.data.apiKey,
        sessionId: response.data.session,
        token: response.data.token,
        roomContainer: 'roomContainer'
      });
      this.setState({
        roomData: response.data,
        room: room
      }); // console.log('room data ', room)

      room.join();

      if (this.state.showAudio == false) {
        this.setState({
          showAudio: false
        });
        room.camera.disableAudio();
      }

      if (this.state.showVideo == false) {
        this.setState({
          showVideo: false
        });
        room.camera.disableVideo();
      } // MEETING CODE


      let meeting_code = generateString(5);
      this.setState({
        meeting_code: meeting_code
      });
      let encounter_response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://beam-aditya.ngrok.io/v1/create_meeting_with_code/',
        params: {
          meeting_code: meeting_code,
          client_id: sessionStorage.getItem('beam-client'),
          session: room.roomId,
          token: room.token
        }
      });
    });

    this.state = {
      roomData: [],
      showVideo: true,
      showAudio: true,
      showScreen: false,
      layout: 'grid',
      callStarted: false,
      callEnded: false,
      meeting_code: ''
    };
  }

  render() {
    if (this.state.callStarted) {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, !this.state.callEnded && /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-video-container"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "meeting-code"
      }, "MEETING CODE: ", this.state.meeting_code), /*#__PURE__*/_react.default.createElement("div", {
        id: "roomContainer"
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-video-controls"
      }, this.state.showVideo && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-video",
        onClick: () => this.toggleVideo(false)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Disable Video")), !this.state.showVideo && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-video-slash",
        onClick: () => this.toggleVideo(true)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Enable Video")), this.state.showAudio && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-microphone",
        onClick: () => this.toggleAudio(false)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Mute Audio")), !this.state.showAudio && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-microphone-slash",
        onClick: () => this.toggleAudio(true)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Enable Audio")), this.state.showScreen && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-window-close",
        onClick: () => this.toggleScreen(false)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Stop Screen Sharing")), !this.state.showScreen && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-desktop",
        onClick: () => this.toggleScreen(true)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Share Screen")), this.state.layout == 'grid' && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-th-large",
        onClick: () => this.toggleLayout()
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Switch to Speaker mode")), this.state.layout == 'active-speaker' && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-user",
        onClick: () => this.toggleLayout()
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Switch to Grid mode")), /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-phone-slash",
        onClick: this.onClickEndCall
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "End Call"))), /*#__PURE__*/_react.default.createElement("div", {
        className: "telehealth-right-container"
      }, /*#__PURE__*/_react.default.createElement(_ActivePatients.default, _extends({
        roomData: this.state.roomData,
        actives: _actives => this.updateActives(_actives)
      }, this.props)))), this.state.callEnded && /*#__PURE__*/_react.default.createElement("div", {
        className: "rating-video-container"
      }, /*#__PURE__*/_react.default.createElement("h2", null, "You have completed your consult."), /*#__PURE__*/_react.default.createElement("h4", null, "You may close this window.")));
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-pre-video-container"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-pre-video-preview"
      }, /*#__PURE__*/_react.default.createElement("div", {
        id: "roomContainer"
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-video-controls"
      }, this.state.showVideo && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-video",
        onClick: () => this.toggleVideo(false)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Disable Video")), !this.state.showVideo && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-video-slash",
        onClick: () => this.toggleVideo(true)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Enable Video")), this.state.showAudio && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-microphone",
        onClick: () => this.toggleAudio(false)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Mute Audio")), !this.state.showAudio && /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-microphone-slash",
        onClick: () => this.toggleAudio(true)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "tooltiptext"
      }, "Enable Audio")))), /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-pre-video-options"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "primary-btn",
        onClick: () => this.startCall()
      }, "Start a Call")));
    }
  }

}

exports.default = ProviderVideo;