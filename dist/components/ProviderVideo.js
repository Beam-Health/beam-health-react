"use strict";

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ProviderVideo extends _react.Component {
  constructor() {
    super();

    _defineProperty(this, "componentDidMount", async props => {
      console.log('prov props ', props);
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
      console.log('room data ', response.data);
      room.join();
    });

    _defineProperty(this, "toggleVideo", val => {
      console.log('toggle to ', val);

      if (val) {
        this.state.room.camera.enableVideo();
        var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
        background.innerHTML = '';
      } else {
        this.state.room.camera.disableVideo();
        var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
        var initials = document.createTextNode("AR");
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
        url: 'https://beam-aditya.ngrok.io/v0/practices/54/staff/1/conversations/' + this.state.actives.conversation + '/encounters/' + this.state.actives.encounter.id + '/complete/',
        params: {
          disposition_code: "Successful"
        }
      });

      if (this.props.onEndCall) {
        this.props.onEndCall();
      }
    });

    _defineProperty(this, "updateActives", async actives => {
      console.log('act ', actives);
      this.setState({
        actives
      });
    });

    this.state = {
      roomData: [],
      showVideo: true,
      showAudio: true,
      showScreen: false,
      layout: 'grid'
    };
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "provider-video-container"
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "roomContainer"
    }), !this.state.callEnded && /*#__PURE__*/_react.default.createElement("div", {
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
    }, "End Call"))), !this.state.callEnded && /*#__PURE__*/_react.default.createElement("div", {
      className: "active-patients-container"
    }, /*#__PURE__*/_react.default.createElement(_ActivePatients.default, {
      roomData: this.state.roomData,
      actives: _actives => this.updateActives(_actives)
    })));
  }

}

exports.default = ProviderVideo;