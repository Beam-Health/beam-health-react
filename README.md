# Documentation

Documentation for setting up Beam Health's React SDK within your project.

## Install with npm

In the project directory, you can run:

`npm install beam-health-react`

## Connect to Beam client

`await connectUser(client_id, client_secret)`

## Components

### Provider Video
The ProviderVideo component adds the provider side UI for the waiting room. Its subcomponents include the video UI and the list of active patients in the waiting room. Start a consultation by simply adding a patient into the call.

#### Example Usage
`<ProviderVideo onEndCall={this.EndCall} showVideo={false} themeColor=”#FF0000” />`

#### Props
* onEndCall - Callback function that is triggered when the call is ended.
* showVideo - Turn on provider video when entering a call. (boolean, default = true)
* showAudio - Turn on provider audio when entering a call. (boolean, default = true)
* themeColor - Your customized brand color. (string, default = #867DE2)
* requirePasscode - Enable to require patients to enter a passcode to join the call. (boolean, default = false)

### PatientVideo
The PatientVideo component adds the UI for the Patient Waiting Room. This iFrame component is rendered from the Beam Dashboard and provides a UI for patients to enter their credentials, add payment information (if enabled), complete intake forms (if enabled), and get checked in.

#### Example Usage
`<PatientVideo onEndCall={this.EndCall} themeColor=”#FF0000” />`

#### Props
* onEndCall - Callback function that is triggered when the call is ended.
* themeColor - Your customized brand color. (string, default = #867DE2)
* allowRating - Enables a rating UI to rate the quality of service once the consultation is completed (boolean, default = false)

### ConsultTable
The ConsultTable component shows a table with a complete log of all your consultations.

#### Example Usage
`<ConsultTable showPaymentData={true} enableSearch={true} resultsPerPage=20 />`

#### Props
* showPaymentData - Include columns for payment amount and status (boolean, default = false)
* enableSearch - Include a search bar above the table for quickly finding records (boolean, default = false)
* themeColor - Your customized brand color. (string, default = #867DE2)
* resultsPerPage - Number of records per page (integer, default = 10)

### PatientTable
The PatientTable component shows a table with a complete log of all your patients.

#### Example Usage
`<PatientTable enableSearch={true} resultsPerPage=20 />`

#### Props
* enableSearch - Include a search bar above the table for quickly finding records (boolean, default = false)
* themeColor - Your customized brand color. (string, default = #867DE2)
* resultsPerPage - Number of records per page (integer, default = 10)

### PaymentTable
The PaymentTable component shows a table with a complete log of all your patients.

#### Example Usage
`<PaymentTable enableSearch={true} resultsPerPage=20 />`

#### Props
* enableSearch - Include a search bar above the table for quickly finding records (boolean, default = false)
* themeColor - Your customized brand color. (string, default = #867DE2)
* resultsPerPage - Number of records per page (integer, default = 10)

### AppointmentCalendar
The AppointmentCalendar component shows the calendar UI for scheduling patients.

#### Example Usage
`<AppointmentCalendar themeColor=”#FF0000” accentColor=”#303030” allowViewToggle={true} />`

#### Props
* themeColor - Your customized brand color. (string, default = #867DE2)
* accentColor - Your customized secondary brand color. (string, default = themeColor)
* allowViewToggle - Shows toggle for month/day views instead of just week. (boolean, default = false)
* startTime - Default start time for calendar (integer, default = 9)
* endTime - Default end time for calendar (integer, default = 17)
* alowTimeToggle - Shows toggle adjusting start and end times. (boolean, default = false)

### AppointmentList
The Appointments component shows the UI with a list of upcoming consultations in your schedule

#### Example Usage
`<AppointmentList showPast={true} themeColor=”#FF0000” />`

#### Props
* showUpcoming - Show upcoming appointments (boolean, default = true)
* showPast - Show past appointments (boolean, default = false)
* themeColor - Your customized brand color. (string, default = #867DE2)

### PatientIntakeTable
The PatientIntakeTable component shows the UI for creating intake forms.

#### Example Usage
`<PatientIntakeTable themeColor=”#FF0000” />`

#### Props
* enableSearch - Include a search bar above the table for quickly finding records (boolean, default = false)
* themeColor - Your customized brand color. (string, default = #867DE2)
* resultsPerPage - Number of records per page (integer, default = 10)

### PatientIntakeBuilder
The PatientIntakeBuilder component shows the UI for creating intake forms.

#### Example Usage
`<PatientIntakeBuilder themeColor=”#FF0000” />`

#### Props
* themeColor - Your customized brand color. (string, default = #867DE2)
