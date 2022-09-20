import React, {Component} from 'react';
import axios from 'axios';


export default class PatientTable extends Component {
  constructor() {
    super();

    this.state = {
      patient_data:[],
      page: 1
    };
  }

  async componentDidMount () {
    this.fetchPatients(1)
  }

  fetchPatients = async (page) => {
    let response = await axios({
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://beam-aditya.ngrok.io/v1/patients/',
      params: {
        staff_id: 1,
        practice_id: 54,
        page:page
      },
    });
    console.log('data ', response.data)
    this.setState({patient_data:response.data.patients, hasNext:response.data.hasNext, hasPrevious: response.data.hasPrevious, total: response.data.total, page:page})
  }

  render() {
    let patient_data = this.state.patient_data.map((patient, index) => {
      return(
        <div className='patient-table-body'>
          <div>{patient.first_name} {patient.last_name}</div>
          <div>{patient.age} / {patient.gender}</div>
          <div>{patient.email}</div>
          <div>{patient.phone_number}</div>
        </div>
      )
    })
    return (
      <div>
        <div className='patient-table'>
          <div className='patient-table-header'>
            <div>Name</div>
            <div>Age/Gender</div>
            <div>Email</div>
            <div>Phone</div>
          </div>
          {patient_data}
        </div>
        <div className='table-controls'>
          <div>
            {this.state.hasNext && !this.state.pageLoading && this.state.total > 0 &&
            <span>Showing {(this.state.page*10)-9} - {this.state.page*10} of {parseInt(this.state.total).toLocaleString()} results</span>
            }
            {!this.state.hasNext && !this.state.pageLoading && this.state.total > 0 &&
            <span>Showing {(this.state.page*10)-9} - {parseInt(this.state.total).toLocaleString()} of {parseInt(this.state.total).toLocaleString()} results</span>
            }
            {this.state.pageLoading &&
            <div>
              <i className="fas fa-spinner fa-spin" style={{margin: '0 10px'}}></i>
            </div>
            }
          </div>
          {this.state.total > 10 &&
          <div>
            <button className="nav-button-rounded" onClick={() => this.fetchPatients(this.state.page-1)} disabled={this.state.hasPrevious ? false : true}><i className="fas fa-caret-left"></i></button>
            <span>Page {this.state.page}</span>
            <button className="nav-button-rounded" onClick={() => this.fetchPatients(this.state.page+1)} disabled={this.state.hasNext ? false : true}><i className="fas fa-caret-right"></i></button>
          </div>
          }
        </div>
      </div>
    );
  }
}
