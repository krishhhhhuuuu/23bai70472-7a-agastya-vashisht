function Demo(props) {
  return (
    <div>
      <h3>Child Component</h3>
      <p>Button clicked: {props.clicks} times</p>
    </div>
  );
}

export default Demo;
