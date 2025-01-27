import React, { useEffect, useState } from 'react';
import SplitText from "./pages/SplitText";
import BlurText from "./pages/BlurText";
// import SplashCursor from './pages/SplashCursor'



const handleAnimationComplete = () => {
console.log('All letters have animated!');
};

const func = async () => {
  const response = await fetch('http://localhost:8000/api', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const data = await response.json();
  console.log(data);
  return JSON.stringify(data);
}

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    func().then(responseData => {
      setData(responseData);
    });
  }, []);

  return (
    <div>
      <SplitText
text="Hello, CBE!"
className="text-2xl font-semibold text-center"
delay={150}
animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
easing="easeOutCubic"
threshold={0.2}
rootMargin="-50px"
onLetterAnimationComplete={handleAnimationComplete}
/>

<BlurText
text="Isn't this so cool?!"
delay={150}
animateBy="words"
direction="top"
onAnimationComplete={handleAnimationComplete}
className="text-2xl mb-8"
/>
{/* <SplashCursor /> */}
      
    </div>
  );
}

export default App;







