import React, { useEffect, useState } from 'react'
import {motion, useScroll, useSpring, useMotionValueEvent} from "framer-motion"

const SineWave = ({isCircleClicked}) => {
  var path = "M 12 99 Q 29 62 50 100 T 89 99 T 125 99 T 160 98 T 194 97 T 230 97 T 269 96 T 307 93"
  var repeat = 5;

  for(let i = 0; i < repeat; i++){
    path = path + path;
  }
  return (
    <div 
      className='relative w-full'
      style = {{
        stroke: "#d7e1ed",
        top: '0%',
        left: '0%'
      }}
    >
      {console.log(isCircleClicked)}
      <motion.svg
        style = {{width: "100%", height: "100%"}}
        viewBox= "5 60 400 400"
        xmlns="http://www.w3.org/2000/svg" 
        initial = {{x: 0}}
        animate = {{x: [0, -50, -100, -144]}}
        transition = {{
          duration: 5,
          ease: "linear",
          repeat: Infinity,
          repeatType: "Loop"
        }}
      >
        <motion.path 
          initial = {{pathLength: 1}}
          animate = {{pathLength: 1}}
          exit = {{pathLength: 0}}
          transition = {{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
            repeatType: "Loop"
          }}
          stroke = {isCircleClicked ? "#FFFFFF" : "#000000"}
          strokeWidth={4}
          strokeDasharray= "0 1"
          fill = "none"
          d = {path}
        />
      </motion.svg>
    </div>
  )
}

export default SineWave