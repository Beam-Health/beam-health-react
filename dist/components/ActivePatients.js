"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

var _react = _interopRequireWildcard(require("react"));

var _axios = _interopRequireDefault(require("axios"));

var _pusherJs = _interopRequireDefault(require("pusher-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var pusher = new _pusherJs.default("6a72837bf4ad0a503cd0", {
  cluster: "us2",
  encrypted: true
});

class ActivePatients extends _react.Component {
  constructor() {
    super();

    _defineProperty(this, "updateActives", async () => {
      let response = await (0, _axios.default)({
        method: 'get',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://beam-aditya.ngrok.io/v1/provider_telehealth/',
        params: {
          staff_id: 1,
          practice_id: 54
        }
      });
      console.log('data ', response.data);
      this.setState({
        activeData: response.data
      });
    });

    _defineProperty(this, "addPatient", async (patient_id, index) => {
      console.log('adding', this.props.roomData);
      let response = await (0, _axios.default)({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://beam-aditya.ngrok.io/v1/telehealth_add_patient/',
        params: {
          data: this.props.roomData,
          patient_id: patient_id
        }
      });
      this.props.actives(this.state.activeData[index]);
      console.log('data ', this.state.activeData[index]);
    });

    this.state = {
      activeData: [],
      joinedCall: false,
      expandNav: true
    };
  }

  async componentDidMount() {
    let response = await (0, _axios.default)({
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/provider_telehealth/',
      params: {
        staff_id: 1,
        practice_id: 54
      }
    });
    console.log('data ', response.data);
    this.setState({
      activeData: response.data
    });
    const roomChannel = pusher.subscribe('active-patients-staff-1');
    roomChannel.bind('active-updated', this.updateActives);
    console.log('roomchannel ', roomChannel);
  }

  render() {
    let active_encounters = this.state.activeData.map((encounter, index) => {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "encounter-item"
      }, /*#__PURE__*/_react.default.createElement("div", null, encounter.patient.first_name, " ", encounter.patient.last_name), /*#__PURE__*/_react.default.createElement("div", {
        onClick: () => this.addPatient(encounter.patient.short_id, index)
      }, "Add to Call"));
    });

    if (this.state.expandNav) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "active-patient-parent"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "active-patient-title"
      }, "Waiting Room", /*#__PURE__*/_react.default.createElement("span", {
        onClick: () => this.setState({
          expandNav: false
        })
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: "https://icons.veryicon.com/png/o/miscellaneous/unicons/compress-alt.png"
      }))), active_encounters);
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: active_encounters.length == 0 ? 'active-parent-collapsed' : 'active-parent-collapsed new-patients',
        onClick: () => this.setState({
          expandNav: true
        })
      }, active_encounters.length);
    }
  }

}

exports.default = ActivePatients;