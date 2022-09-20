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

class Telehealth extends _react.Component {
  constructor() {
    super();
    this.state = {};
  }

  async componentDidMount() {
    let response = await (0, _axios.default)({
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/patient_telehealth/',
      params: {
        staff_id: 1,
        practice_id: 54
      }
    });
    console.log('data ', response.data);
    this.setState({
      wr_url: response.data
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", null, this.state.wr_url && /*#__PURE__*/_react.default.createElement("iframe", {
      src: this.state.wr_url,
      name: "patient_wr",
      scrolling: "no",
      frameBorder: "1",
      marginHeight: "0px",
      marginWidth: "0px",
      height: "800px",
      width: "100%",
      allow: "camera;microphone",
      allowFullScreen: true
    }));
  }

}

exports.default = Telehealth;