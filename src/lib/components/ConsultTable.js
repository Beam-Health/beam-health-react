import React, {Component} from 'react';
import axios from 'axios';

function format_time(s) {
  console.log('s', new Date(s*1000).toLocaleString())
  return new Date(s*1000).toLocaleString();
}

export default class ConsultTable extends Component {
  constructor() {
    super();

    this.state = {
      page: 1,
      encounter_list:[]
    };
  }

  async componentDidMount () {
    this.fetchEncounters(1);    
    console.log('date ', Date.now())
  }

  fetchEncounters = async (page) => {
    let response = await axios({
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem('beam-token'),
        'Content-Type': 'application/json'
      },
      url: 'https://providers.beam.health/v1/encounters/',
      params: {
        staff_id: 1,
        practice_id: 54,
        page: page,
      },
    });
    console.log('data ', response.data)
    this.setState({encounter_list: response.data.encounters, hasNext:response.data.hasNext, hasPrevious: response.data.hasPrevious, total: response.data.total, page:page})
  }

  render() {
    let encounters = this.state.encounter_list.map((encounter, index) => {
      return (
        <div className={this.props.showPaymentData ? "history-table-body":"min-history-table-body"} key={index}>
          <div>
              {format_time(encounter.time)}
          </div>
          <div>{encounter.provider}</div>
          <div>{encounter.patient}</div>
          <div>
            {Math.floor(encounter.duration / 60)}m {encounter.duration % 60}s
          </div>
          {this.props.showPaymentData && <div>{`$${encounter.amount_charged}`}</div> }
          {this.props.showPaymentData && <div>
              {encounter.paid_on ? encounter.paid_on : '-'}
          </div> }
        </div>
      );
    });
    return (
      <div>
        <div className='history-table'>
          <div className={this.props.showPaymentData ? "history-table-header":"min-history-table-header"}>
            <div>Date/Time</div>
            <div>Provider</div>
            <div>Patient</div>
            <div>Duration</div>
            {this.props.showPaymentData && <div>Charge</div> }
            {this.props.showPaymentData && <div>Paid on</div> }
          </div>
          <div>{encounters.length > 0 ? encounters : 'No consults'}</div>
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
            <button className="nav-button-rounded" onClick={() => this.fetchEncounters(this.state.page-1)} disabled={this.state.hasPrevious ? false : true}><i className="fas fa-caret-left"></i></button>
            <span>Page {this.state.page}</span>
            <button className="nav-button-rounded" onClick={() => this.fetchEncounters(this.state.page+1)} disabled={this.state.hasNext ? false : true}><i className="fas fa-caret-right"></i></button>
          </div>
          }
        </div>
      </div>
    );
  }
}
