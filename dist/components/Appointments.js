"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

var _react = _interopRequireWildcard(require("react"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Appointments extends _react.Component {
  constructor() {
    super();
    this.state = {
      appointment_data: []
    };
  }

  async componentDidMount() {
    let response = await (0, _axios.default)({
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://providers.beam.health/v1/appointments/',
      params: {
        staff_id: 1,
        practice_id: 54
      }
    });
    console.log('data ', response.data);
    this.setState({
      appointment_data: response.data
    });
  }

  render() {
    let appointments = [];

    if (this.state.appointment_data.length > 0) {
      appointments = this.state.appointment_data.map((appointment, index) => {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "upcoming-schedule-item",
          key: index
        }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("i", {
          className: "fas fa-user"
        }), /*#__PURE__*/_react.default.createElement("span", {
          style: {
            fontWeight: 600
          }
        }, appointment.patient_name)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("i", {
          className: "fas fa-calendar"
        }), /*#__PURE__*/_react.default.createElement("span", null, new Date(appointment.start_time * 1000).toLocaleString())), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("i", {
          className: "fas fa-align-left"
        }), /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("strong", null, "Reason: "), appointment.notes ? appointment.notes : '-')));
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "dashboard-schedule-container"
    }, /*#__PURE__*/_react.default.createElement("div", null, "Upcoming Schedule"), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "upcoming-schedule-container"
    }, this.state.appointment_data.length > 0 ? appointments : /*#__PURE__*/_react.default.createElement("h4", null, "You have no upcoming appointments."))));
  }

}

exports.default = Appointments;