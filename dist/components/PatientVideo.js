"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.parse-int.js");

require("core-js/modules/es.promise.js");

var _react = _interopRequireWildcard(require("react"));

var _axios = _interopRequireDefault(require("axios"));

var VideoExpress = _interopRequireWildcard(require("@vonage/video-express"));

var _pusherJs = _interopRequireDefault(require("pusher-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var pusher = new _pusherJs.default("6a72837bf4ad0a503cd0", {
  cluster: "us2",
  encrypted: true
});

function textColorTheme(bgColor) {
  var color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR

  var g = parseInt(color.substring(2, 4), 16); // hexToG

  var b = parseInt(color.substring(4, 6), 16); // hexToB

  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map(col => {
    if (col <= 0.03928) {
      return col / 12.92;
    }

    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179 ? '#000000' : '#ffffff';
}

class Telehealth extends _react.Component {
  constructor() {
    super();

    _defineProperty(this, "toggleVideo", val => {
      if (val) {
        this.state.room.camera.enableVideo();
        var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
        background.innerHTML = '';
      } else {
        this.state.room.camera.disableVideo();
        var background = document.getElementById('layoutContainer').firstChild.firstChild.firstChild;
        var initials = document.createTextNode('X');
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

    _defineProperty(this, "checkIn", async () => {
      let data = {
        'first_name': this.state.firstName,
        'last_name': this.state.lastName,
        'email': this.state.email,
        'phone': this.state.phone || null,
        'client_id': sessionStorage.getItem('beam-client')
      };
      let response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://providers.beam.health/v1/patient_checkin/',
        params: data
      });

      if (response.status = 200) {
        // console.log('Check in response ', response.data)
        if (response.data.first_name != this.state.firstName || response.data.last_name != this.state.lastName || response.data.phone.slice(-10) != this.state.phone) {
          this.setState({
            preCheck: false,
            recordFirstName: response.data.first_name,
            recordLastName: response.data.last_name,
            recordPhone: response.data.phone
          });
        } else {
          this.reEnterRoom(response.data.id);
        }
      }
    });

    _defineProperty(this, "updatePatientData", async () => {
      let data = {
        'first_name': this.state.firstName,
        'last_name': this.state.lastName,
        'email': this.state.email,
        'phone': this.state.phone || null
      };
      let response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://providers.beam.health/v1/patient_update/',
        params: data
      });

      if (response.status = 200) {
        console.log("OK");
        this.reEnterRoom();
      }
    });

    _defineProperty(this, "reEnterRoom", async patient_id => {
      this.setState({
        checkedIn: true
      });
      this.state.room.leave();
      let token_response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://providers.beam.health/v1/vonage_token/'
      });
      const room = new VideoExpress.Room({
        apiKey: token_response.data.apiKey,
        sessionId: token_response.data.session,
        token: token_response.data.token,
        roomContainer: 'roomContainer'
      });
      this.setState({
        roomData: token_response.data,
        room: room,
        patient_id: patient_id
      });
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
      }

      const pusher_channel = pusher.subscribe('wr-patients-staff-' + sessionStorage.getItem('beam-client'));
      pusher_channel.bind('telehealth-patient-added-' + patient_id, this.joinStaffsRoom);
    });

    _defineProperty(this, "joinStaffsRoom", async data => {
      // console.log("JOINED STAFF ROOM", data)
      this.state.room.leave();
      let container = document.getElementById('roomContainer');
      container.innerHTML = "";
      const room = new VideoExpress.Room({
        apiKey: data.apiKey,
        sessionId: data.session,
        token: data.token,
        roomContainer: 'roomContainer',
        participantName: this.state.firstName + ' ' + this.state.lastName
      });
      this.setState({
        roomData: data,
        room: room,
        callStarted: true,
        meetingCode: data.meeting_code
      });
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
      }

      const pusher_channel = pusher.subscribe('wr-' + data.meeting_code);
      pusher_channel.bind('meeting-ended', this.onClickEndCall);
    });

    _defineProperty(this, "joinWithCode", async () => {
      let response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://providers.beam.health/v1/join-meeting-code/',
        params: {
          code: this.state.meetingCode,
          patient_id: this.state.patient_id
        }
      }); // console.log('resp ', response.data)

      let data = {
        apiKey: this.state.room.apiKey,
        session: response.data.session,
        token: response.data.token,
        meeting_code: this.state.meetingCode
      };
      this.joinStaffsRoom(data);
    });

    _defineProperty(this, "onUnload", async () => {
      let response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://providers.beam.health/v1/patient_checkout/',
        params: {
          id: this.state.patient_id
        }
      });
    });

    _defineProperty(this, "onClickEndCall", async () => {
      this.state.room.leave();
      this.setState({
        callEnded: true
      });
    });

    _defineProperty(this, "rateProvider", async rating => {
      console.log('rat', rating);
      this.setState({
        providerRating: rating
      });
    });

    _defineProperty(this, "rateBeam", async rating => {
      this.setState({
        beamRating: rating
      });
    });

    this.state = {
      showVideo: true,
      showAudio: true,
      showScreen: false,
      layout: 'grid',
      checkedIn: false,
      preCheck: true,
      firstName: null,
      lastName: null,
      email: null,
      phone: null,
      callStarted: false,
      callEnded: false,
      providerRating: null,
      beamRating: null
    };
  }

  async componentDidMount() {
    let response = await (0, _axios.default)({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://providers.beam.health/v1/vonage_token/'
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

    window.addEventListener('beforeunload', event => {
      event.preventDefault();
      event.returnValue = '';
      this.onUnload();
    });
  }

  render() {
    let themedElement = {
      backgroundColor: this.props.themeColor ? this.props.themeColor : '',
      color: this.props.themeColor ? textColorTheme(this.props.themeColor) : ''
    }; // CHECKED IN CODE

    if (this.state.checkedIn) {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, !this.state.callEnded && /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-video-container"
      }, /*#__PURE__*/_react.default.createElement("div", {
        id: "roomContainer"
      }), !this.state.callEnded && /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-video-controls",
        style: this.state.callStarted ? {
          left: 'calc(50vw - 200px'
        } : {}
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
      }, "End Call"))), !this.state.callStarted && /*#__PURE__*/_react.default.createElement("div", {
        className: "telehealth-right-container"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "telehealth-right-parent"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "telehealth-right-patient"
      }, /*#__PURE__*/_react.default.createElement("div", null, "You're all checked in, ", this.state.firstName, "! Your provider will start the call when they're ready."), /*#__PURE__*/_react.default.createElement("div", null, "If you have a meeting code, enter it below to join directly."), /*#__PURE__*/_react.default.createElement("input", {
        type: "text ",
        placeholder: "Meeting Code",
        onChange: e => this.setState({
          meetingCode: e.target.value
        })
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "primary-btn",
        onClick: () => this.joinWithCode(),
        style: themedElement
      }, "Join"))))), this.state.callEnded && /*#__PURE__*/_react.default.createElement("div", {
        className: "rating-video-container"
      }, /*#__PURE__*/_react.default.createElement("h2", null, "You have exited your consult."), /*#__PURE__*/_react.default.createElement("h4", null, "You may close this window."), /*#__PURE__*/_react.default.createElement("hr", null), /*#__PURE__*/_react.default.createElement("h4", null, "How was your experience with your provider?"), /*#__PURE__*/_react.default.createElement("div", {
        className: "stars-container"
      }, /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.providerRating >= 1 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateProvider(1)
      }), /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.providerRating >= 2 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateProvider(2)
      }), /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.providerRating >= 3 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateProvider(3)
      }), /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.providerRating >= 4 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateProvider(4)
      }), /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.providerRating >= 5 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateProvider(5)
      })), /*#__PURE__*/_react.default.createElement("h4", null, "How was your experience with Beam Health?"), /*#__PURE__*/_react.default.createElement("div", {
        className: "stars-container"
      }, /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.beamRating >= 1 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateBeam(1)
      }), /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.beamRating >= 2 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateBeam(2)
      }), /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.beamRating >= 3 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateBeam(3)
      }), /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.beamRating >= 4 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateBeam(4)
      }), /*#__PURE__*/_react.default.createElement("i", {
        className: this.state.beamRating >= 5 ? 'fas fa-star' : 'far fa-star',
        onClick: () => this.rateBeam(5)
      })), /*#__PURE__*/_react.default.createElement("hr", null), (this.state.providerRating || this.state.beamRating) && /*#__PURE__*/_react.default.createElement("h4", null, "Thanks for rating!")));
    } // PRE CHECK IN CODE
    else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-pre-video-container"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "provider-pre-video-preview"
      }, /*#__PURE__*/_react.default.createElement("div", {
        id: "roomContainer",
        style: {
          backgroundColor: this.props.themeColor ? this.props.themeColor : "#ffffff"
        }
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
      }, "Enable Audio")))), this.state.preCheck && /*#__PURE__*/_react.default.createElement("div", {
        className: "patient-pre-video-options",
        style: {
          backgroundColor: this.props.themeColor ? this.props.themeColor : "#ffffff"
        }
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "patient-intake-table"
      }, /*#__PURE__*/_react.default.createElement("h2", null, "Welcome to Beam Health's Waiting Room"), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, "Email *"), /*#__PURE__*/_react.default.createElement("input", {
        type: "email",
        placeholder: "Email",
        required: true,
        onChange: e => this.setState({
          email: e.target.value
        }),
        value: this.state.email
      })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, "First Name *"), /*#__PURE__*/_react.default.createElement("input", {
        type: "text",
        placeholder: "First Name",
        required: true,
        onChange: e => this.setState({
          firstName: e.target.value
        }),
        value: this.state.firstName
      })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, "Last Name *"), /*#__PURE__*/_react.default.createElement("input", {
        type: "text",
        placeholder: "Last Name",
        required: true,
        onChange: e => this.setState({
          lastName: e.target.value
        }),
        value: this.state.lastName
      })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, "Phone"), /*#__PURE__*/_react.default.createElement("input", {
        type: "phone",
        placeholder: "Phone",
        required: false,
        onChange: e => this.setState({
          phone: e.target.value
        }),
        value: this.state.phone
      })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "primary-btn",
        style: themedElement,
        onClick: this.checkIn
      }, "Check In")), /*#__PURE__*/_react.default.createElement("div", null, "* Required fields"))), !this.state.preCheck && /*#__PURE__*/_react.default.createElement("div", {
        className: "patient-pre-video-options",
        style: {
          backgroundColor: this.props.themeColor ? this.props.themeColor : "#ffffff"
        }
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "patient-data-check-container"
      }, /*#__PURE__*/_react.default.createElement("span", {
        onClick: () => this.setState({
          preCheck: true
        })
      }, /*#__PURE__*/_react.default.createElement("i", {
        className: "fas fa-arrow-left"
      }), "\xA0Back"), /*#__PURE__*/_react.default.createElement("h4", null, "We have different details for you in our records."), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h4", null, "Existing Record:"), /*#__PURE__*/_react.default.createElement("div", null, this.state.recordFirstName + ' ' + this.state.recordLastName), /*#__PURE__*/_react.default.createElement("div", null, this.state.recordPhone.slice(-10)), /*#__PURE__*/_react.default.createElement("div", {
        className: "primary-btn",
        style: themedElement,
        onClick: () => this.reEnterRoom()
      }, "Keep Existing")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h4", null, "You entered:"), /*#__PURE__*/_react.default.createElement("div", null, this.state.firstName + ' ' + this.state.lastName), /*#__PURE__*/_react.default.createElement("div", null, this.state.phone), /*#__PURE__*/_react.default.createElement("div", {
        className: "primary-btn",
        style: themedElement,
        onClick: this.updatePatientData
      }, "Update Details"))))));
    }
  }

}

exports.default = Telehealth;