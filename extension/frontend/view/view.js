import React from 'react';
import ReactDOM from 'react-dom';
import Container from './Container'


const App = () => {
  return (
    <div id="container-wrapper">
      <Container />
    </div>
  )
}
ReactDOM.render(<App />, document.getElementById('root'))

