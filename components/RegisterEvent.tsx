'use client';

import React from 'react'

const RegisterEvent = ({registrationLink}: {registrationLink: string}) => {
  return (
    <div id="register-event">
      <p>Go to the event website to sign up.</p>
      <button
        className="button-submit"
        onClick={() => window.open(registrationLink, '_blank')}
      >Visit Link</button>
    </div>
  )
}
export default RegisterEvent
