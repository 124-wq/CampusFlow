import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Only ONE Amplify import
import { Amplify } from 'aws-amplify';

// 2. Only ONE configuration block
Amplify.configure({
  Auth: {
    Cognito: {
      // Put your ap-south-1_xxxx ID here
      userPoolId: 'ap-south-1_DISReJgvK', 
      
      // Put the long random string from App Clients here
      userPoolClientId: '496st8vucracdk541287h22m1b', 
      
      // Keep this as ap-south-1 to match your S3 and DynamoDB
      region: 'ap-south-1'
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

