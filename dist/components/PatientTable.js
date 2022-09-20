"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

require("core-js/modules/es.parse-int.js");

var _react = _interopRequireWildcard(require("react"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PatientTable extends _react.Component {
  constructor() {
    super();

    _defineProperty(this, "fetchPatients", async page => {
      let response = await (0, _axios.default)({
        method: 'get',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
          'Content-Type': 'application/json'
        },
        url: 'https://beam-aditya.ngrok.io/v1/patients/',
        params: {
          staff_id: 1,
          practice_id: 54,
          page: page
        }
      });
      console.log('data ', response.data);
      this.setState({
        patient_data: response.data.patients,
        hasNext: response.data.hasNext,
        hasPrevious: response.data.hasPrevious,
        total: response.data.total,
        page: page
      });
    });

    this.state = {
      patient_data: [],
      page: 1
    };
  }

  async componentDidMount() {
    this.fetchPatients(1);
  }

  render() {
    let patient_data = this.state.patient_data.map((patient, index) => {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "patient-table-body"
      }, /*#__PURE__*/_react.default.createElement("div", null, patient.first_name, " ", patient.last_name), /*#__PURE__*/_react.default.createElement("div", null, patient.age, " / ", patient.gender), /*#__PURE__*/_react.default.createElement("div", null, patient.email), /*#__PURE__*/_react.default.createElement("div", null, patient.phone_number));
    });
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "patient-table"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "patient-table-header"
    }, /*#__PURE__*/_react.default.createElement("div", null, "Name"), /*#__PURE__*/_react.default.createElement("div", null, "Age/Gender"), /*#__PURE__*/_react.default.createElement("div", null, "Email"), /*#__PURE__*/_react.default.createElement("div", null, "Phone")), patient_data), /*#__PURE__*/_react.default.createElement("div", {
      className: "table-controls"
    }, /*#__PURE__*/_react.default.createElement("div", null, this.state.hasNext && !this.state.pageLoading && this.state.total > 0 && /*#__PURE__*/_react.default.createElement("span", null, "Showing ", this.state.page * 10 - 9, " - ", this.state.page * 10, " of ", parseInt(this.state.total).toLocaleString(), " results"), !this.state.hasNext && !this.state.pageLoading && this.state.total > 0 && /*#__PURE__*/_react.default.createElement("span", null, "Showing ", this.state.page * 10 - 9, " - ", parseInt(this.state.total).toLocaleString(), " of ", parseInt(this.state.total).toLocaleString(), " results"), this.state.pageLoading && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("i", {
      className: "fas fa-spinner fa-spin",
      style: {
        margin: '0 10px'
      }
    }))), this.state.total > 10 && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("button", {
      className: "nav-button-rounded",
      onClick: () => this.fetchPatients(this.state.page - 1),
      disabled: this.state.hasPrevious ? false : true
    }, /*#__PURE__*/_react.default.createElement("i", {
      className: "fas fa-caret-left"
    })), /*#__PURE__*/_react.default.createElement("span", null, "Page ", this.state.page), /*#__PURE__*/_react.default.createElement("button", {
      className: "nav-button-rounded",
      onClick: () => this.fetchPatients(this.state.page + 1),
      disabled: this.state.hasNext ? false : true
    }, /*#__PURE__*/_react.default.createElement("i", {
      className: "fas fa-caret-right"
    })))));
  }

}

exports.default = PatientTable;