"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Appointments", {
  enumerable: true,
  get: function get() {
    return _Appointments.default;
  }
});
Object.defineProperty(exports, "ConsultTable", {
  enumerable: true,
  get: function get() {
    return _ConsultTable.default;
  }
});
Object.defineProperty(exports, "PatientTable", {
  enumerable: true,
  get: function get() {
    return _PatientTable.default;
  }
});
Object.defineProperty(exports, "PatientVideo", {
  enumerable: true,
  get: function get() {
    return _PatientVideo.default;
  }
});
Object.defineProperty(exports, "ProviderVideo", {
  enumerable: true,
  get: function get() {
    return _ProviderVideo.default;
  }
});
exports.connectUser = connectUser;

require("core-js/modules/es.promise.js");

var _PatientVideo = _interopRequireDefault(require("./components/PatientVideo"));

var _ProviderVideo = _interopRequireDefault(require("./components/ProviderVideo"));

var _PatientTable = _interopRequireDefault(require("./components/PatientTable"));

var _Appointments = _interopRequireDefault(require("./components/Appointments"));

var _ConsultTable = _interopRequireDefault(require("./components/ConsultTable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function connectUser(client_id, client_secret) {
  const axios = require('axios');

  const oauth = require('axios-oauth-client');

  const getClientCredentials = oauth.client(axios.create(), {
    url: 'https://beam-aditya.ngrok.io/o/token/',
    grant_type: 'client_credentials',
    client_id: client_id,
    client_secret: client_secret
  });
  const auth = await getClientCredentials();
  sessionStorage.removeItem('beam-token');
  sessionStorage.removeItem('beam-client');
  sessionStorage.setItem('beam-token', auth.access_token);
  sessionStorage.setItem('beam-client', client_id);
}